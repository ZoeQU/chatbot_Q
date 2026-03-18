"""Doubao (Ark) API client via OpenAI-compatible interface.

We prefer the Responses API (matches Ark docs/examples), and fall back to Chat Completions
if needed.
"""
from __future__ import annotations

import asyncio
from typing import AsyncGenerator

from openai import AsyncOpenAI

from config import settings


def _client() -> AsyncOpenAI:
    if not settings.ark_api_key:
        raise ValueError("ARK_API_KEY is not set")
    return AsyncOpenAI(
        base_url=settings.doubao_base_url,
        api_key=settings.ark_api_key.strip(),
        timeout=settings.request_timeout_s,
    )

def _to_responses_input(messages: list[dict]) -> list[dict]:
    # Map our {role, content: str} into Responses API content blocks.
    out: list[dict] = []
    for m in messages:
        out.append(
            {
                "role": m["role"],
                "content": [{"type": "input_text", "text": m.get("content", "")}],
            }
        )
    return out


async def chat(
    messages: list[dict],
    *,
    stream: bool = True,
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> AsyncGenerator[str, None]:
    """Stream chat completion; yields content deltas."""
    client = _client()
    last_error = None
    for attempt in range(3):
        try:
            # Prefer Responses API (Ark examples use /responses).
            stream_obj = await client.responses.create(
                model=settings.doubao_model_id,
                input=_to_responses_input(messages),
                stream=True,
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            async for event in stream_obj:
                # SDK emits events like: response.output_text.delta
                if getattr(event, "type", None) == "response.output_text.delta":
                    delta = getattr(event, "delta", None)
                    if delta:
                        yield delta
                elif getattr(event, "type", None) == "error":
                    raise RuntimeError(str(getattr(event, "error", "Unknown error")))
            return
        except Exception as e:
            last_error = e
            # Fallback once to Chat Completions API in case endpoint doesn't support Responses API.
            try:
                stream_obj = await client.chat.completions.create(
                    model=settings.doubao_model_id,
                    messages=messages,
                    stream=True,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                async for chunk in stream_obj:
                    if not chunk.choices:
                        continue
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        yield delta.content
                return
            except Exception:
                pass
            if attempt < 2:
                await asyncio.sleep(1.0 * (attempt + 1))
    raise last_error


async def chat_sync(
    messages: list[dict],
    *,
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> str:
    """Non-streaming chat; returns full reply text."""
    client = _client()
    last_error = None
    for attempt in range(3):
        try:
            # Prefer Responses API.
            resp = await client.responses.create(
                model=settings.doubao_model_id,
                input=_to_responses_input(messages),
                stream=False,
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            # Concatenate any output_text blocks.
            output_texts: list[str] = []
            for item in getattr(resp, "output", []) or []:
                for content in getattr(item, "content", []) or []:
                    if getattr(content, "type", None) in ("output_text", "message"):
                        text = getattr(content, "text", None)
                        if text:
                            output_texts.append(text)
            if output_texts:
                return "".join(output_texts)
            # Fallback to chat.completions
            chat_resp = await client.chat.completions.create(
                model=settings.doubao_model_id,
                messages=messages,
                stream=False,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            if chat_resp.choices and chat_resp.choices[0].message:
                return chat_resp.choices[0].message.content or ""
            return ""
        except Exception as e:
            last_error = e
            if attempt < 2:
                await asyncio.sleep(1.0 * (attempt + 1))
    raise last_error
