"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminUserService, type AdminRegistrationData } from '@/services/adminUserService'
import { useNotification } from '@/components/NotificationProvider'

interface AdminRegistrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function AdminRegistrationDialog({ open, onOpenChange, onSuccess }: AdminRegistrationDialogProps) {
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AdminRegistrationData>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof AdminRegistrationData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AdminRegistrationData, string>> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!formData.phone.startsWith('+63')) {
      newErrors.phone = 'Phone must start with +63'
    } else if (!/^\+63\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format +639XXXXXXXXX (13 characters)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await adminUserService.registerAdmin(formData)
      success('Admin registered successfully')
      onSuccess()
      onOpenChange(false)
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        phone: '',
      })
      setErrors({})
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to register admin'
      error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof AdminRegistrationData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Admin</DialogTitle>
          <DialogDescription>
            Create a new administrator account. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={handleChange('first_name')}
                placeholder="John"
                disabled={loading}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
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
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleChange('username')}
                placeholder="johndoe"
                disabled={loading}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="john@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register Admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

