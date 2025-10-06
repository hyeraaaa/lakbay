"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import { useRef, useState } from "react"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"

interface EmailSettingsCardProps {
  email: string
  setEmail: (email: string) => void
  isUpdating: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function EmailSettingsCard({ email, setEmail, isUpdating, onSubmit }: EmailSettingsCardProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const allowSubmitRef = useRef(false)
  const [confirmEmail, setConfirmEmail] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleFormSubmit = (e: React.FormEvent) => {
    if (!allowSubmitRef.current) {
      e.preventDefault()
      const primary = (email ?? "").trim()
      const confirmation = confirmEmail.trim()
      if (!primary || !confirmation) {
        setValidationError("Please fill out both email fields.")
        return
      }
      setValidationError(null)
      setConfirmOpen(true)
      return
    }
    allowSubmitRef.current = false
    onSubmit(e)
  }

  return (
    <Card className="py-5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>Email Address</CardTitle>
        </div>
        <CardDescription>Update your email address for account notifications and login</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">New Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your new email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-md"
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmEmail">Confirm New Email Address</Label>
            <Input
              id="confirmEmail"
              type="email"
              placeholder="Re-enter your new email"
              value={confirmEmail}
              onChange={(e) => {
                setConfirmEmail(e.target.value)
                if (validationError) setValidationError(null)
              }}
              className="max-w-md"
              disabled={isUpdating}
            />
          </div>
          {validationError ? (
            <p className="text-sm text-red-500">{validationError}</p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Email"}
            </Button>
          </div>
        </form>
        <ConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Update email?"
          description="We'll send a verification to the new address if required. Continue?"
          confirmText="Confirm"
          cancelText="Cancel"
          variant="default"
          onConfirm={() => {
            allowSubmitRef.current = true
            setConfirmOpen(false)
            formRef.current?.requestSubmit()
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </CardContent>
    </Card>
  )
}
