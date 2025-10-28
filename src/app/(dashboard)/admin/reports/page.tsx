"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { reportService } from '@/services/reportService'
import { useNotification } from '@/components/NotificationProvider'
import { encodeId } from '@/lib/idCodec'
import type { Report } from '@/types/report'
import { useReportsData } from '@/hooks/reports/useReportsData'
import { useReportStatistics } from '@/hooks/reports/useReportStatistics'
import { useReportDialog } from '@/hooks/reports/useReportDialog'
import {
  ReportStatisticsCards,
  ReportFilters,
  ReportsTable,
  ReportsPagination,
  EditReportDialog,
} from '@/components/admin/reports'

import { Card, CardContent } from '@/components/ui/card'

export default function ReportsPage() {
  const router = useRouter()
  const { success, error } = useNotification()
  
  const {
    reports,
    page,
    totalPages,
    totalItems,
    loading,
    statusFilter,
    priorityFilter,
    entityTypeFilter,
    setPage,
    setStatusFilter,
    setPriorityFilter,
    setEntityTypeFilter,
    fetchReports,
  } = useReportsData()
  
  const { statistics, fetchStatistics } = useReportStatistics()
  
  const {
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
  } = useReportDialog()

  useEffect(() => {
    fetchReports(undefined, error)
    fetchStatistics()
  }, [fetchReports, fetchStatistics, error])

  const handleApplyFilters = () => {
    setPage(1) // Reset to page 1 when applying filters
    fetchReports(1, error)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchReports(newPage, error)
  }

  const handleViewEntity = (report: Report) => {
    if (report.reported_entity_type === 'user') {
      router.push(`/profile/${encodeId(String(report.reported_entity_id))}`)
    } else if (report.reported_entity_type === 'vehicle') {
      router.push(`/admin/reports/view-vehicle/${encodeId(String(report.reported_entity_id))}`)
    }
  }

  const handleEditReport = (report: Report) => {
    openDialog(report)
  }

  const handleUpdateReport = async () => {
    if (!selectedReport) return
    setUpdating(true)
    try {
      const res = await reportService.updateReportStatus(selectedReport.report_id, {
        status: editStatus,
        priority: editPriority,
        admin_notes: editAdminNotes,
        resolution_notes: editResolutionNotes,
      })
      if (res.ok) {
        success('Report updated successfully')
        closeDialog()
        fetchReports(undefined, error)
        fetchStatistics()
      } else {
        error('Failed to update report')
      }
    } catch (e) {
      error('Failed to update report')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Reports Management</h2>
        <p className="text-muted-foreground text-pretty">Review, manage, and resolve user reports and complaints</p>
      </div>
      
      <ReportStatisticsCards statistics={statistics} />
      <Card>
        <CardContent>
        <div className="space-y-4">
        <ReportFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          entityTypeFilter={entityTypeFilter}
          loading={loading}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onEntityTypeChange={setEntityTypeFilter}
          onApply={handleApplyFilters}
        />

        <ReportsTable
          reports={reports}
          loading={loading}
          onViewEntity={handleViewEntity}
          onEditReport={handleEditReport}
        />

        {reports.length > 0 && !loading && (
          <ReportsPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={20}
            loading={loading}
            onPageChange={handlePageChange}
          />
        )}
      </div>
        </CardContent>
      </Card>

      <EditReportDialog
        report={selectedReport}
        open={showEditDialog}
        onOpenChange={(open) => !open && closeDialog()}
        status={editStatus}
        priority={editPriority}
        adminNotes={editAdminNotes}
        resolutionNotes={editResolutionNotes}
        updating={updating}
        onStatusChange={setEditStatus}
        onPriorityChange={setEditPriority}
        onAdminNotesChange={setEditAdminNotes}
        onResolutionNotesChange={setEditResolutionNotes}
        onUpdate={handleUpdateReport}
      />
    </div>
  )
}
