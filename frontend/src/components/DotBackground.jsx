import { useEffect, useRef } from 'react'

const DOT_SPACING = 28
const DOT_RADIUS = 1.5
const INFLUENCE_RADIUS = 130
const BASE_ALPHA = 0.08
const HOVER_ALPHA = 0.55

export default function DotBackground() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { x: mx, y: my } = mouseRef.current

      for (let x = DOT_SPACING / 2; x < canvas.width; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < canvas.height; y += DOT_SPACING) {
          const dist = Math.hypot(x - mx, y - my)
          const t = Math.max(0, 1 - dist / INFLUENCE_RADIUS)
          // smoothstep para transición suave
          const eased = t * t * (3 - 2 * t)
          const alpha = BASE_ALPHA + (HOVER_ALPHA - BASE_ALPHA) * eased

          ctx.beginPath()
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(128, 0, 0, ${alpha.toFixed(3)})`
          ctx.fill()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
