import { useState } from 'react'
import type { Report } from '@/types/report'

export function useReportDialog() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
  const [editStatus, setEditStatus] = useState<string>("")
  const [editPriority, setEditPriority] = useState<string>("")
  const [editAdminNotes, setEditAdminNotes] = useState<string>("")
  const [editResolutionNotes, setEditResolutionNotes] = useState<string>("")
  const [updating, setUpdating] = useState<boolean>(false)

  const openDialog = (report: Report) => {
    setSelectedReport(report)
    setEditStatus(report.status)
    setEditPriority(report.priority)
    setEditAdminNotes(report.admin_notes || "")
    setEditResolutionNotes(report.resolution_notes || "")
    setShowEditDialog(true)
  }

  const closeDialog = () => {
    setShowEditDialog(false)
  }

  return {
    selectedReport,
    showEditDialog,
    editStatus,
    editPriority,
    editAdminNotes,
    editResolutionNotes,
    updating,
    setEditStatus,
    setEditPriority,
    setEditAdminNotes,
    setEditResolutionNotes,
    setUpdating,
    openDialog,
    closeDialog,
  }
}

