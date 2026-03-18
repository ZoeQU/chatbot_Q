import { useEffect, useMemo, useRef } from 'react'
import { useChatStore } from '../../stores/chatStore'

function drawPixel(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.fillRect(x * size, y * size, size, size)
}

function clear(ctx, width, height, background) {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)
}

function drawFace(ctx, frame, emotion) {
  // 16x16 pixel character, scaled up.
  const eye = emotion === 'error' ? '#ff6b6b' : '#e0e0e0'
  const body = '#16c784'
  const dark = '#0b0b18'
  const panel = '#2a2a4a'

  // Head box
  for (let y = 3; y <= 10; y++) {
    for (let x = 4; x <= 11; x++) {
      drawPixel(ctx, x, y, 8, panel)
    }
  }
  // Border
  for (let x = 4; x <= 11; x++) {
    drawPixel(ctx, x, 3, 8, dark)
    drawPixel(ctx, x, 10, 8, dark)
  }
  for (let y = 3; y <= 10; y++) {
    drawPixel(ctx, 4, y, 8, dark)
    drawPixel(ctx, 11, y, 8, dark)
  }

  // Eyes (blink every 12 frames)
  const blink = frame % 12 === 0
  if (!blink) {
    drawPixel(ctx, 6, 6, 8, eye)
    drawPixel(ctx, 9, 6, 8, eye)
  } else {
    drawPixel(ctx, 6, 7, 8, eye)
    drawPixel(ctx, 9, 7, 8, eye)
  }

  // Mouth
  if (emotion === 'talking') {
    const open = frame % 2 === 0
    drawPixel(ctx, 7, 8, 8, eye)
    drawPixel(ctx, 8, 8, 8, eye)
    if (open) {
      drawPixel(ctx, 7, 9, 8, eye)
      drawPixel(ctx, 8, 9, 8, eye)
    }
  } else if (emotion === 'happy') {
    drawPixel(ctx, 7, 8, 8, eye)
    drawPixel(ctx, 8, 8, 8, eye)
    drawPixel(ctx, 6, 9, 8, eye)
    drawPixel(ctx, 9, 9, 8, eye)
  } else if (emotion === 'error') {
    drawPixel(ctx, 7, 9, 8, eye)
    drawPixel(ctx, 8, 9, 8, eye)
  } else {
    drawPixel(ctx, 7, 9, 8, eye)
    drawPixel(ctx, 8, 9, 8, eye)
  }

  // Body
  drawPixel(ctx, 7, 11, 8, body)
  drawPixel(ctx, 8, 11, 8, body)
  drawPixel(ctx, 7, 12, 8, body)
  drawPixel(ctx, 8, 12, 8, body)
}

export default function CharacterCanvas() {
  const canvasRef = useRef(null)
  const emotion = useChatStore((s) => s.characterEmotion)

  const label = useMemo(() => {
    if (emotion === 'thinking') return 'thinking...'
    if (emotion === 'talking') return 'talking'
    if (emotion === 'happy') return 'happy'
    if (emotion === 'error') return 'error'
    return 'idle'
  }, [emotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    const width = canvas.width
    const height = canvas.height
    const background = '#111125'

    let animationFrameId = 0
    let frame = 0
    let lastTick = performance.now()

    const tick = (t) => {
      animationFrameId = requestAnimationFrame(tick)
      const elapsed = t - lastTick
      if (elapsed < 125) return // ~8 FPS
      lastTick = t
      frame += 1

      clear(ctx, width, height, background)

      // floating offset
      let offsetY = 0
      if (emotion === 'idle') offsetY = frame % 16 < 8 ? 0 : 1
      if (emotion === 'thinking') offsetY = frame % 8 < 4 ? 1 : 0
      if (emotion === 'happy') offsetY = frame % 6 < 3 ? -1 : 0
      if (emotion === 'error') offsetY = frame % 4 < 2 ? 0 : 1

      ctx.save()
      ctx.translate(0, offsetY * 4)
      drawFace(ctx, frame, emotion)
      ctx.restore()

      // tiny dots for thinking
      if (emotion === 'thinking') {
        const dotColor = '#e0e0e0'
        const phase = frame % 6
        if (phase >= 1) drawPixel(ctx, 6, 2, 8, dotColor)
        if (phase >= 3) drawPixel(ctx, 8, 2, 8, dotColor)
        if (phase >= 5) drawPixel(ctx, 10, 2, 8, dotColor)
      }

      // heart for happy
      if (emotion === 'happy') {
        const c = '#ff6b6b'
        drawPixel(ctx, 3, 3, 8, c)
        drawPixel(ctx, 4, 3, 8, c)
        drawPixel(ctx, 3, 4, 8, c)
        drawPixel(ctx, 4, 4, 8, c)
        drawPixel(ctx, 3, 5, 8, c)
        drawPixel(ctx, 4, 5, 8, c)
        drawPixel(ctx, 4, 6, 8, c)
      }
    }

    animationFrameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrameId)
  }, [emotion])

  return (
    <div className="rounded-xl bg-pm-panel/70 p-3 shadow-pixel">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-pixel text-xs">小西</div>
        <div className="text-xs text-zinc-400">{label}</div>
      </div>
      <div className="flex items-center justify-center rounded-xl bg-black/25 p-3">
        <canvas
          ref={canvasRef}
          width={128}
          height={128}
          className="pixelated h-40 w-40 rounded-lg bg-pm-panel shadow-pixel"
        />
      </div>
    </div>
  )
}

