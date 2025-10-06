"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

interface EmailSettingsCardProps {
  email: string
  setEmail: (email: string) => void
  isUpdating: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function EmailSettingsCard({ email, setEmail, isUpdating, onSubmit }: EmailSettingsCardProps) {
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
        <form onSubmit={onSubmit} className="space-y-4">
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
          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Email"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
