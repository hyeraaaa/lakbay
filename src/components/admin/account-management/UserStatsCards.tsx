"use client"

import { AdminStatsCard, type StatItem } from '@/components/admin/AdminStatsCard'
import { Users, UserCheck, UserX, ShieldBan } from 'lucide-react'
// Stats card now accepts explicit counts so it is independent of table filters/pagination

type UserStatsCardsProps = {
  totalUsers: number
  active: number
  deactivated: number
  banned: number
  loading?: boolean
}

export function UserStatsCards({ totalUsers, active, deactivated, banned, loading = false }: UserStatsCardsProps) {
  const stats: StatItem[] = [
    { label: "Total Users", value: totalUsers, icon: Users },
    { label: "Active", value: active, icon: UserCheck },
    { label: "Deactivated", value: deactivated, icon: UserX },
    { label: "Banned", value: banned, icon: ShieldBan },
  ]

  return <AdminStatsCard stats={stats} loading={loading} />
}

