"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Cloud, ArrowDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type UploadState = "idle" | "analyzing" | "complete"

export function UploadZone() {
  const [state, setState] = useState<UploadState>("idle")
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setState("analyzing")
    // Simulate AI analysis
    setTimeout(() => setState("complete"), 3000)
  }

  return (
    <Card
      className={cn(
        "glass-card rounded-2xl border-2 border-dashed transition-all",
        isDragOver ? "border-amber-300 bg-amber-300/5" : "border-slate-700/60",
        state === "analyzing" && "border-amber-300 bg-amber-400/10",
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-8">
        {state === "idle" && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/80">
              <Cloud className="h-6 w-6 text-slate-200" />
            </div>
            <ArrowDown className="my-2 h-4 w-4 text-slate-400" />
            <p className="text-center text-sm text-slate-300">Drag & drop your clothing here</p>
          </>
        )}

        {state === "analyzing" && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-400 to-red-500 p-2">
                <img src="/red-scarf.png" alt="Analyzing" className="h-full w-full object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400">
                <Loader2 className="h-3 w-3 animate-spin text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-50">AI is analyzing your clothing...</p>
              <p className="text-xs text-slate-400">This may take a moment.</p>
            </div>
          </div>
        )}

        {state === "complete" && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-700">Item added to wardrobe!</p>
            <button onClick={() => setState("idle")} className="text-xs text-primary hover:underline">
              Upload another
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
