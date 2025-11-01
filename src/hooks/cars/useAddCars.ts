"use client"

import { useState, useEffect, useCallback } from "react"
import { vehicleService, type VehicleData, type VehicleResponse } from "@/services/vehicleServices"
import { useJWT } from "@/contexts/JWTContext"

export interface VehicleFormData {
  brand: string
  model: string
  type: string
  plate_number: string
  description: string
  year: string
  seats: string
  rate_per_day: string
  transmission: string
  fuel_type: string
  features: string[]
  coding: string
  images: File[]
}

const initialFormData: VehicleFormData = {
  brand: "",
  model: "",
  type: "",
  plate_number: "",
  description: "",
  year: "",
  seats: "",
  rate_per_day: "",
  transmission: "",
  fuel_type: "",
  features: [],
  coding: "",
  images: [],
}

export type VehicleServerFilters = {
  availability?: 'available' | 'unavailable'
  is_registered?: boolean
  q?: string
  type?: string
}

export function useVehicles(initialFilters?: VehicleServerFilters) {
  const { user } = useJWT()
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [allVehicles, setAllVehicles] = useState<VehicleResponse[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [isLoadingAllVehicles, setIsLoadingAllVehicles] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [filters, setFilters] = useState<VehicleServerFilters>(initialFilters || {})

  const fetchVehicles = useCallback(async () => {
    if (!user) return

    try {
      setIsLoadingVehicles(true)
      const query: Record<string, string | number | boolean | undefined> = {
        availability: filters.availability,
        is_registered: typeof filters.is_registered === 'boolean' ? filters.is_registered : undefined,
        q: filters.q,
        type: filters.type,
      }
      const filtered = await vehicleService.getMyVehicles(query)
      setVehicles(filtered)
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setIsLoadingVehicles(false)
    }
  }, [user, filters])

  const createVehicle = async (formData: VehicleFormData) => {
    setIsCreating(true)

    try {
      console.log("Creating vehicle with data:", formData)
      
      
      // Validate required fields
      if (
        !formData.brand ||
        !formData.model ||
        !formData.type ||
        !formData.plate_number ||
        !formData.description ||
        !formData.year ||
        !formData.seats ||
        !formData.rate_per_day ||
        !formData.transmission ||
        !formData.fuel_type
      ) {
        const missingFields = []
        if (!formData.brand) missingFields.push("brand")
        if (!formData.model) missingFields.push("model")
        if (!formData.type) missingFields.push("type")
        if (!formData.plate_number) missingFields.push("plate_number")
        if (!formData.description) missingFields.push("description")
        if (!formData.year) missingFields.push("year")
        if (!formData.seats) missingFields.push("seats")
        if (!formData.rate_per_day) missingFields.push("rate_per_day")
        if (!formData.transmission) missingFields.push("transmission")
        if (!formData.fuel_type) missingFields.push("fuel_type")
        
        throw new Error(`Please fill in all required fields. Missing: ${missingFields.join(", ")}`)
      }

      // Prepare vehicle data
      const vehicleData: VehicleData = {
        description: formData.description,
        plate_number: formData.plate_number.toUpperCase(),
        model: formData.model,
        brand: formData.brand,
        type: formData.type as VehicleData["type"],
        year: Number.parseInt(formData.year),
        seats: Number.parseInt(formData.seats),
        rate_per_day: Number.parseFloat(formData.rate_per_day),
        transmission: formData.transmission as VehicleData["transmission"],
        fuel_type: formData.fuel_type as VehicleData["fuel_type"],
        features: formData.features,
        coding: (formData.coding || undefined) as VehicleData["coding"],
      }

      // Require at least 3 images before creating the vehicle
      if ((formData.images?.length || 0) < 3) {
        throw new Error("Please upload at least 3 images (minimum required: 3)")
      }

      // Create vehicle
      const newVehicle = await vehicleService.createVehicle(vehicleData)

      // Upload images if any
      if (formData.images.length > 0) {
        await vehicleService.uploadVehicleImages(newVehicle.vehicle_id, formData.images)
      }

      // Refresh vehicles list
      await fetchVehicles()

      return newVehicle
    } catch (error) {
      console.error("Error creating vehicle:", error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [user, fetchVehicles])

  // Fetch unfiltered (for stats) once when user is available
  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return
      try {
        setIsLoadingAllVehicles(true)
        const unfiltered = await vehicleService.getMyVehicles()
        setAllVehicles(unfiltered)
      } catch (error) {
        console.error("Error fetching all vehicles:", error)
      } finally {
        setIsLoadingAllVehicles(false)
      }
    }
    fetchAll()
  }, [user])

  return {
    vehicles,
    allVehicles,
    isLoadingVehicles,
    isLoadingAllVehicles,
    isCreating,
    fetchVehicles,
    createVehicle,
    filters,
    setFilters,
  }
}

export function useVehicleForm() {
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData)

  const updateField = (field: keyof VehicleFormData, value: string | string[] | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: checked ? [...prev.features, feature] : prev.features.filter((f) => f !== feature),
    }))
  }

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const selectedFiles = Array.from(files)
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...selectedFiles]
      }))
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
  }

  return {
    formData,
    updateField,
    handleFeatureChange,
    handleImageUpload,
    resetForm,
  }
}
