'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScratchOffProps {
  onComplete: () => void
  children: React.ReactNode
  isCompleted: boolean
}

export default function ScratchOff({ onComplete, children, isCompleted }: ScratchOffProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [completed, setCompleted] = useState(isCompleted)

  useEffect(() => {
    if (completed || isCompleted) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions to match container exactly
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Draw the silver scratch-off layer
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#e5e7eb') // stone-200
    gradient.addColorStop(0.5, '#d6d3d1') // stone-300
    gradient.addColorStop(1, '#e5e7eb') // stone-200
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add some "scratch here" text pattern
    ctx.fillStyle = '#78716c' // stone-500
    ctx.font = 'bold 16px Nunito, Quicksand, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Gosok di sini! 🪙', canvas.width / 2, canvas.height / 2)

    // Set composition to erase for subsequent drawing
    ctx.globalCompositeOperation = 'destination-out'
  }, [completed, isCompleted])

  const checkCompletion = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let transparentPixels = 0

    // Check alpha channel (every 4th value)
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) {
        transparentPixels++
      }
    }

    const totalPixels = pixels.length / 4
    const percentage = (transparentPixels / totalPixels) * 100

    if (percentage > 50) {
      setCompleted(true)
      onComplete()
    }
  }

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2) // 20px brush radius
    ctx.fill()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true)
    scratch(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return
    scratch(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    checkCompletion()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDrawing(true)
    scratch(e.touches[0].clientX, e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault() // Prevent scrolling while scratching
    scratch(e.touches[0].clientX, e.touches[0].clientY)
  }

  return (
    <div ref={containerRef} className="relative inline-block w-full rounded-xl overflow-hidden min-h-[48px] bg-white dark:bg-zinc-800">
      <div className={`absolute inset-0 flex items-center p-3 transition-opacity duration-500 ${completed || isCompleted ? 'opacity-100' : 'opacity-30'}`}>
        {children}
      </div>
      
      <AnimatePresence>
        {(!completed && !isCompleted) && (
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
