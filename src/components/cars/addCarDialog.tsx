"use client"

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Upload, Loader2, Trash2 } from "lucide-react"
import type { VehicleFormData } from "@/hooks/cars/useAddCars"
import {
  useAddCarDialog,
  carTypes,
  transmissionTypes,
  fuelTypes,
  availableFeatures,
} from "@/hooks/cars/useAddCarDialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"

interface AddCarDialogProps {
  onSubmit: (formData: VehicleFormData, imageOperations?: { removedImageIds: number[], newImages: File[] }) => Promise<void>
  isLoading: boolean
  onAlert?: (message: string, variant: "default" | "destructive" | "success" | "warning" | "info") => void
  externalOpen?: boolean
  onOpenChange?: (open: boolean) => void
  initialFormData?: Partial<VehicleFormData>
  mode?: "create" | "edit"
  hideTrigger?: boolean
  existingImages?: Array<{ vehicle_image_id: number; url: string }>
}

export function AddCarDialog({ onSubmit, isLoading, onAlert, externalOpen, onOpenChange, initialFormData, mode = "create", hideTrigger, existingImages }: AddCarDialogProps) {
  // Local copy of existing images for edit mode so user can remove selections visually
  const [existingImageObjects, setExistingImageObjects] = React.useState<Array<{ vehicle_image_id: number; url: string }>>([])
  const getExistingCount = React.useCallback(() => existingImageObjects.length, [existingImageObjects.length])
  const {
    open,
    setOpen,
    formData,
    errors,
    setField,
    handleSubmit,
    updateField,
    handleFeatureChange,
    handleImageUpload,
    validateAll,
    resetForm,
  } = useAddCarDialog({ onSubmit, onAlert, mode, getExistingImagesCount: getExistingCount })

  // Support controlled open state when provided
  const dialogOpen = typeof externalOpen === 'boolean' ? externalOpen : open
  const setDialogOpen = typeof onOpenChange === 'function' ? onOpenChange : setOpen

  // Prefill when initial form data is provided
  const prefillKey = React.useMemo(() => JSON.stringify(initialFormData ?? {}), [initialFormData])
  const appliedPrefillKeyRef = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (!dialogOpen) return
    if (!initialFormData) return
    if (appliedPrefillKeyRef.current === prefillKey) return
    const entries = Object.entries(initialFormData)
    if (entries.length === 0) return
    for (const [key, value] of entries) {
      const k = key as keyof VehicleFormData
      if (k === "features" && Array.isArray(value)) {
        updateField("features", value as string[])
      } else if (k === "images" && Array.isArray(value)) {
        updateField("images", value as File[])
      } else if (typeof value === "string") {
        updateField(k, value)
      }
    }
    appliedPrefillKeyRef.current = prefillKey
  }, [dialogOpen, prefillKey, initialFormData, updateField])

  React.useEffect(() => {
    if (!dialogOpen) return
    if (Array.isArray(existingImages)) setExistingImageObjects(existingImages)
  }, [dialogOpen, existingImages])

  // Stable object URLs for newly selected images to avoid flashing on re-renders
  const [newImagePreviewUrls, setNewImagePreviewUrls] = React.useState<string[]>([])
  React.useEffect(() => {
    const urls = formData.images.map((file) => URL.createObjectURL(file))
    setNewImagePreviewUrls(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [formData.images])

  // Disable submit when required fields are empty, errors exist, or image minimum isn't met
  const hasEmptyRequiredFields = React.useMemo(() => {
    const requiredFields = [
      "brand",
      "model",
      "type",
      "plate_number",
      "description",
      "year",
      "seats",
      "rate_per_day",
      "transmission",
      "fuel_type",
    ] as const
    return requiredFields.some((field) => String((formData[field] as string) ?? "").trim() === "")
  }, [formData])

  const hasErrors = React.useMemo(() => Object.values(errors).some(Boolean), [errors])

  const doesNotMeetImageMinimum = React.useMemo(() => {
    if (mode === "edit") return (existingImageObjects.length + formData.images.length) < 3
    return formData.images.length < 3
  }, [mode, existingImageObjects.length, formData.images.length])

  const isSubmitDisabled = isLoading || hasEmptyRequiredFields || hasErrors || doesNotMeetImageMinimum

  const removeNewImageAt = (idx: number) => {
    const next = [...formData.images]
    next.splice(idx, 1)
    updateField("images", next)
  }

  // Confirmation dialog for submit without closing parent dialog
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement | null>(null)
  const openConfirmAndStay = () => setConfirmOpen(true)

  // Custom submit handler that includes image operations
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!validateAll()) {
        onAlert?.("Please fix the highlighted errors.", "destructive")
        return
      }

      // Calculate image operations for edit mode
      let imageOperations: { removedImageIds: number[], newImages: File[] } | undefined
      if (mode === 'edit' && existingImages) {
        const removedImageIds = existingImages
          .filter(original => !existingImageObjects.some(current => current.vehicle_image_id === original.vehicle_image_id))
          .map(img => img.vehicle_image_id)
        
        imageOperations = {
          removedImageIds,
          newImages: formData.images
        }
      }

      await onSubmit(formData, imageOperations)
      setDialogOpen(false)
      resetForm()
      onAlert?.("Vehicle updated successfully", "success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update vehicle"
      onAlert?.(message, "destructive")
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button size="lg" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Car' : 'Add New Car'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update the details of your car.' : "Fill in the details to add a new car to your fleet."}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleCustomSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setField("brand", e.target.value)}
                placeholder="e.g., Toyota, Honda, BMW"
                aria-invalid={!!errors.brand}
              />
              {errors.brand && <p className="text-xs text-destructive mt-1">{errors.brand}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setField("model", e.target.value)}
                placeholder="e.g., Fortuner, Civic, X5"
                aria-invalid={!!errors.model}
              />
              {errors.model && <p className="text-xs text-destructive mt-1">{errors.model}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Car Type</Label>
            <Select value={formData.type} onValueChange={(value) => setField("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose car type" />
              </SelectTrigger>
              <SelectContent>
                {carTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem> 
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive mt-1">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plate_number">Plate Number</Label>
              <Input
              id="plate_number"
              value={formData.plate_number}
              onChange={(e) => setField("plate_number", e.target.value)}
              placeholder="e.g., ABC-1234"
              aria-invalid={!!errors.plate_number}
            />
            {errors.plate_number && <p className="text-xs text-destructive mt-1">{errors.plate_number}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe your car's key features and ideal use cases (e.g., Spacious SUV perfect for family trips with excellent fuel economy)"
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setField("year", e.target.value)}
                placeholder="e.g., 2022"
                aria-invalid={!!errors.year}
              />
              {errors.year && <p className="text-xs text-destructive mt-1">{errors.year}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                value={formData.seats}
                onChange={(e) => setField("seats", e.target.value)}
                placeholder="e.g., 5 or 7"
                aria-invalid={!!errors.seats}
              />
              {errors.seats && <p className="text-xs text-destructive mt-1">{errors.seats}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate_per_day">Rate per Day</Label>
              <Input
                id="rate_per_day"
                value={formData.rate_per_day}
                onChange={(e) => setField("rate_per_day", e.target.value)}
                placeholder="e.g., 3500.00 (₱)"
                aria-invalid={!!errors.rate_per_day}
              />
              {errors.rate_per_day && <p className="text-xs text-destructive mt-1">{errors.rate_per_day}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Select value={formData.transmission} onValueChange={(value) => setField("transmission", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose transmission type" />
                </SelectTrigger>
                <SelectContent>
                  {transmissionTypes.map((transmission) => (
                    <SelectItem key={transmission} value={transmission}>
                      {transmission.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.transmission && <p className="text-xs text-destructive mt-1">{errors.transmission}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Select value={formData.fuel_type} onValueChange={(value) => setField("fuel_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuel) => (
                    <SelectItem key={fuel} value={fuel}>
                      {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fuel_type && <p className="text-xs text-destructive mt-1">{errors.fuel_type}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Features</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={formData.features.includes(feature)}
                    onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                  />
                  <Label htmlFor={feature} className="text-sm font-normal">
                    {feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Images</Label>
            <div className="flex items-center gap-2">
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("images")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {mode === 'edit' ? 'Upload More Images' : `Upload Images (${formData.images.length} selected)`}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">JPG/PNG/GIF supported. Minimum 3 images required.</p>
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Currently counting {existingImageObjects.length} existing + {formData.images.length} new.</p>
            )}
            {errors.images && <p className="text-xs text-destructive mt-1">{errors.images}</p>}
            {(mode === 'edit' ? (existingImageObjects.length > 0 || formData.images.length > 0) : formData.images.length > 0) && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {mode === 'edit' && existingImageObjects.map((imageObj, index) => (
                  <div key={`existing-${imageObj.vehicle_image_id}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={imageObj.url || "/placeholder.svg"}
                      alt={`Existing car image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-black/60 text-white"
                      onClick={() => setExistingImageObjects((prev) => prev.filter((_, i) => i !== index))}
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {formData.images.map((_, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={newImagePreviewUrls[index] || "/placeholder.svg"}
                      alt={`Car image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-black/60 text-white"
                      onClick={() => removeNewImageAt(index)}
                      aria-label="Remove selected image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={openConfirmAndStay}
              disabled={isSubmitDisabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'edit' ? 'Saving Changes...' : 'Adding Car...'}
                </>
              ) : (
                mode === 'edit' ? 'Save Changes' : 'Add Car'
              )}
            </Button>
          </div>
        </form>

        <ConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={mode === 'edit' ? 'Confirm Save' : 'Confirm Add Car'}
          description={mode === 'edit' ? 'Are you sure you want to save these changes?' : 'Are you sure you want to add this car to your fleet?'}
          confirmText={mode === 'edit' ? 'Yes, Save' : 'Yes, Add Car'}
          cancelText="Cancel"
          onConfirm={() => formRef.current?.requestSubmit()}
        />
      </DialogContent>
    </Dialog>
  )
}
