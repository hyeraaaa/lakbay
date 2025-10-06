"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotification } from "@/components/NotificationProvider"
import { vehicleService, type VehicleGPSDevice } from "@/services/vehicleServices"

interface TrackingDeviceDialogProps {
  vehicleId: number
  onAlert?: (message: string, variant: "default" | "destructive" | "success" | "warning" | "info") => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved?: (hasTracker: boolean) => void
  initialDevice?: VehicleGPSDevice | null
}

export function TrackingDeviceDialog({ vehicleId, onAlert, open, onOpenChange, onSaved, initialDevice }: TrackingDeviceDialogProps) {
  const { success, error, info } = useNotification()
  const isControlled = useMemo(() => typeof open === "boolean" && typeof onOpenChange === "function", [open, onOpenChange])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const dialogOpen = isControlled ? (open as boolean) : isDialogOpen
  const setDialogOpen = isControlled ? (onOpenChange as (o: boolean) => void) : setIsDialogOpen

  const [deviceImei, setDeviceImei] = useState("")
  const [deviceName, setDeviceName] = useState("")
  const [deviceType, setDeviceType] = useState("SinoTrack")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingDevice, setEditingDevice] = useState<VehicleGPSDevice | null>(null)

  const showAlert = useCallback((message: string, variant: "default" | "destructive" | "success" | "warning" | "info" = "default") => {
    switch (variant) {
      case "success":
        success(message)
        break
      case "destructive":
        error(message)
        break
      case "info":
      case "warning":
      default:
        info(message)
        break
    }
    if (onAlert) onAlert(message, variant)
  }, [success, error, info, onAlert])

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message
    try {
      return typeof err === 'string' ? err : JSON.stringify(err)
    } catch {
      return 'Something went wrong'
    }
  }

  const resetForm = () => {
    setDeviceImei("")
    setDeviceName("")
    setDeviceType("")
  }

  const handleCancel = () => {
    // Reset synchronously before closing to avoid flicker
    setIsSubmitting(false)
    resetForm()
    setEditingDevice(null)
    setDialogOpen(false)
  }

  const handleSubmit = async () => {
    const imeiDigits = deviceImei.replace(/\D/g, "")
    if (!imeiDigits || imeiDigits.length < 10 || imeiDigits.length > 20) {
      showAlert("Device IMEI must be 10-20 digits", "destructive")
      return
    }
    if (!deviceName.trim() || !deviceType.trim()) {
      showAlert("Device IMEI, Name, and Type are required", "destructive")
      return
    }
    setIsSubmitting(true)
    try {
      if (editingDevice) {
        const isImeiChanged = imeiDigits !== (editingDevice.device_imei || "")
        const isTypeChanged = deviceType.trim() !== (editingDevice.device_type || "")
        if (isImeiChanged || isTypeChanged) {
          try { await vehicleService.updateTrackingDevice(editingDevice.device_id, { is_active: false }) } catch (_) {}
          await vehicleService.addTrackingDevice(vehicleId, {
            device_imei: imeiDigits,
            device_name: deviceName.trim(),
            device_type: deviceType.trim(),
          })
          showAlert("Tracking device replaced successfully", "success")
        } else {
          try {
            await vehicleService.updateTrackingDevice(editingDevice.device_id, { device_name: deviceName.trim() })
            showAlert("Tracking device updated successfully", "success")
          } catch (err) {
            // If we are not permitted to update existing device, fall back to creating a new one
            try { await vehicleService.updateTrackingDevice(editingDevice.device_id, { is_active: false }) } catch (_) {}
            await vehicleService.addTrackingDevice(vehicleId, {
              device_imei: imeiDigits,
              device_name: deviceName.trim(),
              device_type: deviceType.trim(),
            })
            showAlert("Existing device could not be updated. Created a new device instead.", "warning")
          }
        }
      } else {
        await vehicleService.addTrackingDevice(vehicleId, {
          device_imei: imeiDigits,
          device_name: deviceName.trim(),
          device_type: deviceType.trim(),
        })
        showAlert("Tracking device added successfully", "success")
      }
      try { onSaved?.(true) } catch {}
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving tracking device:", error)
      showAlert(getErrorMessage(error) || "Failed to save tracking device", "destructive")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prefill on open: use preloaded device if provided, then background-refresh
  useEffect(() => {
    if (!dialogOpen || !vehicleId) return
    let active = true
    // 1) Instant prefill from initialDevice
    if (initialDevice) {
      setEditingDevice(initialDevice)
      setDeviceImei(initialDevice.device_imei || "")
      setDeviceName(initialDevice.device_name || "")
      setDeviceType(initialDevice.device_type || "SinoTrack")
    } else {
      setEditingDevice(null)
      resetForm()
      setDeviceType("SinoTrack")
    }
    // 2) Background refresh to ensure latest
    ;(async () => {
      try {
        const devices = await vehicleService.getVehicleGPSDevices(vehicleId)
        if (!active) return
        if (Array.isArray(devices) && devices.length > 0) {
          const d = devices[0]
          setEditingDevice(d)
          setDeviceImei(d.device_imei || "")
          setDeviceName(d.device_name || "")
          setDeviceType(d.device_type || "SinoTrack")
        }
      } catch {}
    })()
    return () => { active = false }
  }, [dialogOpen, vehicleId, initialDevice])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Immediate reset when closing from X or outside click
      setIsSubmitting(false)
      resetForm()
      setEditingDevice(null)
    }
    setDialogOpen(next)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingDevice ? 'Update Tracker' : 'Add New Tracker'}</DialogTitle>
          <DialogDescription>Enter the tracker details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imei">IMEI ID</Label>
            <Input
              id="imei"
              placeholder="Enter IMEI ID"
              value={deviceImei}
              onChange={(e) => setDeviceImei(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Tracker Name</Label>
            <Input
              id="name"
              placeholder="Enter tracker name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tracker Type</Label>
            <Select value={deviceType} onValueChange={setDeviceType}>
              <SelectTrigger id="type" disabled={isSubmitting}>
                <SelectValue placeholder="Select tracker type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SinoTrack">SinoTrack</SelectItem>
                <SelectItem value="Generic">Generic</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!deviceImei.trim() || !deviceName.trim() || !deviceType.trim() || isSubmitting}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : (editingDevice ? 'Update' : 'Submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TrackingDeviceDialog


