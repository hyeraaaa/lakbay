"use client"

import type React from "react"
import { useState } from "react"
import { useVehicleForm, type VehicleFormData } from "@/hooks/cars/useAddCars"

export const carTypes = ["sedan", "suv", "truck", "van", "luxury", "electric", "hybrid"] as const
export const transmissionTypes = [
  "manual",
  "automatic",
  "cvt",
  "amt",
  "dct",
  "tiptronic",
  "single speed",
] as const
export const fuelTypes = ["gasoline", "diesel", "electric", "hybrid"] as const
export const codingDays = ["NONE", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const
export const availableFeatures = [
  "aircon",
  "gps",
  "bluetooth",
  "usb_charging",
  "wifi",
  "sunroof",
  "leather_seats",
  "backup_camera",
  "parking_sensors",
  "cruise_control",
] as const

export type AlertVariant = "default" | "destructive" | "success" | "warning" | "info"

export interface UseAddCarDialogParams {
  onSubmit: (formData: VehicleFormData) => Promise<void>
  onAlert?: (message: string, variant: AlertVariant) => void
  initialOpen?: boolean
  mode?: "create" | "edit"
  getExistingImagesCount?: () => number
}

export function useAddCarDialog(params: UseAddCarDialogParams) {
  const { onSubmit, onAlert, initialOpen, mode = "create", getExistingImagesCount } = params
  const [open, setOpen] = useState<boolean>(!!initialOpen)
  const { formData, updateField, handleFeatureChange, handleImageUpload, resetForm } = useVehicleForm()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validators = {
    brand: (v: string) => (v?.trim() ? "" : "Brand is required"),
    model: (v: string) => (v?.trim() ? "" : "Model is required"),
    type: (v: string) => (carTypes.includes(v as typeof carTypes[number]) ? "" : "Invalid vehicle type"),
    plate_number: (v: string) => (/^[A-Z0-9-]+$/.test(v) ? "" : "Plate must be uppercase letters, numbers, and hyphens"),
    description: (v: string) => (v?.trim() ? "" : "Description is required"),
    year: (v: string) => {
      const n = Number.parseInt(v, 10)
      const max = new Date().getFullYear()
      return Number.isInteger(n) && n >= 1900 && n <= max ? "" : `Year must be between 1900 and ${max}`
    },
    seats: (v: string) => {
      const n = Number.parseInt(v, 10)
      return Number.isInteger(n) && n >= 1 ? "" : "Seats must be a positive integer"
    },
    rate_per_day: (v: string) => {
      const n = Number.parseFloat(v)
      return !Number.isNaN(n) && n > 0 ? "" : "Rate per day must be greater than 0"
    },
    transmission: (v: string) => (transmissionTypes.includes(v.toLowerCase() as typeof transmissionTypes[number]) ? "" : "Invalid transmission type"),
    fuel_type: (v: string) => (!v || fuelTypes.includes(v as typeof fuelTypes[number]) ? "" : "Invalid fuel type"),
  } as const

  const setField = (field: keyof typeof validators | keyof VehicleFormData, value: string) => {
    const normalized = field === "plate_number" ? value.toUpperCase() : value
    updateField(field as keyof VehicleFormData, normalized)

    if (validators[field as keyof typeof validators]) {
      const err = validators[field as keyof typeof validators](normalized)
      setErrors((prev) => ({ ...prev, [field]: err }))
    }
  }

  const validateAll = (): boolean => {
    const toValidate: Array<keyof typeof validators> = [
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
    ]
    const nextErrors: Record<string, string> = {}
    for (const f of toValidate) {
      const val = formData[f] as string
      const err = validators[f](val)
      if (err) nextErrors[f] = err
    }
    if (mode === "create") {
      const existing = typeof getExistingImagesCount === 'function' ? getExistingImagesCount() : 0
      const total = (formData.images?.length || 0) + existing
      if (total < 3) {
        nextErrors.images = "Please upload at least 3 images"
      }
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!validateAll()) {
        onAlert?.("Please fix the highlighted errors.", "destructive")
        return
      }
      await onSubmit(formData)
      setOpen(false)
      resetForm()
      onAlert?.("Vehicle created successfully", "success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create vehicle"
      onAlert?.(message, "destructive")
    }
  }

  return {
    // ui state
    open,
    setOpen,
    // form state
    formData,
    errors,
    setField,
    validateAll,
    handleSubmit,
    updateField,
    handleFeatureChange,
    handleImageUpload,
    resetForm,
  }
}


