"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Loader2 } from "lucide-react"
import { useUserProfile } from "@/hooks/Profile/useProfile"
import { PersonalSettingsSkeleton } from "@/components/test-settings/settingsSkeletons"
import { useEffect, useState } from "react"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"
import { useNotification } from "@/components/NotificationProvider"

export function PersonalSettings() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const {
    user,
    isLoading,
    isSaving,
    error,
    success,
    formData,
    profileData,
    isEditMode,
    shouldShowSkeleton,
    handleInputChange,
    handleSubmit,
    handleCancelEdit,
    setIsEditMode,
    setError,
    setSuccess,
  } = useUserProfile()

  const { success: notifySuccess, error: notifyError } = useNotification()

  // Keep storage in E.164 with +63, display only the local part
  const displayPhone = (formData?.phone || "").replace(/^\+63/, "")

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const digitsOnly = e.target.value.replace(/\D/g, "")
    
    // Limit to 10 digits (Philippines phone format)
    const limitedDigits = digitsOnly.slice(0, 10)
    
    // Add +63 prefix
    const fullWithCountry = limitedDigits ? `+63${limitedDigits}` : ""
    
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name: "phone", value: fullWithCountry },
    } as unknown as React.ChangeEvent<HTMLInputElement>
    handleInputChange(syntheticEvent)
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter, and arrow keys
    if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)) {
      return
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    if (error) {
      notifyError(error)
      setError("")
    }
  }, [error, notifyError, setError])

  useEffect(() => {
    if (success) {
      notifySuccess(success)
      setSuccess("")
    }
  }, [success, notifySuccess, setSuccess])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmOpen(true)
  }

  const handleCancel = () => {
    handleCancelEdit()
  }

  if (shouldShowSkeleton) {
    return <PersonalSettingsSkeleton />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact and address information</CardDescription>
          </div>
          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} size="sm">
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex max-w-md">
              <span className={`inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm text-muted-foreground ${!isEditMode ? "bg-muted" : "bg-muted"}`}>
                +63
              </span>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={displayPhone}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                placeholder="9XXXXXXXXX"
                className={`rounded-l-none ${!isEditMode ? "bg-muted" : ""}`}
                readOnly={!isEditMode}
              />
            </div>
            {!formData.phone && (
              <p className="text-xs text-muted-foreground">
                Phone number is optional.
              </p>
            )}
            {isEditMode && (
              <p className="text-xs text-muted-foreground">
                Format: 9XXXXXXXXX (10 digits)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              placeholder="Enter your street address"
              readOnly={!isEditMode}
              className={!isEditMode ? "bg-muted" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleInputChange}
              placeholder="Apartment, suite, etc. (optional)"
              readOnly={!isEditMode}
              className={!isEditMode ? "bg-muted" : ""}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
                readOnly={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter your state"
                readOnly={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              placeholder="Enter postal code"
              className={`max-w-md ${!isEditMode ? "bg-muted" : ""}`}
              readOnly={!isEditMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Enter your country"
              className={`max-w-md ${!isEditMode ? "bg-muted" : ""}`}
              readOnly={!isEditMode}
            />
          </div>
        </CardContent>
      </Card>
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Save changes?"
        description="This will update your personal information. Proceed?"
        confirmText="Save"
        cancelText="Cancel"
        variant="default"
        onConfirm={async () => {
          try {
            await handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent)
            setIsEditMode(false)
          } catch (error) {
            console.error("Error saving settings:", error)
          }
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
