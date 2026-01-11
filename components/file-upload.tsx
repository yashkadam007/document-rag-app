"use client"

import { useId, useRef, useState } from "react"
import { useDocuments } from "@/hooks/use-documents"
import { Button } from "@/components/ui/button"
import { Upload, X, File } from "lucide-react"
import { formatFileSize } from "@/lib/utils"

interface FileUploadProps {
  chatId: string
}

export function FileUpload({ chatId }: FileUploadProps) {
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { documents, uploadDocument, uploadDocumentLoading, uploadDocumentError, deleteDocument } = useDocuments(chatId)

  const handleFileSelect = (file: File) => {
    uploadDocument(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-border"
          }`}
      >
        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          aria-label="Upload document file"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileSelect(e.target.files[0])
            }
          }}
          className="hidden"
        />

        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-2">Drag and drop your file here</p>
        <p className="text-xs text-muted-foreground mb-4">or</p>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploadDocumentLoading} size="sm">
          Choose File
        </Button>
      </div>

      {uploadDocumentError && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {uploadDocumentError instanceof Error ? uploadDocumentError.message : "Failed to upload file"}
        </div>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Documents</h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteDocument(doc.id)}
                  className="p-1 hover:bg-destructive/20 rounded flex-shrink-0"
                  aria-label={`Delete ${doc.filename}`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
