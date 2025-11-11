"use client"

import { AdminStatsCard, type StatItem } from "@/components/admin/AdminStatsCard"
import { FileCheck, Clock, CheckCircle, XCircle } from "lucide-react"

type VerificationRequestsStatsProps = {
  overallStats: {
    total: number
    pending: number
    approved: number
    rejected: number
  } | null
  loading?: boolean
}

export default function VerificationRequestsStats({ overallStats, loading = false }: VerificationRequestsStatsProps) {
  const stats: StatItem[] = [
    { label: "Total Requests", value: overallStats?.total || 0, icon: FileCheck },
    { label: "Pending", value: overallStats?.pending || 0, icon: Clock },
    { label: "Approved", value: overallStats?.approved || 0, icon: CheckCircle },
    { label: "Rejected", value: overallStats?.rejected || 0, icon: XCircle },
  ]

  return <AdminStatsCard stats={stats} loading={loading} />
}


