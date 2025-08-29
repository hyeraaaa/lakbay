"use client"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function EditProfileForm({ formData, handleInputChange, handleSubmit, isEditMode = false }: any) {
  return (
    <Card className="py-6 mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Profile Information</CardTitle>
        <CardDescription className="text-sm">
          {isEditMode
            ? "Update your personal details and contact information"
            : "Your personal details and contact information"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First name</label>
              <Input
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={!isEditMode}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last name</label>
              <Input
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={!isEditMode}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
              <Input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditMode}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditMode}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Address line 1</label>
                <Input
                  name="address_line1"
                  type="text"
                  value={formData.address_line1}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Address line 2</label>
                <Input
                  name="address_line2"
                  type="text"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <Input
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State / Province</label>
                <Input
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Postal code</label>
                <Input
                  name="postal_code"
                  type="text"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                <Input
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
