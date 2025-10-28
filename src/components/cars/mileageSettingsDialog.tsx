"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Settings, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { vehicleService, type VehicleResponse } from "@/services/vehicleServices"

interface MileageSettingsDialogProps {
  vehicle: VehicleResponse
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MileageSettingsDialog({ vehicle, open, onOpenChange, onSuccess }: MileageSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLimit, setHasLimit] = useState(false)
  const [dailyMileageLimit, setDailyMileageLimit] = useState<number | null>(null)
  const [overageFeePerKm, setOverageFeePerKm] = useState<number | null>(null)

  // Initialize form with vehicle data
  useEffect(() => {
    if (vehicle) {
      const hasLimitValue = vehicle.daily_mileage_limit !== null && vehicle.daily_mileage_limit !== undefined
      setHasLimit(hasLimitValue)
      setDailyMileageLimit(vehicle.daily_mileage_limit || null)
      setOverageFeePerKm(vehicle.overage_fee_per_km || null)
    }
  }, [vehicle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const settings = {
        daily_mileage_limit: hasLimit ? dailyMileageLimit : null,
        overage_fee_per_km: overageFeePerKm
      }

      await vehicleService.updateVehicleMileageSettings(vehicle.vehicle_id, settings)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mileage settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLimitToggle = (checked: boolean) => {
    setHasLimit(checked)
    if (!checked) {
      setDailyMileageLimit(null)
    } else if (dailyMileageLimit === null) {
      setDailyMileageLimit(200) // Default value
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Mileage Settings
          </DialogTitle>
          <DialogDescription>
            Configure daily mileage limits and overage fees for {vehicle?.brand} {vehicle?.model}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Daily Mileage Limit Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="has-limit">Set Daily Mileage Limit</Label>
                <p className="text-sm text-muted-foreground">
                  Enable to set a daily mileage limit for this vehicle
                </p>
              </div>
              <Switch
                id="has-limit"
                checked={hasLimit}
                onCheckedChange={handleLimitToggle}
              />
            </div>

            {/* Daily Mileage Limit Input */}
            {hasLimit && (
              <div className="space-y-2">
                <Label htmlFor="daily-limit">Daily Mileage Limit (km)</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  min="1"
                  max="2000"
                  value={dailyMileageLimit || ''}
                  onChange={(e) => setDailyMileageLimit(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="200"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 2000 km per day. Leave empty for unlimited.
                </p>
              </div>
            )}

            {/* Overage Fee Input */}
            <div className="space-y-2">
              <Label htmlFor="overage-fee">Overage Fee per Kilometer (PHP)</Label>
              <Input
                id="overage-fee"
                type="number"
                min="0"
                max="1000"
                step="0.01"
                value={overageFeePerKm || ''}
                onChange={(e) => setOverageFeePerKm(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="5.00"
              />
              <p className="text-xs text-muted-foreground">
                Fee charged for each kilometer over the daily limit. Maximum PHP 1000 per km.
              </p>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong> When customers exceed the daily mileage limit, 
              they&apos;ll be charged the overage fee for each additional kilometer. 
              This helps protect your vehicle from excessive wear and tear.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
