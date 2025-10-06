"use client"

import type React from "react"
import Image from "next/image"

import { useState, useMemo, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, X, FileIcon } from "lucide-react"
import { registrationService, type RegistrationData } from "@/services/registrationService"
import { useNotification } from "@/components/NotificationProvider"
import { cn } from "@/lib/utils"

interface DocumentUploadDialogProps {
  children?: React.ReactNode
  vehicleId: number
  onAlert?: (message: string, variant: "default" | "destructive" | "success" | "warning" | "info") => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DocumentUploadDialog({ children, vehicleId, onAlert, open, onOpenChange }: DocumentUploadDialogProps) {
  const isControlled = useMemo(() => typeof open === "boolean" && typeof onOpenChange === "function", [open, onOpenChange])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const dialogOpen = isControlled ? (open as boolean) : isDialogOpen
  const setDialogOpen = isControlled ? (onOpenChange as (o: boolean) => void) : setIsDialogOpen
  const [originalReceipt, setOriginalReceipt] = useState<File | null>(null)
  const [certificateOfRegistration, setCertificateOfRegistration] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error, info } = useNotification()

  const showAlert = (message: string, variant: "default" | "destructive" | "success" | "warning" | "info" = "default") => {
    if (onAlert) {
      onAlert(message, variant)
      return
    }
    if (variant === "success") {
      success(message)
    } else if (variant === "destructive") {
      error(message)
    } else {
      info(message)
    }
  }

  const handleSubmitDocuments = async () => {
    if (!originalReceipt || !certificateOfRegistration) {
      showAlert("Please select both required documents", "destructive")
      return
    }

    setIsSubmitting(true)
    try {
      const registrationData: RegistrationData = {
        vehicleId,
        originalReceipt,
        certificateOfRegistration,
      }

      const response = await registrationService.submitRegistration(registrationData)
      
      showAlert(response.message || "Documents submitted successfully!", "success")
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error submitting documents:", error)
      showAlert(error instanceof Error ? error.message : "Failed to submit documents", "destructive")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setOriginalReceipt(null)
    setCertificateOfRegistration(null)
  }

  const handleCancel = () => {
    setDialogOpen(false)
    resetForm()
  }

  interface FileUploadProps {
    id: string
    label: string
    accept?: string
    file: File | null
    onFileChange: (file: File | null) => void
    required?: boolean
    disabled?: boolean
  }

  const FileUpload = ({ id, label, accept = ".pdf,.jpg,.jpeg,.png", file, onFileChange, required, disabled }: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Ensure preview is generated when a file is already present (or changes) from parent state
    useEffect(() => {
      if (!file) {
        setPreview(null)
        return
      }
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }, [file])

    const handleDragOver = (e: React.DragEvent) => {
      if (disabled) return
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = () => {
      if (disabled) return
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      if (disabled) return
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) {
        handleFile(droppedFile)
      }
    }

    const handleFile = (selectedFile: File) => {
      onFileChange(selectedFile)
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result as string)
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) handleFile(selectedFile)
    }

    const handleRemove = () => {
      onFileChange(null)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ""
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
              "hover:border-primary/50 hover:bg-accent/50",
              disabled ? "opacity-60 cursor-not-allowed" : isDragging ? "border-primary bg-accent" : "border-border",
            )}
          >
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drop your file here, or <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              required={required}
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-accent/50">
            <div className="flex items-start gap-3">
              {preview ? (
                <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0 bg-background">
                  <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="h-16 w-16 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileIcon className="h-8 w-8 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatFileSize(file.size)}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={handleRemove} className="flex-shrink-0 h-8 w-8" disabled={disabled}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Required Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <FileUpload
              id="original-receipt"
              label="Original Receipt"
              accept=".pdf,.jpg,.jpeg,.png"
              file={originalReceipt}
              onFileChange={setOriginalReceipt}
              required
              disabled={isSubmitting}
            />

            <FileUpload
              id="certificate-registration"
              label="Certificate of Registration"
              accept=".pdf,.jpg,.jpeg,.png"
              file={certificateOfRegistration}
              onFileChange={setCertificateOfRegistration}
              required
              disabled={isSubmitting}
            />

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel} className="flex-1" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDocuments}
                disabled={!originalReceipt || !certificateOfRegistration || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Documents"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
