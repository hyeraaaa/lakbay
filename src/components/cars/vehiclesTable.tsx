"use client"

import { useMemo, useState } from "react"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Trash2,
  Pencil,
  MoreHorizontal,
  FileText,
  Eye,
  MapPin,
  Loader2,
  Settings,
  Wrench,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { encodeId } from "@/lib/idCodec"
import type { VehicleResponse, VehicleData } from "@/services/vehicleServices"
import { useVehiclesTable } from "@/hooks/cars/useVehiclesTable"
import { useEffect } from "react"
import { vehicleService } from "@/services/vehicleServices"
import { normalizeTransmissionLabel } from "@/lib/vehicleNormalizers"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DocumentUploadDialog } from "@/components/cars/documentUploadDialog"
import { TrackingDeviceDialog } from "@/components/cars/trackingDeviceDialog"
import { MileageSettingsDialog } from "@/components/cars/mileageSettingsDialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"
import { registrationService } from "@/services/registrationService"
import { AddCarDialog } from "@/components/cars/addCarDialog"
import { useNotification } from "@/components/NotificationProvider"
import { useVehicleTrackers } from "@/hooks/cars/useVehicleTrackers"
import { useRegistrationMap } from "@/hooks/cars/useRegistrationMap"
import { useTrackingDetails } from "@/hooks/cars/useTrackingDetails"
import { useJWT } from "@/contexts/JWTContext"

type VehiclesTableProps = {
  vehicles: VehicleResponse[]
  onChange?: () => void
}

// using shared normalizer from lib

type VehicleRow = {
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
  daily_mileage_limit?: number | null
  overage_fee_per_km?: number | null
  is_registered?: boolean
}

