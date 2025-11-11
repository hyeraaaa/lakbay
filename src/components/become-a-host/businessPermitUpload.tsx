"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X, LocateFixed, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import dynamic from "next/dynamic"

const InlineGarageMap = dynamic(() => import('./InlineGarageMap'), { ssr: false })
import useBusinessPermit from "@/hooks/become-a-host/useBusinessPermit"

interface BusinessPermitUploadProps {
  onSubmit: (businessPermitFile: File, insuranceFile: File, garageLocationName: string, garageCoordinates?: string | null) => void
  isSubmitting?: boolean
}

export const BusinessPermitUpload = ({ onSubmit, isSubmitting = false }: BusinessPermitUploadProps) => {
  const {
    selectedFile,
    dragActive,
    province,
    city,
    barangay,
    isLocating,
    locateError,
    geoError,
    coords,
    geoLoading,
    fileInputRef,
    setSelectedFile,
    setProvince,
    setCity,
    setBarangay,
    handleDrag,
    handleDrop,
    handleFileSelect,
    removeFile,
    locateCurrent,
    onMapPick,
    isLocationProvided,
    getLocationString,
    getLocationForSubmission,
    getCoordinatesForSubmission,
  } = useBusinessPermit()

  // Local state for insurance document (kept local to avoid expanding shared hook API)
  const insuranceInputRef = React.useRef<HTMLInputElement | null>(null)
  const [insuranceFile, setInsuranceFile] = React.useState<File | null>(null)
  const [insuranceDragActive, setInsuranceDragActive] = React.useState(false)

  const handleInsuranceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setInsuranceFile(file)
  }
  const removeInsuranceFile = () => setInsuranceFile(null)
  const handleInsuranceDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setInsuranceDragActive(true)
    } else if (e.type === "dragleave") {
      setInsuranceDragActive(false)
    }
  }
  const handleInsuranceDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setInsuranceDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setInsuranceFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = () => {
    if (!selectedFile || !insuranceFile) return
    const locationString = getLocationForSubmission()
    if (!locationString) return
    const coordinates = getCoordinatesForSubmission()
    onSubmit(selectedFile, insuranceFile, locationString, coordinates)
  }


  // Map rendering is handled in a dynamically imported client-only component

  // Effects are handled in the hook

  // Map interactivity handled within InlineGarageMap

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Upload Business Permit & Insurance
        </CardTitle>
        <CardDescription>Upload clear photos of your valid business permit and active insurance policy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business-permit">Business Permit Document</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              ${selectedFile ? "bg-muted/50" : "hover:bg-muted/50"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Input
              ref={fileInputRef}
              id="business-permit"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, JPEG, or WEBP (max 10MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="insurance-document">Insurance Policy Document</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${insuranceDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              ${insuranceFile ? "bg-muted/50" : "hover:bg-muted/50"}
            `}
            onDragEnter={handleInsuranceDrag}
            onDragLeave={handleInsuranceDrag}
            onDragOver={handleInsuranceDrag}
            onDrop={handleInsuranceDrop}
            onClick={() => insuranceInputRef.current?.click()}
          >
            <Input
              ref={insuranceInputRef}
              id="insurance-document"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleInsuranceFileSelect}
              className="hidden"
            />

            {insuranceFile ? (
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{insuranceFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(insuranceFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeInsuranceFile()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, JPEG, WEBP, or PDF (max 10MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Garage Location</Label>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="province" className="text-sm font-medium">Province</Label>
              <Input
                id="province"
                placeholder="Enter province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city" className="text-sm font-medium">City / Municipality</Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="barangay" className="text-sm font-medium">Barangay</Label>
              <div className="flex gap-1">
                <Input
                  id="barangay"
                  placeholder="Enter barangay"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={isLocating ? 'Locating…' : 'Use current location'}
                      onClick={locateCurrent}
                      disabled={isLocating}
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
          {locateError && (
            <p className="text-sm text-destructive">{locateError}</p>
          )}
          <div className="mt-3 space-y-2">
            <div className="h-64 w-full overflow-hidden rounded-md border">
              {coords ? (
                <InlineGarageMap center={coords} onPick={onMapPick} />
              ) : (
                <InlineGarageMap center={[14.5995, 120.9842]} onPick={onMapPick} />
              )}
            </div>
            {geoError && <p className="text-xs text-destructive">{geoError}</p>}
            {coords && (
              <p className="text-xs text-muted-foreground">
                Lat: {Number(coords[0]).toFixed(6)} | Lon: {Number(coords[1]).toFixed(6)}
              </p>
            )}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Requirements:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Valid business permit or license</li>
            <li>• Image must be clear and well-lit</li>
            <li>• All text and details must be clearly readable</li>
            <li>• Document should not be expired</li>
          </ul>
        </div>

        <Button onClick={handleSubmit} disabled={!selectedFile || !insuranceFile || isSubmitting || !isLocationProvided} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
