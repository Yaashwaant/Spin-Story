"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UploadDropzone } from "@/components/wardrobe/upload-dropzone"
import { Plus } from "lucide-react"

interface CustomerUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
  onUploadComplete?: () => void
}

export function CustomerUploadModal({ 
  open, 
  onOpenChange, 
  customerId, 
  customerName,
  onUploadComplete 
}: CustomerUploadModalProps) {
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleUploadComplete = () => {
    setUploadComplete(true)
    onUploadComplete?.()
    // Close modal after a short delay to show success
    setTimeout(() => {
      onOpenChange(false)
      setUploadComplete(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Wardrobe Item</DialogTitle>
          <DialogDescription>
            Upload a clothing image for {customerName} (ID: {customerId})
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <UploadDropzone 
            customerId={customerId}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}