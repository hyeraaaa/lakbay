"use client"

import React from 'react'
import { UsersDataTable, AdminRegistrationDialog, UserStatsCards, UsersPagination } from '@/components/admin/account-management'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
 
import { encodeId } from '@/lib/idCodec'
import { ConfirmationDialog } from '@/components/confirmation-dialog/confimationDialog'
import { useAccountManagement } from '@/hooks/account-management'

export default function Page() {
  const {
    // State
    users,
    page,
    limit,
    totalPages,
    totalItems,
    loading,
    statsLoading,
    initialLoading,
    filteredCounts,
    search,
    userType,
    accountStatus,
    confirmOpen,
    pendingAction,
    deactivationReason,
    registerDialogOpen,
    
    // Setters
    setSearch,
    setUserType,
    setAccountStatus,
    setPage,
    setConfirmOpen,
    setDeactivationReason,
    setRegisterDialogOpen,
    
    // Handlers
    handleAction,
    handlePageChange,
    handleConfirmAction,
    handleCancelAction,
    handleRegistrationSuccess,
  } = useAccountManagement()

  const onAction = (action: "view" | "activate" | "deactivate" | "ban", userId: number) => {
    handleAction(action, userId, encodeId)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-balance">Account Management</h2>
        <p className="text-muted-foreground text-pretty">View, manage, and monitor all user accounts across the platform</p>
      </div>
      
      <UserStatsCards
        totalUsers={filteredCounts.total}
        active={filteredCounts.active}
        deactivated={filteredCounts.deactivated}
        banned={filteredCounts.banned}
        loading={initialLoading || statsLoading}
      />
      
      <Card>
        <CardContent>
          <div>
            {/* Search and Status Filter */}
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search name, email, username"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <Select value={accountStatus} onValueChange={setAccountStatus}>
                <SelectTrigger className="bg-white border-neutral-300">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setRegisterDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Register New Admin
              </Button>
            </div>

            {/* User Type Badge Filters */}
            <div className={`flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-4 ${!initialLoading && !loading && users.length === 0 ? 'border-b' : ''}`}>
              <button 
                onClick={() => {
                  setUserType("all")
                  setPage(1)
                }} 
                className="focus:outline-none"
              >
                <Badge className="rounded-sm px-3 py-1" variant={userType === "all" ? "black" : "outline"}>
                  All
                </Badge>
              </button>
              <button 
                onClick={() => {
                  setUserType("customer")
                  setPage(1)
                }} 
                className="focus:outline-none"
              >
                <Badge className="rounded-sm px-3 py-1" variant={userType === "customer" ? "black" : "outline"}>
                  Customer
                </Badge>
              </button>
              <button 
                onClick={() => {
                  setUserType("owner")
                  setPage(1)
                }} 
                className="focus:outline-none"
              >
                <Badge className="rounded-sm px-3 py-1" variant={userType === "owner" ? "black" : "outline"}>
                  Owner
                </Badge>
              </button>
            </div>

      {initialLoading || loading ? (
        <div className="border border-neutral-300 bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              {/* Table header skeleton */}
              <div className="grid grid-cols-7 gap-4 px-4 py-2 border-b">
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-5 w-[80px]" />
              </div>
              {/* Rows skeleton */}
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-7 gap-4 items-center px-4 py-3 border-b last:border-0">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-6 w-[120px] rounded-full" />
                  <Skeleton className="h-6 w-[120px] rounded-full" />
                  <Skeleton className="h-4 w-[120px]" />
                  <div className="flex justify-start">
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <UsersDataTable
          users={users}
          onAction={onAction}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={limit}
          onPageChange={handlePageChange}
        />
      )}

      {!initialLoading && !loading && users.length > 0 && (
        <div className="mt-4">
          <UsersPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </div>
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
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

      <AdminRegistrationDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        onSuccess={handleRegistrationSuccess}
      />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}