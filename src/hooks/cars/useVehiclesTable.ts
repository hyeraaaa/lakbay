"use client"

import { useEffect, useId, useMemo, useState } from "react"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { vehicleService, type VehicleResponse } from "@/services/vehicleServices"
import { normalizeTransmissionLabel } from "@/lib/vehicleNormalizers"
import { useNotification } from "@/components/NotificationProvider"

export type VehicleRow = {
  id: number
  imageUrl: string | null
  brand: string
  model: string
  plate: string
  type: string
  year: number
  seats: number
  ratePerDay: number
  availability: string
  transmission?: string
  fuel_type?: string
  features: string[]
  coding?: string
  description: string
  hasTracker?: boolean
  daily_mileage_limit?: number | null
  overage_fee_per_km?: number | null
}

type Params = {
  vehicles: VehicleResponse[]
  onChange?: () => void
}

export function useVehiclesTable({ vehicles, onChange }: Params) {
  const id = useId()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 11 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "brand", desc: false }])
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)
  const { success, error } = useNotification()
  const [rows, setRows] = useState<VehicleRow[]>([])

  const mapVehicleToRow = (v: VehicleResponse): VehicleRow => ({
    id: v.vehicle_id,
    imageUrl: v.vehicle_images?.[0]?.url ?? null,
    brand: v.brand,
    model: v.model,
    plate: v.plate_number,
    type: v.type,
    year: v.year,
    seats: v.seats,
    ratePerDay: v.rate_per_day,
    availability: v.availability,
    transmission: normalizeTransmissionLabel(v.transmission),
    fuel_type: v.fuel_type,
    features: v.features || [],
    coding: v.coding,
    description: v.description,
    daily_mileage_limit: v.daily_mileage_limit,
    overage_fee_per_km: v.overage_fee_per_km,
  })

  const mappedVehicles: VehicleRow[] = useMemo(
    () =>
      vehicles.map(mapVehicleToRow),
    [vehicles]
  )

  // Keep internal rows in sync with incoming data
  useEffect(() => {
    setRows(mappedVehicles)
  }, [mappedVehicles])

  const handleDelete = async (vehicleId: number) => {
    try {
      setIsDeletingId(vehicleId)
      await vehicleService.deleteVehicle(vehicleId)
      // Optimistically remove from table
      setRows((prev) => prev.filter((r) => r.id !== vehicleId))
      success("Vehicle deleted successfully")
      onChange?.()
    } catch (err) {
      console.error("Failed to delete vehicle", err)
      error("Failed to delete vehicle")
    } finally {
      setIsDeletingId(null)
    }
  }

  const applyUpdate = (vehicleId: number, updates: Partial<VehicleRow>) => {
    setRows((prev) => prev.map((r) => (r.id === vehicleId ? { ...r, ...updates } : r)))
  }

  const refreshRow = async (vehicleId: number) => {
    try {
      const v = await vehicleService.getVehicleById(vehicleId)
      const row = mapVehicleToRow(v)
      setRows((prev) => prev.map((r) => (r.id === vehicleId ? row : r)))
    } catch (e) {
      console.error('Failed to refresh vehicle row', e)
    }
  }

  // Clamp pagination if current page exceeds max after data changes
  useEffect(() => {
    const totalRows = rows.length
    const pageSize = pagination.pageSize
    const maxPageIndex = Math.max(0, Math.ceil(totalRows / pageSize) - 1)
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }))
    }
  }, [rows.length, pagination.pageSize, pagination.pageIndex])

  return {
    id,
    data: rows,
    pagination,
    setPagination,
    sorting,
    setSorting,
    isDeletingId,
    handleDelete,
    applyUpdate,
    refreshRow,
  }
}


