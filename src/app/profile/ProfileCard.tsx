"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, User, X, Check, Shield, Mail, Phone, MapPin } from "lucide-react"

export default function ProfileCard({
  profileData,
  user,
  isEditMode,
  setIsEditMode,
  isSaving,
  fileInputRef,
  previewUrl,
  computedAvatarSrc,
  handleFileChange,
  handleCancelEdit,
}: any) {
  return (
    <Card className="mb-4 py-6">
      <CardContent>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            {isEditMode ? (
              <button
                type="button"
                aria-label="Change profile picture"
                onClick={() =>
                  fileInputRef.current && ((fileInputRef.current.value = ""), fileInputRef.current.click())
                }
                className="relative group h-24 w-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 cursor-pointer ring-2 ring-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {previewUrl || computedAvatarSrc ? (
                  <img src={previewUrl || computedAvatarSrc} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
              </button>
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 ring-2 ring-white shadow-md">
                {computedAvatarSrc ? (
                  <img
                    src={computedAvatarSrc || "/placeholder.svg"}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10" />
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                {profileData
                  ? `${profileData.first_name} ${profileData.last_name}`
                  : `${user?.first_name} ${user?.last_name}`}
              </h1>
              <p className="text-base text-gray-600 mb-2">@{profileData?.username || "—"}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium capitalize">
                  <Shield className="h-3.5 w-3.5" />
                  {profileData?.user_type || user?.user_type || "user"}
                </span>
                {profileData?.is_verified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    <Check className="h-3.5 w-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                    <X className="h-3.5 w-3.5" />
                    Not Verified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center justify-center md:justify-start gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{profileData?.email || user?.email}</span>
              </div>
              {profileData?.phone && (
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{profileData.phone}</span>
                </div>
              )}
              {(profileData?.city || profileData?.country) && (
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {[profileData?.city, profileData?.state, profileData?.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {!isEditMode ? (
              <Button size="sm" onClick={() => setIsEditMode(true)} className="flex items-center gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" type="submit" form="profile-form" disabled={isSaving} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  size="sm"
                  className="flex items-center gap-1.5 bg-transparent"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
