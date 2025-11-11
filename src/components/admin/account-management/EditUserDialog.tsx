"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminUserService, type AdminUserSummary } from '@/services/adminUserService'
import { useNotification } from '@/components/NotificationProvider'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUserSummary | null
  onSuccess: () => void
}

type UserUpdateData = {
  first_name?: string
  last_name?: string
  username?: string | null
  email?: string
  phone?: string | null
  user_type?: string
  account_status?: string
  is_active?: boolean
  is_verified?: boolean
  is_email_verified?: boolean
  is_phone_verified?: boolean
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}

export default function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [formData, setFormData] = useState<UserUpdateData>({})
  const [errors, setErrors] = useState<Partial<Record<keyof UserUpdateData, string>>>({})

  // Fetch full user details when dialog opens
  useEffect(() => {
    if (open && user) {
      // First, populate with data we already have from the list
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        user_type: user.user_type || '',
        account_status: user.account_status || '',
        is_active: user.is_active ?? true,
        is_verified: user.is_verified ?? false,
        is_email_verified: user.is_email_verified ?? false,
        is_phone_verified: user.is_phone_verified ?? false,
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      })

      // Then fetch full details to get address fields and any other missing data
      setFetching(true)
      adminUserService.getUserById(user.user_id)
        .then((fullUser) => {
          setFormData(prev => ({
            ...prev,
            // Update with any fields that might be different
            first_name: fullUser.first_name || prev.first_name || '',
            last_name: fullUser.last_name || prev.last_name || '',
            username: fullUser.username || prev.username || '',
            email: fullUser.email || prev.email || '',
            phone: fullUser.phone || prev.phone || '',
            user_type: fullUser.user_type || prev.user_type || '',
            account_status: fullUser.account_status || prev.account_status || '',
            is_active: fullUser.is_active ?? prev.is_active ?? true,
            is_verified: fullUser.is_verified ?? prev.is_verified ?? false,
            is_email_verified: fullUser.is_email_verified ?? prev.is_email_verified ?? false,
            is_phone_verified: fullUser.is_phone_verified ?? prev.is_phone_verified ?? false,
            // Address fields from full user data
            address_line1: fullUser.address_line1 || '',
            address_line2: fullUser.address_line2 || '',
            city: fullUser.city || '',
            state: fullUser.state || '',
            postal_code: fullUser.postal_code || '',
            country: fullUser.country || '',
          }))
        })
        .catch((e) => {
          // If fetch fails, we still have the basic data from the list
          console.warn('Failed to fetch full user details, using summary data:', e)
          // Don't show error to user since we have the basic data
        })
        .finally(() => {
          setFetching(false)
        })
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({})
    }
  }, [open, user, error])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserUpdateData, string>> = {}

    if (formData.first_name !== undefined && !formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (formData.last_name !== undefined && !formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (formData.email !== undefined && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (formData.phone !== undefined && formData.phone && !formData.phone.startsWith('+63')) {
      newErrors.phone = 'Phone must start with +63'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!user) return

    setLoading(true)
    try {
      // Build update data - include all fields that are in the form
      const updateData: UserUpdateData = {}

      // Required string fields - always include if they exist in formData
      if (formData.first_name !== undefined) {
        updateData.first_name = formData.first_name.trim()
      }
      if (formData.last_name !== undefined) {
        updateData.last_name = formData.last_name.trim()
      }
      if (formData.email !== undefined) {
        updateData.email = formData.email.trim()
      }

      // Optional string fields - include if they have values, otherwise null
      if (formData.username?.trim()) {
        updateData.username = formData.username.trim()
      } else if (formData.username !== undefined) {
        updateData.username = null
      }

      if (formData.phone?.trim()) {
        updateData.phone = formData.phone.trim()
      } else if (formData.phone !== undefined) {
        updateData.phone = null
      }

      // Enum fields - only include if they have valid values
      if (formData.user_type && ['admin', 'owner', 'customer'].includes(formData.user_type)) {
        updateData.user_type = formData.user_type
      }
      if (formData.account_status && ['active', 'suspended', 'banned', 'deactivated'].includes(formData.account_status)) {
        updateData.account_status = formData.account_status
      }

      // Boolean fields - always include if defined
      if (formData.is_active !== undefined) {
        updateData.is_active = Boolean(formData.is_active)
      }
      if (formData.is_verified !== undefined) {
        updateData.is_verified = Boolean(formData.is_verified)
      }
      if (formData.is_email_verified !== undefined) {
        updateData.is_email_verified = Boolean(formData.is_email_verified)
      }
      if (formData.is_phone_verified !== undefined) {
        updateData.is_phone_verified = Boolean(formData.is_phone_verified)
      }

      // Address fields - include if they have values, otherwise null
      if (formData.address_line1?.trim()) {
        updateData.address_line1 = formData.address_line1.trim()
      } else if (formData.address_line1 !== undefined) {
        updateData.address_line1 = null
      }

      if (formData.address_line2?.trim()) {
        updateData.address_line2 = formData.address_line2.trim()
      } else if (formData.address_line2 !== undefined) {
        updateData.address_line2 = null
      }

      if (formData.city?.trim()) {
        updateData.city = formData.city.trim()
      } else if (formData.city !== undefined) {
        updateData.city = null
      }

      if (formData.state?.trim()) {
        updateData.state = formData.state.trim()
      } else if (formData.state !== undefined) {
        updateData.state = null
      }

      if (formData.postal_code?.trim()) {
        updateData.postal_code = formData.postal_code.trim()
      } else if (formData.postal_code !== undefined) {
        updateData.postal_code = null
      }

      if (formData.country?.trim()) {
        updateData.country = formData.country.trim()
      } else if (formData.country !== undefined) {
        updateData.country = null
      }

      console.log('Sending update data:', updateData)
      await adminUserService.updateUser(user.user_id, updateData)
      success('User updated successfully')
      onSuccess()
      onOpenChange(false)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update user'
      error(message)
      console.error('Update error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof UserUpdateData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSelectChange = (field: keyof UserUpdateData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBooleanChange = (field: keyof UserUpdateData) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const digitsOnly = e.target.value.replace(/\D/g, "")
    
    // Limit to 10 digits (Philippines phone format)
    const limitedDigits = digitsOnly.slice(0, 10)
    
    // Add +63 prefix
    const fullWithCountry = limitedDigits ? `+63${limitedDigits}` : ""
    
    setFormData(prev => ({ ...prev, phone: fullWithCountry }))
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }))
    }
  }

  // Display phone without +63 prefix
  const displayPhone = (formData.phone || "").replace(/^\+63/, "")

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Information</DialogTitle>
          <DialogDescription>
            Update user information. Password cannot be changed through this form.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="py-8 text-center text-muted-foreground">Loading user details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={handleChange('first_name')}
                  placeholder="John"
                  disabled={loading}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={handleChange('last_name')}
                  placeholder="Doe"
                  disabled={loading}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username || ''}
                  onChange={handleChange('username')}
                  placeholder="johndoe"
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange('email')}
                  placeholder="john@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm text-muted-foreground bg-muted">
                    +63
                  </span>
                  <Input
                    id="phone"
                    value={displayPhone}
                    onChange={handlePhoneChange}
                    placeholder="9XXXXXXXXX"
                    className="rounded-l-none"
                    disabled={loading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: 9XXXXXXXXX (10 digits)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_type">User Type</Label>
                <Select
                  value={formData.user_type || ''}
                  onValueChange={handleSelectChange('user_type')}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_status">Account Status</Label>
                <Select
                  value={formData.account_status || ''}
                  onValueChange={handleSelectChange('account_status')}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_line1">Address Line 1</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1 || ''}
                  onChange={handleChange('address_line1')}
                  placeholder="123 Main St"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2 || ''}
                  onChange={handleChange('address_line2')}
                  placeholder="Apt 4B"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={handleChange('city')}
                  placeholder="Manila"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={handleChange('state')}
                  placeholder="Metro Manila"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code || ''}
                  onChange={handleChange('postal_code')}
                  placeholder="1000"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={handleChange('country')}
                placeholder="Philippines"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active ?? false}
                    onChange={(e) => handleBooleanChange('is_active')(e.target.checked)}
                    disabled={loading}
                    className="rounded"
                  />
                  Active
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified ?? false}
                    onChange={(e) => handleBooleanChange('is_verified')(e.target.checked)}
                    disabled={loading}
                    className="rounded"
                  />
                  Verified
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_email_verified ?? false}
                    onChange={(e) => handleBooleanChange('is_email_verified')(e.target.checked)}
                    disabled={loading}
                    className="rounded"
                  />
                  Email Verified
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_phone_verified ?? false}
                    onChange={(e) => handleBooleanChange('is_phone_verified')(e.target.checked)}
                    disabled={loading}
                    className="rounded"
                  />
                  Phone Verified
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

