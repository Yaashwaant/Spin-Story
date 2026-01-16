"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Cloud, ArrowDown, X, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type UploadState = "idle" | "preview" | "uploading" | "analyzing" | "success" | "error"

interface UploadDropzoneProps {
  onUploadComplete?: (file: File) => void
}

export function UploadDropzone({ onUploadComplete }: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>("idle")
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setState("error")
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setSelectedFile(file)
    setState("preview")
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleUpload = useCallback(() => {
    setState("uploading")
    setProgress(0)

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setState("analyzing")
          // Simulate AI analysis
          setTimeout(() => {
            setState("success")
            if (selectedFile) {
              onUploadComplete?.(selectedFile)
            }
          }, 2000)
          return 100
        }
        return prev + 20
      })
    }, 300)
  }, [selectedFile, onUploadComplete])

  const handleReset = useCallback(() => {
    setState("idle")
    setPreviewUrl(null)
    setSelectedFile(null)
    setProgress(0)
  }, [])

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all",
        isDragOver && "border-primary bg-primary/5",
        state === "idle" && "border-border/50 hover:border-border",
        state === "error" && "border-destructive bg-destructive/5",
        (state === "preview" || state === "uploading" || state === "analyzing" || state === "success") &&
          "border-solid border-border/50",
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-8">
        {/* Idle State */}
        {state === "idle" && (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Cloud className="h-7 w-7 text-slate-400" />
            </div>
            <ArrowDown className="mb-2 h-4 w-4 text-slate-300" />
            <p className="mb-1 text-center font-medium text-foreground">Drag & drop clothing image</p>
            <p className="mb-3 text-center text-sm text-muted-foreground">or click to browse files</p>
            <label>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              <Button variant="outline" className="rounded-xl bg-transparent" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </>
        )}

        {/* Preview State */}
        {state === "preview" && previewUrl && (
          <div className="w-full max-w-xs">
            <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-slate-50">
              <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                onClick={handleReset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button className="w-full rounded-xl bg-primary text-primary-foreground" onClick={handleUpload}>
              Upload & Analyze
            </Button>
          </div>
        )}

        {/* Uploading State */}
        {state === "uploading" && (
          <div className="w-full max-w-xs">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="mb-3 text-center font-medium text-foreground">Uploading...</p>
            <Progress value={progress} className="h-2 rounded-full" />
            <p className="mt-2 text-center text-sm text-muted-foreground">{progress}%</p>
          </div>
        )}

        {/* Analyzing State */}
        {state === "analyzing" && (
          <div className="text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mx-auto">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
            <p className="font-medium text-foreground">AI is analyzing your clothing...</p>
            <p className="mt-1 text-sm text-muted-foreground">Detecting type, color, and style</p>
          </div>
        )}

        {/* Success State */}
        {state === "success" && (
          <div className="text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="font-medium text-green-700">Successfully added to wardrobe!</p>
            <Button variant="link" className="mt-2 text-primary" onClick={handleReset}>
              Upload another item
            </Button>
          </div>
        )}

        {/* Error State */}
        {state === "error" && (
          <div className="text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <p className="font-medium text-destructive">Upload failed</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try again with a valid image file</p>
            <Button variant="outline" className="mt-4 rounded-xl bg-transparent" onClick={handleReset}>
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
