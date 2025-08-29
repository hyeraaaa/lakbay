"use client"
import { AuthenticatedRoute } from "@/components/auth/ProtectedRoute"
import { useUserProfile } from "@/hooks/Profile/useProfile"
import { ProfileSkeleton, FormSkeleton } from "./Skeletons"
import AnimatedAlert from "@/components/ui/AnimatedAlert"
import ProfileCard from "./ProfileCard"
import EditProfileForm from "./EditProfileForm"

export default function Page() {
  const {
    user,
    isLoading,
    isSaving,
    error,
    success,
    formData,
    profileData,
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

  return (
    <AuthenticatedRoute>
      <main className="max-w-4xl mx-auto px-4 mt-10">
        {error && (
          <AnimatedAlert message={error} variant="destructive" position="bottom-right" onClose={() => setError("")} />
        )}
        {success && (
          <AnimatedAlert message={success} variant="default" position="bottom-right" onClose={() => setSuccess("")} />
        )}

        {shouldShowSkeleton ? (
          <>
            <ProfileSkeleton />
            <FormSkeleton />
          </>
        ) : (
          <>
            <ProfileCard
              profileData={profileData}
              user={user}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              isSaving={isSaving}
              fileInputRef={fileInputRef}
              previewUrl={previewUrl}
              computedAvatarSrc={computedAvatarSrc}
              handleFileChange={handleFileChange}
              handleCancelEdit={handleCancelEdit}
            />

            <EditProfileForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isEditMode={isEditMode}
            />
          </>
        )}
      </main>
    </AuthenticatedRoute>
  )
}
