"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Cloud, ArrowDown, X, Loader2, Check, Upload, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type UploadState = "idle" | "preview" | "uploading" | "analyzing" | "success" | "error"

interface FileUpload {
  id: string
  file: File
  preview: string
  status: "pending" | "uploading" | "analyzing" | "success" | "error"
  progress: number
  error?: string
  result?: any
}

interface UploadDropzoneProps {
  onUploadComplete?: (files: File[]) => void
  customerId?: string
}

export function UploadDropzone({ onUploadComplete, customerId = 'demo-customer' }: UploadDropzoneProps) {
  const [files, setFiles] = useState<FileUpload[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const images = Array.from(incoming).filter((f) => f.type.startsWith("image/"))
    const newUploads: FileUpload[] = images.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...newUploads])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files)
  }, [addFiles])

  const uploadSingle = async (upload: FileUpload): Promise<FileUpload> => {
    const { file } = upload
    setFiles((prev) => prev.map((f) => (f.id === upload.id ? { ...f, status: "uploading", progress: 10 } : f)))

    try {
      // Convert to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error("Failed to read image file"))
        reader.readAsDataURL(file)
      })

      setFiles((prev) => prev.map((f) => (f.id === upload.id ? { ...f, progress: 30 } : f)))

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("customerId", customerId)
      formData.append("fileName", file.name)

      const uploadRes = await fetch("/api/wardrobe/upload-cloudinary", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Cloudinary upload failed")
      const { url, publicId } = await uploadRes.json()

      setFiles((prev) => prev.map((f) => (f.id === upload.id ? { ...f, progress: 60 } : f)))

      // AI analysis
      setFiles((prev) => prev.map((f) => (f.id === upload.id ? { ...f, status: "analyzing", progress: 80 } : f)))

      const aiRes = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: base64Image,
          imageUrl: url,
          customerId,
        }),
      })

      if (!aiRes.ok) throw new Error("AI analysis failed")
      const { data } = await aiRes.json()

      // Save to wardrobe
      const saveRes = await fetch("/api/wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!saveRes.ok) {
        console.warn("Failed to save to wardrobe")
      }

      return { ...upload, status: "success", progress: 100, result: data }
    } catch (err: any) {
      return { ...upload, status: "error", progress: 0, error: err.message || "Upload failed" }
    }
  }

  const handleUploadAll = async () => {
    const pending = files.filter((f) => f.status === "pending")
    if (!pending.length) return

    setIsProcessing(true)
    const results: FileUpload[] = []
    for (const upload of pending) {
      const updated = await uploadSingle(upload)
      results.push(updated)
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    }
    setIsProcessing(false)

    const succeeded = results.filter((r) => r.status === "success")
    if (succeeded.length && onUploadComplete) {
      onUploadComplete(succeeded.map((s) => s.file))
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  const reset = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview))
    setFiles([])
  }

  const hasPending = files.some((f) => f.status === "pending")
  const hasProcessing = files.some((f) => f.status === "uploading" || f.status === "analyzing")
  const hasSuccess = files.some((f) => f.status === "success")

  const renderIdle = () => (
    <>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Cloud className="h-7 w-7 text-slate-400" />
      </div>
      <ArrowDown className="mb-2 h-4 w-4 text-slate-300" />
      <p className="mb-1 text-center font-medium text-foreground">Drag & drop clothing images</p>
      <p className="mb-3 text-center text-sm text-muted-foreground">or click to browse files</p>
      <label>
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
        <Button variant="outline" className="rounded-xl bg-transparent" asChild>
          <span>Browse Files</span>
        </Button>
      </label>
    </>
  )

  const renderFileList = () => (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{files.length} image(s) selected</p>
        <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs">
          <Trash2 className="mr-1 h-3 w-3" />
          Clear all
        </Button>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {files.map((upload) => (
          <div key={upload.id} className="flex items-center gap-3 rounded-lg border p-2">
            <img src={upload.preview} alt="" className="h-10 w-10 rounded object-cover" />
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{upload.file.name}</p>
              <div className="mt-1">
                {upload.status === "pending" && <div className="h-1 rounded bg-slate-200" />}
                {upload.status === "uploading" && <Progress value={upload.progress} className="h-1" />}
                {upload.status === "analyzing" && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing...
                  </div>
                )}
                {upload.status === "success" && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3 w-3" />
                    Ready
                  </div>
                )}
                {upload.status === "error" && (
                  <div className="text-xs text-destructive">{upload.error}</div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(upload.id)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleUploadAll} disabled={!hasPending || hasProcessing} className="flex-1 rounded-xl">
          {hasProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload All
            </>
          )}
        </Button>
        <label>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
          <Button variant="outline" className="rounded-xl" asChild>
            <span>Add More</span>
          </Button>
        </label>
      </div>
    </div>
  )

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all",
        isDragOver && "border-primary bg-primary/5",
        files.length > 0 ? "border-solid border-border/50" : "border-border/50 hover:border-border",
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-8">
        {files.length === 0 ? renderIdle() : renderFileList()}
      </CardContent>
    </Card>
  )
}