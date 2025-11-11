"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, XCircle, Loader2, LocateFixed, Edit as EditIcon } from "lucide-react"
import InlineGarageMap from "@/components/become-a-host/InlineGarageMap"
import { getCurrentUser } from "@/lib/jwt"
import { profileService } from "@/services/profileServices"
import { useNotification } from "@/components/NotificationProvider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import useBusinessPermit from "@/hooks/become-a-host/useBusinessPermit"
 import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"

export function GarageLocationSettings() {
  const user = getCurrentUser()
  const { success: notifySuccess, error: notifyError } = useNotification()

  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [savedLocationName, setSavedLocationName] = useState<string>("")
  const [savedLatitude, setSavedLatitude] = useState<number | null>(null)
  const [savedLongitude, setSavedLongitude] = useState<number | null>(null)

  // Reuse the Become-a-Host location UX (province/city/barangay, geocoding, GPS locate, map picking)
  const {
    province,
    city,
    barangay,
    isLocating,
    locateError,
    geoError,
    coords,
    geoLoading,
    setProvince,
    setCity,
    setBarangay,
    locateCurrent,
    onMapPick,
    getLocationString,
  } = useBusinessPermit()

  const defaultCenter = useMemo<[number, number]>(() => {
    // Default to Manila if no saved coords: 14.5995° N, 120.9842° E
    return [14.5995, 120.9842]
  }, [])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError("")
      try {
        const { ok, data } = await profileService.getProfile(user.id)
        if (ok && data) {
          // Use saved values directly; do not trigger geocoding
          const name = data.garage_location_name ?? ""
          const latRaw = data.garage_latitude ?? null
          const lonRaw = data.garage_longitude ?? null
          const lat = typeof latRaw === "string" ? Number(latRaw) : latRaw
          const lon = typeof lonRaw === "string" ? Number(lonRaw) : lonRaw
          if (isMounted) {
            setLatitude(typeof lat === "number" ? lat : null)
            setLongitude(typeof lon === "number" ? lon : null)
            setSavedLocationName(name || "")
            setSavedLatitude(typeof lat === "number" ? lat : null)
            setSavedLongitude(typeof lon === "number" ? lon : null)
            // Do NOT prefill province/city/barangay from saved name to avoid auto geocoding
          }
        } else {
          throw new Error("Failed to load current garage location")
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to load current garage location"
        if (isMounted) {
          setError(message)
          notifyError(message)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [user?.id, notifyError])

  // Keep map centered on either geocoded/GPS coords, or existing lat/lon, or default
  const center: [number, number] = useMemo(() => {
    // Prefer geocoded/GPS coords if available, then fall back to saved lat/lon, else default
    if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
      return [Number(coords[0]), Number(coords[1])]
    }
    if (typeof latitude === "number" && typeof longitude === "number") {
      return [latitude, longitude]
    }
    return defaultCenter
  }, [coords, latitude, longitude, defaultCenter])

  // Sync coords from host-style UX into primitive lat/lon used by save API
  // Auto-sync geocoded/GPS coords to the editable lat/lon so the map moves automatically
  useEffect(() => {
    if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
      setLatitude(Number(coords[0]))
      setLongitude(Number(coords[1]))
    }
  }, [coords])

  const onPick = (lat: number, lon: number) => {
    if (!isEditMode) return
    onMapPick(lat, lon)
    setLatitude(lat) // keep primitive state in sync for display/save safety
    setLongitude(lon)
  }

  const handleSave = async () => {
    if (!user?.id) return
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      const msg = "Please pick a location on the map."
      setError(msg)
      notifyError(msg)
      return
    }
    setIsSaving(true)
    setError("")
    try {
      const coordsName = `${latitude}, ${longitude}`
      const humanReadable = getLocationString()
      const payload = {
        // Prefer human-readable address (barangay, city, province), fallback to raw coords
        garage_location_name: humanReadable && humanReadable.trim().length > 0 ? humanReadable : coordsName,
        latitude,
        longitude,
      }
      const { ok, data } = await profileService.updateGarageLocation(user.id, payload)
      if (!ok) {
        throw new Error((data && data.message) || "Failed to save garage location")
      }
      notifySuccess("Garage location saved")
      // Update saved snapshot
      setSavedLocationName(humanReadable && humanReadable.trim().length > 0 ? humanReadable : "")
      setSavedLatitude(latitude)
      setSavedLongitude(longitude)
      setIsEditMode(false)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save garage location"
      setError(message)
      notifyError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const useSavedLocation = () => {
    // Attempt to backfill province/city/barangay from saved readable name
    if (savedLocationName) {
      const parts = savedLocationName.split(",").map((p) => p.trim()).filter(Boolean)
      setBarangay(parts[0] || "")
      setCity(parts[1] || "")
      setProvince(parts.slice(2).join(", ") || "")
    }
    setLatitude(savedLatitude)
    setLongitude(savedLongitude)
    setIsEditMode(false)
  }

  if (!user || user.user_type !== "owner") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Garage Location
            </CardTitle>
            <CardDescription>Only vehicle owners can set a garage location.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Garage Location
            </CardTitle>
            <CardDescription>Set the default pickup/garage location for your vehicles</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
                disabled={isLoading}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Revert any unsaved changes to last saved snapshot
                    setLatitude(savedLatitude)
                    setLongitude(savedLongitude)
                    setIsEditMode(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border p-3 text-sm bg-muted/30">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">Currently saved location</div>
                {typeof savedLatitude === "number" && typeof savedLongitude === "number" ? (
                  <div className="text-muted-foreground">
                    {savedLocationName ? `${savedLocationName} — ` : ""}
                    {savedLatitude.toFixed(6)}, {savedLongitude.toFixed(6)}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No saved garage location yet</div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={useSavedLocation} disabled={isLoading || (savedLatitude == null || savedLongitude == null)}>
                Use saved
              </Button>
            </div>
          </div>

          {/* Become-a-Host style address fields */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="province" className="text-sm font-medium">Province</Label>
                 <Input
                  id="province"
                  placeholder="Enter province"
                   value={isEditMode ? province : (province || "Not provided")}
                   onChange={(e) => setProvince(e.target.value)}
                   disabled={isLoading || !isEditMode}
                   className={!isEditMode ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city" className="text-sm font-medium">City / Municipality</Label>
                 <Input
                  id="city"
                  placeholder="Enter city"
                   value={isEditMode ? city : (city || "Not provided")}
                   onChange={(e) => setCity(e.target.value)}
                   disabled={isLoading || !isEditMode}
                   className={!isEditMode ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="barangay" className="text-sm font-medium">Barangay</Label>
                <div className="flex gap-1">
                   <Input
                    id="barangay"
                    placeholder="Enter barangay"
                     value={isEditMode ? barangay : (barangay || "Not provided")}
                     onChange={(e) => setBarangay(e.target.value)}
                     disabled={isLoading || !isEditMode}
                     className={!isEditMode ? "bg-muted" : ""}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={isLocating ? 'Locating…' : 'Use current location'}
                         onClick={locateCurrent}
                         disabled={isLocating || isLoading || !isEditMode}
                      >
                        <LocateFixed className={`h-5 w-5 ${isLocating ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="z-[1200]">
                      <p>{isLocating ? 'Locating…' : 'Use current location'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
              {locateError && <p className="text-sm text-destructive">{locateError}</p>}
              {geoLoading && <span className="text-xs text-muted-foreground">Locating address…</span>}
          </div>

           <div className="h-80 w-full rounded border overflow-hidden relative">
            {/* Map */}
            <InlineGarageMap center={center} onPick={onPick} />
             {!isEditMode && (
               <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                 <span className="text-xs text-muted-foreground">Read-only. Click Edit to change.</span>
               </div>
             )}
          </div>
          {geoError && <p className="text-xs text-destructive">{geoError}</p>}
          <p className="text-xs text-muted-foreground">
            {geoLoading ? "Locating address..." : "Click on the map to set your garage location. Coordinates will update automatically."}
          </p>
          {typeof latitude === "number" && typeof longitude === "number" && (
            <p className="text-xs text-muted-foreground">
              Lat: {Number(latitude).toFixed(6)} | Lon: {Number(longitude).toFixed(6)}
            </p>
          )}

           {/* Save/Cancel now located in header to match other tabs */}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Save changes?"
        description="This will update your garage location. Proceed?"
        confirmText="Save"
        cancelText="Cancel"
        variant="default"
        onConfirm={async () => {
          try {
            await handleSave()
          } catch (e) {
            console.error(e)
          }
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}