export function VehiclesTable({ vehicles, onChange }: VehiclesTableProps) {
  const { id, data, pagination, setPagination, sorting, setSorting, isDeletingId, handleDelete, applyUpdate, refreshRow } = useVehiclesTable({ vehicles, onChange })
  const { user } = useJWT()
  const isAdmin = user?.user_type === 'admin'
  const [uploadForId, setUploadForId] = useState<number | null>(null)
  const [trackingForId, setTrackingForId] = useState<number | null>(null)
  const [mileageSettingsForId, setMileageSettingsForId] = useState<number | null>(null)
  const vehicleIds = useMemo(() => data.map((r) => r.id), [data])
  const { trackerMap, setTrackerMap } = useVehicleTrackers(vehicleIds)
  const { deviceMap } = useTrackingDetails(vehicleIds)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const { registrationMap, setRegistrationMap } = useRegistrationMap(vehicleIds)
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [editInitial, setEditInitial] = useState<Partial<import("@/hooks/cars/useAddCars").VehicleFormData> | null>(null)
  const [editExistingImages, setEditExistingImages] = useState<Array<{ vehicle_image_id: number; url: string }>>([])
  const [editLoading, setEditLoading] = useState<boolean>(false)
  const [editVehicleId, setEditVehicleId] = useState<number | null>(null)
  const [updatingAvailabilityId, setUpdatingAvailabilityId] = useState<number | null>(null)
  const { success, error } = useNotification()

  const toTransmissionOption = (raw?: string | null): string => {
    const v = (raw || "").toLowerCase()
    if (!v) return ""
    if (v.includes("manual") || v.includes(" mt")) return "manual"
    if (v.includes("automatic") || v.includes(" at")) return "automatic"
    if (v.includes("cvt") || v.includes("continuously variable")) return "cvt"
    if (v.includes("amt") || v.includes("automated manual")) return "amt"
    if (v.includes("dct") || v.includes("dsg") || v.includes("dual-clutch")) return "dct"
    if (v.includes("tiptronic") || v.includes("manumatic")) return "tiptronic"
    if (v.includes("single")) return "single speed"
    return ""
  }

  // effects moved into hooks: useVehicleTrackers, useRegistrationMap

  const getAvailabilityBadgeColor = (availability: string) => {
    const key = (availability || "").toLowerCase()
    switch (key) {
      case "available":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "maintenance":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "pending_registration":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "rented":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "on_hold":
      case "on hold":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "unavailable":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const formatAvailability = (availability: string) => {
    return availability
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const columns: ColumnDef<VehicleRow>[] = [
    {
      header: "Vehicle",
      accessorKey: "brand",
      cell: ({ row }) => (
        <div className="pl-4">
          <div className="font-medium">{row.original.brand} {row.original.model}</div>
          <div className="text-xs text-muted-foreground">{row.original.plate}</div>
        </div>
      ),
      size: 200,
    },
    { 
      header: "Type", 
      accessorKey: "type", 
      size: 100,
      cell: ({ row }) => (
        <div className="px-4 capitalize">{row.original.type}</div>
      ),
    },
    {
      header: "Rate/Day",
      accessorKey: "ratePerDay",
      cell: ({ row }) => (
        <div className="px-4 font-medium">₱{row.original.ratePerDay.toLocaleString()}</div>
      ),
      size: 120,
    },
    { 
      header: "Fuel", 
      accessorKey: "fuel_type", 
      size: 100,
      cell: ({ row }) => (
        <div className="px-4 capitalize">{row.original.fuel_type}</div>
      ),
    },
    {
      header: "Availability",
      accessorKey: "availability",
      cell: ({ row }) => (
        <div className="px-4">
          <Badge
            className={cn(
              "border px-2 py-0.5 text-[11px]",
              getAvailabilityBadgeColor(row.original.availability)
            )}
          >
            {formatAvailability(row.original.availability)}
          </Badge>
        </div>
      ),
      size: 150,
    },
    {
      header: "Mileage Settings",
      accessorKey: "daily_mileage_limit",
      cell: ({ row }) => {
        const hasLimit = row.original.daily_mileage_limit !== null && row.original.daily_mileage_limit !== undefined
        const limit = row.original.daily_mileage_limit
        const fee = row.original.overage_fee_per_km
        
        return (
          <div className="px-4">
            {hasLimit ? (
              <div className="text-xs">
                <div className="font-medium">{limit} km/day</div>
                {fee && <div className="text-muted-foreground">₱{fee}/km overage</div>}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Unlimited</div>
            )}
          </div>
        )
      },
      size: 150,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Open actions menu">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-30">
            <DropdownMenuItem asChild>
              <Link href={`/owner/vehicle/vehicle-details/${encodeId(row.original.id.toString())}`}>
                <Eye size={16} /> View Details
              </Link>
            </DropdownMenuItem>
            {row.original.availability === "pending_registration" && !isAdmin && (
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); setUploadForId(row.original.id) }}
                disabled={registrationMap[row.original.id]?.status === 'pending'}
              >
              <FileText size={16} />
                <span>
                  {registrationMap[row.original.id]?.status === 'pending'
                    ? 'Waiting for admin review'
                    : 'Submit Documents'}
                </span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={async (e) => { e.preventDefault(); setTrackingForId(row.original.id) }}>
              <MapPin size={16} /> <span>{trackerMap[row.original.id] ? 'Update Tracking Device' : 'Add Tracking Device'}</span>
            </DropdownMenuItem>
            {!isAdmin && (
              <DropdownMenuItem onSelect={async (e) => { e.preventDefault(); setMileageSettingsForId(row.original.id) }}>
                <Settings size={16} /> <span>Mileage Settings</span>
              </DropdownMenuItem>
            )}
            {/* Only allow status changes for registered vehicles that are available or maintenance (excludes pending_registration, on_hold, rented, etc.) */}
            {row.original.is_registered && 
             (row.original.availability === 'available' || row.original.availability === 'maintenance') && (
              <DropdownMenuItem
                onSelect={async (e) => {
                  e.preventDefault()
                  const vehicleId = row.original.id
                  const currentStatus = row.original.availability
                  // Only toggle between available and maintenance (excludes pending_registration, on_hold, rented, etc.)
                  const newStatus = currentStatus === 'available' ? 'maintenance' : 'available'
                  
                  try {
                    setUpdatingAvailabilityId(vehicleId)
                    await vehicleService.updateVehicleAvailability(vehicleId, newStatus)
                    success(`Vehicle status updated to ${formatAvailability(newStatus)}`)
                    applyUpdate(vehicleId, { availability: newStatus })
                    await refreshRow(vehicleId)
                    onChange?.()
                  } catch (err) {
                    error(err instanceof Error ? err.message : 'Failed to update vehicle status')
                  } finally {
                    setUpdatingAvailabilityId(null)
                  }
                }}
                disabled={updatingAvailabilityId === row.original.id}
              >
                {updatingAvailabilityId === row.original.id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating…</span>
                  </>
                ) : (
                  <>
                    <Wrench size={16} />
                    <span>
                      {row.original.availability === 'available'
                        ? 'Set to Maintenance'
                        : 'Set to Available'}
                    </span>
                  </>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => {
              try {
                setEditLoading(true)
                const v = await vehicleService.getVehicleById(row.original.id)
                setEditVehicleId(v.vehicle_id)
                setEditInitial({
                  brand: v.brand || "",
                  model: v.model || "",
                  type: (v.type || "").toLowerCase(),
                  plate_number: v.plate_number || "",
                  description: v.description || "",
                  year: String(v.year || ""),
                  seats: String(v.seats || ""),
                  rate_per_day: String(v.rate_per_day || ""),
                  transmission: toTransmissionOption(v.transmission),
                  fuel_type: (v.fuel_type || "").toLowerCase(),
                  features: v.features || [],
                  coding: v.coding || "",
                  images: [],
                })
                setEditExistingImages(v.vehicle_images || [])
                setEditOpen(true)
              } catch (e) {
                console.error(e)
                // optional toast here is handled at submit stage; skip for fetch
              } finally {
                setEditLoading(false)
              }
            }}>
              <Pencil size={16} /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmDeleteId(row.original.id)}
              disabled={isDeletingId === row.original.id}
            >
              {isDeletingId === row.original.id ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="ml-2">Deleting…</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span className="ml-2">Delete</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      size: 80,
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { sorting, pagination },
  })

  return (
    <div className="space-y-4">
      <DocumentUploadDialog
        vehicleId={uploadForId ?? 0}
        open={uploadForId !== null}
        onOpenChange={async (open) => {
          if (!open && uploadForId) {
            try {
              const status = await registrationService.getRegistrationStatus(uploadForId)
              setRegistrationMap(prev => ({ ...prev, [uploadForId]: { hasRegistration: !!status.hasRegistration, status: status.registration?.status } }))
            } catch {
              // ignore
            }
          }
          setUploadForId(open ? uploadForId : null)
        }}
      />
      <AddCarDialog
        externalOpen={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={async (form, imageOperations) => {
          if (!editVehicleId) return
          try {
            setEditLoading(true)
            await vehicleService.updateVehicle(editVehicleId, {
              description: form.description,
              plate_number: form.plate_number,
              model: form.model,
              brand: form.brand,
              type: form.type as VehicleData["type"],
              year: Number(form.year),
              seats: Number(form.seats),
              rate_per_day: Number(form.rate_per_day),
              transmission: form.transmission,
              fuel_type: form.fuel_type as VehicleData["fuel_type"],
              features: form.features,
              coding: (form.coding || undefined) as VehicleData["coding"],
            })

            // Handle image operations if provided
            if (imageOperations) {
              // Delete removed images
              for (const imageId of imageOperations.removedImageIds) {
                await vehicleService.deleteVehicleImage(imageId)
              }
              
              // Upload new images
              if (imageOperations.newImages.length > 0) {
                await vehicleService.uploadVehicleImages(editVehicleId, imageOperations.newImages)
              }
            }

            success("Vehicle updated successfully")
            applyUpdate(editVehicleId, {
              brand: form.brand,
              model: form.model,
              plate: form.plate_number,
              type: form.type,
              year: Number(form.year),
              seats: Number(form.seats),
              ratePerDay: Number(form.rate_per_day),
              transmission: form.transmission,
              fuel_type: form.fuel_type,
              description: form.description,
            })
            // Fetch latest canonical data from server to ensure all fields (e.g., availability) are up-to-date
            await refreshRow(editVehicleId)
            // Refresh registration status so submit button re-enables unless a submission is pending
            try {
              const status = await registrationService.getRegistrationStatus(editVehicleId)
              setRegistrationMap(prev => ({ ...prev, [editVehicleId]: { hasRegistration: !!status.hasRegistration, status: status.registration?.status } }))
            } catch {
              // ignore refresh errors
            }
            setEditOpen(false)
          } catch (e) {
            console.error(e)
            error(e instanceof Error ? e.message : "Failed to update vehicle")
          } finally {
            setEditLoading(false)
          }
        }}
        isLoading={editLoading}
        onAlert={() => {}}
        initialFormData={editInitial ?? undefined}
        existingImages={editExistingImages}
        mode="edit"
        hideTrigger
      />
      <TrackingDeviceDialog
        vehicleId={trackingForId ?? 0}
        open={trackingForId !== null}
        onOpenChange={(open) => {
          if (!open && trackingForId) {
            const id = trackingForId
            // Close instantly
            setTrackingForId(null)
            // Refresh tracker state in the background
            ;(async () => {
              try {
                const devices = await vehicleService.getVehicleGPSDevices(id)
                setTrackerMap(prev => ({ ...prev, [id]: Array.isArray(devices) && devices.length > 0 }))
              } catch {
                setTrackerMap(prev => ({ ...prev, [id]: false }))
              }
            })()
            return
          }
          // Opening
          setTrackingForId(open ? trackingForId : null)
        }}
        initialDevice={trackingForId ? deviceMap[trackingForId] ?? null : null}
        onSaved={async () => {
          if (!trackingForId) return
          try {
            const devices = await vehicleService.getVehicleGPSDevices(trackingForId)
            setTrackerMap(prev => ({ ...prev, [trackingForId]: Array.isArray(devices) && devices.length > 0 }))
          } catch {
            setTrackerMap(prev => ({ ...prev, [trackingForId]: false }))
          }
        }}
      />
      <MileageSettingsDialog
        vehicle={vehicles.find(v => v.vehicle_id === mileageSettingsForId) || vehicles[0]}
        open={mileageSettingsForId !== null}
        onOpenChange={(open) => setMileageSettingsForId(open ? mileageSettingsForId : null)}
        onSuccess={() => {
          onChange?.()
          setMileageSettingsForId(null)
        }}
      />
      <div className="bg-white border border-neutral-300">
        <div className="overflow-x-auto">
          <Table className="table-fixed min-w-[900px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className={cn(
                      "h-11",
                      header.column.id === "fuel_type" && "hidden sm:table-cell"
                    )}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() && "flex h-full cursor-pointer items-center justify-between gap-2 select-none",
                          header.column.id === "brand" ? "pl-4" : "px-4"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault()
                            header.column.getToggleSortingHandler()?.(e)
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUpIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                          desc: <ChevronDownIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      <div className={cn(header.column.id === "brand" ? "pl-4" : "px-4")}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.id === "fuel_type" && "hidden sm:table-cell")}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No vehicles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => setConfirmDeleteId(open ? confirmDeleteId : null)}
        title="Delete vehicle?"
        description="This action cannot be undone. This will permanently remove the vehicle and its associated data."
        confirmText={isDeletingId ? "Deleting…" : "Delete"}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          if (confirmDeleteId !== null) {
            handleDelete(confirmDeleteId)
          }
        }}
      />

      <div className="flex items-center justify-between gap-8">
        <div />
        <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
          <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
            <span className="text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-{Math.min(
                Math.max(
                  table.getState().pagination.pageIndex * table.getState().pagination.pageSize + table.getState().pagination.pageSize,
                  0
                ),
                table.getRowCount()
              )}
            </span>{" "}
            of <span className="text-foreground">{table.getRowCount().toString()}</span>
          </p>
        </div>
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button size="icon" variant="outline" className="disabled:pointer-events-none disabled:opacity-50" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()} aria-label="Go to first page">
                  <ChevronFirstIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="disabled:pointer-events-none disabled:opacity-50" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Go to previous page">
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="disabled:pointer-events-none disabled:opacity-50" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Go to next page">
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="disabled:pointer-events-none disabled:opacity-50" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()} aria-label="Go to last page">
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

export default VehiclesTable


