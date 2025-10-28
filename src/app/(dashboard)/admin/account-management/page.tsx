"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { UsersDataTable, AdminRegistrationDialog, UserStatsCards, UsersPagination } from '@/components/admin/account-management'
import { adminUserService, type AdminUserSummary } from '@/services/adminUserService'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { UserPlus, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
 
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
  const [statsLoading, setStatsLoading] = useState<boolean>(false)
  const [hasLoadedStats, setHasLoadedStats] = useState<boolean>(false)
  const [globalCounts, setGlobalCounts] = useState<{ total: number; active: number; deactivated: number; banned: number }>({ total: 0, active: 0, deactivated: 0, banned: 0 })
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [userType, setUserType] = useState<string>("all")
  const [accountStatus, setAccountStatus] = useState<string>("all")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page when search changes
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = useCallback(async (nextPage?: number) => {
    setLoading(true)
    try {
      const res = await adminUserService.listUsers({
        page: nextPage ?? page,
        limit,
        search: debouncedSearch || undefined,
        userType: userType !== 'all' ? userType : undefined,
        accountStatus: accountStatus !== 'all' ? accountStatus : undefined,
      })
      setUsers(res.users)
      setTotalPages(res.pagination.totalPages)
      setTotalItems(res.pagination.total)
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedSearch, userType, accountStatus])

  useEffect(() => {
    fetchUsers()
    // Fetch global counts once on mount
    ;(async () => {
      setStatsLoading(true)
      try {
        const counts = await adminUserService.getGlobalUserCounts()
        setGlobalCounts(counts)
        setHasLoadedStats(true)
      } finally {
        setStatsLoading(false)
      }
    })()
  }, [fetchUsers])

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [pendingAction, setPendingAction] = useState<{ action: 'activate' | 'deactivate' | 'ban'; userId: number } | null>(null)
  const [deactivationReason, setDeactivationReason] = useState<string>("")
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false)

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchUsers(newPage)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Account Management</h2>
        <p className="text-muted-foreground text-pretty">View, manage, and monitor all user accounts across the platform</p>
      </div>
      
      <UserStatsCards
        totalUsers={globalCounts.total}
        active={globalCounts.active}
        deactivated={globalCounts.deactivated}
        banned={globalCounts.banned}
        loading={statsLoading && !hasLoadedStats}
      />
      
      <Card>
      <CardContent>
      <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, email, username" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 border-neutral-300 pl-10" />
          </div>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger className="border-neutral-300"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accountStatus} onValueChange={setAccountStatus}>
            <SelectTrigger className="border-neutral-300"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setRegisterDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Register New Admin
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="border border-neutral-300 bg-white">
            <div className="overflow-x-auto">
              <div className="min-w-[980px] p-4">
                {/* Table header skeleton */}
                <div className="grid grid-cols-7 gap-4 px-2 py-2 border-b">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-20" />
                </div>
                {/* Rows skeleton */}
                <div className="space-y-3 mt-2">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div key={idx} className="grid grid-cols-7 gap-4 items-center px-2 py-3 border-b last:border-0">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                      <div className="flex justify-start">
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <UsersDataTable
          users={users}
          onAction={handleAction}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={limit}
          onPageChange={(p) => { setPage(p); fetchUsers(p) }}
        />
      )}

      {!loading && users.length > 0 && (
        <UsersPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          loading={loading}
          onPageChange={handlePageChange}
        />
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingAction?.action === 'activate' ? 'Activate User' : pendingAction?.action === 'deactivate' ? 'Deactivate User' : 'Ban User'}
        description={
          <div className="space-y-3">
            <p>
              {pendingAction?.action === 'activate'
                ? 'This will set the account status to active and allow the user to access their account.'
                : pendingAction?.action === 'deactivate'
                  ? 'This will deactivate the account and prevent the user from accessing their account.'
                  : 'This will ban the account and block access permanently until unbanned.'}
            </p>
            {pendingAction?.action === 'deactivate' && (
              <div className="space-y-2">
                <Label htmlFor="deactivation-reason" className="text-sm font-medium text-gray-700">
                  Reason for deactivation *
                </Label>
                <Textarea
                  id="deactivation-reason"
                  placeholder="Please provide a reason for deactivating this user..."
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            )}
          </div>
        }
        confirmText={pendingAction?.action === 'activate' ? 'Activate' : pendingAction?.action === 'deactivate' ? 'Deactivate' : 'Ban'}
        variant={pendingAction?.action === 'ban' ? 'destructive' : 'default'}
        onConfirm={async () => {
          if (!pendingAction) return
          
          // Validate reason for deactivation
          if (pendingAction.action === 'deactivate' && !deactivationReason.trim()) {
            error('Please provide a reason for deactivation')
            return
          }
          
          setLoading(true)
          try {
            if (pendingAction.action === 'activate') await adminUserService.activateUser(pendingAction.userId)
            if (pendingAction.action === 'deactivate') await adminUserService.deactivateUser(pendingAction.userId, deactivationReason.trim())
            if (pendingAction.action === 'ban') await adminUserService.banUser(pendingAction.userId)
            const message = pendingAction.action === 'activate' ? 'User activated' : pendingAction.action === 'deactivate' ? 'User deactivated' : 'User banned'
            success(message)
            await fetchUsers()
            // Refresh global counts after a state-changing action
            setStatsLoading(true)
            adminUserService.getGlobalUserCounts()
              .then(setGlobalCounts)
              .finally(() => setStatsLoading(false))
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Action failed'
            error(message)
          } finally {
            setLoading(false)
            setPendingAction(null)
            setDeactivationReason("")
          }
        }}
        onCancel={() => {
          setPendingAction(null)
          setDeactivationReason("")
        }}
      />

      <AdminRegistrationDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        onSuccess={() => {
          fetchUsers()
          // Refresh global counts after registration
          setStatsLoading(true)
          adminUserService.getGlobalUserCounts()
            .then(setGlobalCounts)
            .finally(() => setStatsLoading(false))
        }}
      />
    </div>
      </CardContent>
    </Card>
    </div>
  )
}