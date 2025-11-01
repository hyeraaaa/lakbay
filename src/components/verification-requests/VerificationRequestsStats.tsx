"use client"

import { AdminStatsCard, type StatItem } from "@/components/admin/AdminStatsCard"
import { FileCheck, Clock, CheckCircle, XCircle } from "lucide-react"

type VerificationRequest = {
  status: "pending" | "approved" | "rejected" | string
}

type VerificationRequestsStatsProps = {
  totalItems: number
  requests: VerificationRequest[]
  loading?: boolean
}

export default function VerificationRequestsStats({ totalItems, requests, loading = false }: VerificationRequestsStatsProps) {
  const pending = requests.filter(r => r.status === "pending").length
  const approved = requests.filter(r => r.status === "approved").length
  const rejected = requests.filter(r => r.status === "rejected").length

  const stats: StatItem[] = [
    { label: "Total Requests", value: totalItems, icon: FileCheck },
    { label: "Pending", value: pending, icon: Clock },
    { label: "Approved", value: approved, icon: CheckCircle },
    { label: "Rejected", value: rejected, icon: XCircle },
  ]

  return <AdminStatsCard stats={stats} loading={loading} />
}


