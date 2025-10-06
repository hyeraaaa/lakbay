"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, XCircle, Edit, Loader2 } from "lucide-react"
import { useUserProfile } from "@/hooks/Profile/useProfile"
import { GeneralSettingsSkeleton } from "@/components/test-settings/settingsSkeletons"
import { useEffect, useState } from "react"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"
import { useNotification } from "@/components/NotificationProvider"

export function GeneralSettings() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const {
    user,
    isLoading,
    isSaving,
    error,
    success,
    formData,
    profileData,
    selectedFile,
    previewUrl,
    isEditMode,
    fileInputRef,
    shouldShowSkeleton,
    computedAvatarSrc,
    handleInputChange,
    handleSubmit,
    handleFileChange,
    handleCancelEdit,
    setIsEditMode,
    setError,
    setSuccess,
  } = useUserProfile()

  const { success: notifySuccess, error: notifyError } = useNotification()

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

  const handleProfileImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  if (shouldShowSkeleton) {
    return <GeneralSettingsSkeleton />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your basic profile information</CardDescription>
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
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex items-end">
              {isEditMode ? (
                <button
                  onClick={handleProfileImageUpload}
                  className="group h-24 w-24 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Avatar className="h-24 w-24 border-2 border-gray-200">
                    <AvatarImage 
                      src={previewUrl || computedAvatarSrc || "/placeholder.svg"} 
                      alt="Profile picture"
                    />
                    <AvatarFallback className="text-lg">
                      {formData.first_name[0]}
                      {formData.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="h-24 w-24 -mt-24 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                </button>
              ) : (
                <Avatar className="h-24 w-24 border-2 border-gray-200">
                  <AvatarImage 
                    src={computedAvatarSrc || "/placeholder.svg"} 
                    alt="Profile picture"
                  />
                  <AvatarFallback className="text-lg">
                    {formData.first_name[0]}
                    {formData.last_name[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="ml-2 mb-1">
                {profileData?.is_verified ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {isEditMode}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                readOnly={true}
                className="bg-muted"
                disabled
              />
              <p className="text-xs text-muted-foreground">First name cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                readOnly={true}
                className="bg-muted"
                disabled
              />
              <p className="text-xs text-muted-foreground">Last name cannot be changed</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
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
        description="This will update your profile information. Proceed?"
        confirmText="Save"
        cancelText="Cancel"
        variant="default"
        onConfirm={async () => {
          try {
            // Call submit handler directly; it reads from state
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
