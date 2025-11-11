import { useEffect, useState, useCallback } from 'react'
import { adminUserService, type AdminUserSummary } from '@/services/adminUserService'
import { useNotification } from '@/components/NotificationProvider'

export const useAccountManagement = () => {
  const { success, error } = useNotification()
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [statsLoading, setStatsLoading] = useState<boolean>(false)
  const [initialLoading, setInitialLoading] = useState<boolean>(true)
  const [filteredCounts, setFilteredCounts] = useState<{ total: number; active: number; deactivated: number; banned: number }>({ total: 0, active: 0, deactivated: 0, banned: 0 })
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [userType, setUserType] = useState<string>("all")
  const [accountStatus, setAccountStatus] = useState<string>("all")
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [pendingAction, setPendingAction] = useState<{ action: 'activate' | 'deactivate' | 'ban'; userId: number } | null>(null)
  const [deactivationReason, setDeactivationReason] = useState<string>("")
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false)
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false)
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page when search changes
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [search])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [userType, accountStatus])

  // Prevent admin user type from being selected
  useEffect(() => {
    if (userType === 'admin') {
      setUserType('all')
    }
  }, [userType])

  const fetchUsers = useCallback(async (nextPage?: number) => {
    setLoading(true)
    try {
      // Don't fetch admin users - exclude them from the query
      const userTypeFilter = userType !== 'all' && userType !== 'admin' ? userType : undefined
      
      const res = await adminUserService.listUsers({
        page: nextPage ?? page,
        limit,
        search: debouncedSearch || undefined,
        userType: userTypeFilter,
        accountStatus: accountStatus !== 'all' ? accountStatus : undefined,
      })
      
      // Filter out admin users from results
      const filteredUsers = res.users.filter(user => user.user_type.toLowerCase() !== 'admin')
      
      // Calculate correct totals excluding admin users
      let totalItemsExcludingAdmins = res.pagination.total
      
      // If userType is 'all' or not specified, we need to get counts for customer and owner separately
      // to exclude admin users from the total count
      if (!userTypeFilter) {
        const [customerRes, ownerRes] = await Promise.all([
          adminUserService.listUsers({
            page: 1,
            limit: 1,
            search: debouncedSearch || undefined,
            userType: 'customer',
            accountStatus: accountStatus !== 'all' ? accountStatus : undefined,
          }),
          adminUserService.listUsers({
            page: 1,
            limit: 1,
            search: debouncedSearch || undefined,
            userType: 'owner',
            accountStatus: accountStatus !== 'all' ? accountStatus : undefined,
          }),
        ])
        totalItemsExcludingAdmins = customerRes.pagination.total + ownerRes.pagination.total
      }
      // If filtering by specific type (customer or owner), use the count directly since admins are already excluded
      
      const totalPagesExcludingAdmins = Math.ceil(totalItemsExcludingAdmins / limit)
      
      setUsers(filteredUsers)
      setTotalPages(totalPagesExcludingAdmins)
      setTotalItems(totalItemsExcludingAdmins)
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedSearch, userType, accountStatus])

  const fetchFilteredCounts = useCallback(async () => {
    setStatsLoading(true)
    try {
      // Always fetch overall counts (excluding admins) regardless of filters
      // Fetch customer and owner counts separately and combine them
      const [customerCounts, ownerCounts] = await Promise.all([
        adminUserService.getFilteredUserCounts({ userType: 'customer' }),
        adminUserService.getFilteredUserCounts({ userType: 'owner' }),
      ])
      
      // Combine the counts
      const overallCounts = {
        total: customerCounts.total + ownerCounts.total,
        active: customerCounts.active + ownerCounts.active,
        deactivated: customerCounts.deactivated + ownerCounts.deactivated,
        banned: customerCounts.banned + ownerCounts.banned,
      }
      
      setFilteredCounts(overallCounts)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Initial load: fetch both stats and users together
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true)
      setStatsLoading(true)
      setLoading(true)
      try {
        await Promise.all([fetchFilteredCounts(), fetchUsers()])
      } finally {
        setInitialLoading(false)
        setStatsLoading(false)
        setLoading(false)
      }
    }
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Fetch users when filters change (after initial load)
  useEffect(() => {
    if (!initialLoading) {
      fetchUsers()
    }
  }, [fetchUsers, initialLoading])

  const handleAction = useCallback(async (action: "view" | "edit" | "activate" | "deactivate" | "ban", userId: number, encodeId: (id: string) => string) => {
    if (action === 'view') {
      // Navigate to encoded profile page
      window.location.href = `/profile/${encodeId(String(userId))}`
      return
    }
    if (action === 'edit') {
      // Find the user in the current list
      const user = users.find(u => u.user_id === userId)
      if (user) {
        setEditingUser(user)
        setEditDialogOpen(true)
      }
      return
    }
    setPendingAction({ action, userId })
    setConfirmOpen(true)
  }, [users])

  const applyFilters = useCallback(() => {
    setPage(1)
    fetchUsers(1)
  }, [fetchUsers])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    fetchUsers(newPage)
  }, [fetchUsers])

  const handleConfirmAction = useCallback(async () => {
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
      // Refresh filtered counts after a state-changing action
      await fetchFilteredCounts()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Action failed'
      error(message)
    } finally {
      setLoading(false)
      setPendingAction(null)
      setDeactivationReason("")
    }
  }, [pendingAction, deactivationReason, error, success, fetchUsers, fetchFilteredCounts])

  const handleCancelAction = useCallback(() => {
    setPendingAction(null)
    setDeactivationReason("")
  }, [])

  const handleRegistrationSuccess = useCallback(() => {
    fetchUsers()
    // Refresh filtered counts after registration
    fetchFilteredCounts()
  }, [fetchUsers, fetchFilteredCounts])

  const handleEditSuccess = useCallback(() => {
    fetchUsers()
    // Refresh filtered counts after edit
    fetchFilteredCounts()
    setEditDialogOpen(false)
    setEditingUser(null)
  }, [fetchUsers, fetchFilteredCounts])

  return {
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
    editDialogOpen,
    editingUser,
    
    // Setters
    setSearch,
    setUserType,
    setAccountStatus,
    setPage,
    setConfirmOpen,
    setDeactivationReason,
    setRegisterDialogOpen,
    setEditDialogOpen,
    setEditingUser,
    
    // Handlers
    handleAction,
    handlePageChange,
    handleConfirmAction,
    handleCancelAction,
    handleRegistrationSuccess,
    handleEditSuccess,
  }
}

