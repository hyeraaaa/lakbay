"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, ShieldBan } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminUserSummary } from '@/services/adminUserService'

type UserStatsCardsProps = {
  totalUsers: number
  users: AdminUserSummary[]
  loading?: boolean
}

export function UserStatsCards({ totalUsers, users, loading = false }: UserStatsCardsProps) {
  // Calculate stats from the current users array
  const stats = {
    active: users.filter(u => u.account_status.toLowerCase() === 'active').length,
    deactivated: users.filter(u => u.account_status.toLowerCase() === 'deactivated').length,
    banned: users.filter(u => u.account_status.toLowerCase() === 'banned').length,
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="min-h-[100px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <Card className="min-h-[100px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </CardContent>
      </Card>

      <Card className="min-h-[100px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
        </CardContent>
      </Card>

      <Card className="min-h-[100px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deactivated</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.deactivated}</div>
        </CardContent>
      </Card>

      <Card className="min-h-[100px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Banned</CardTitle>
          <ShieldBan className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.banned}</div>
        </CardContent>
      </Card>
    </div>
  )
}

