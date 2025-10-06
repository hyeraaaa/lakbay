"use client"

import React, { useEffect, useState, useCallback } from 'react'
import UsersDataTable from '@/components/admin/UsersDataTable'
import { adminUserService, type AdminUserSummary } from '@/services/adminUserService'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
 
import { encodeId } from '@/lib/idCodec'
import { ConfirmationDialog } from '@/components/confirmation-dialog/confimationDialog'
import { useNotification } from '@/components/NotificationProvider'

export default function Page() {
  const { success, error } = useNotification()
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [search, setSearch] = useState<string>("")
  const [userType, setUserType] = useState<string>("all")
  const [accountStatus, setAccountStatus] = useState<string>("all")

  const fetchUsers = useCallback(async (nextPage?: number) => {
    setLoading(true)
    try {
      const res = await adminUserService.listUsers({
        page: nextPage ?? page,
        limit,
        search: search || undefined,
        userType: userType !== 'all' ? userType : undefined,
        accountStatus: accountStatus !== 'all' ? accountStatus : undefined,
      })
      setUsers(res.users)
      setTotalPages(res.pagination.totalPages)
      setTotalItems(res.pagination.total)
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, userType, accountStatus])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [pendingAction, setPendingAction] = useState<{ action: 'activate' | 'deactivate' | 'ban'; userId: number } | null>(null)

  const handleAction = async (action: "view" | "activate" | "deactivate" | "ban", userId: number) => {
    if (action === 'view') {
      // Navigate to encoded profile page
      window.location.href = `/profile/${encodeId(String(userId))}`
      return
    }
    setPendingAction({ action, userId })
    setConfirmOpen(true)
  }

  const applyFilters = () => {
    setPage(1)
    fetchUsers(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search name, email, username" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={userType} onValueChange={setUserType}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={accountStatus} onValueChange={setAccountStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="deactivated">Deactivated</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={applyFilters} disabled={loading}>Apply</Button>
      </div>

      <UsersDataTable
        users={users}
        onAction={handleAction}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={limit}
        onPageChange={(p) => { setPage(p); fetchUsers(p) }}
      />

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingAction?.action === 'activate' ? 'Activate User' : pendingAction?.action === 'deactivate' ? 'Deactivate User' : 'Ban User'}
        description={pendingAction?.action === 'activate'
          ? 'This will set the account status to active and allow the user to access their account.'
          : pendingAction?.action === 'deactivate'
            ? 'This will deactivate the account and prevent the user from accessing their account.'
            : 'This will ban the account and block access permanently until unbanned.'}
        confirmText={pendingAction?.action === 'activate' ? 'Activate' : pendingAction?.action === 'deactivate' ? 'Deactivate' : 'Ban'}
        variant={pendingAction?.action === 'ban' ? 'destructive' : 'default'}
        onConfirm={async () => {
          if (!pendingAction) return
          setLoading(true)
          try {
            if (pendingAction.action === 'activate') await adminUserService.activateUser(pendingAction.userId)
            if (pendingAction.action === 'deactivate') await adminUserService.deactivateUser(pendingAction.userId)
            if (pendingAction.action === 'ban') await adminUserService.banUser(pendingAction.userId)
            const message = pendingAction.action === 'activate' ? 'User activated' : pendingAction.action === 'deactivate' ? 'User deactivated' : 'User banned'
            success(message)
            await fetchUsers()
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Action failed'
            error(message)
          } finally {
            setLoading(false)
            setPendingAction(null)
          }
        }}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  )
}