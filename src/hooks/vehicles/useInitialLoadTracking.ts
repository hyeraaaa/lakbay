import { useEffect, useRef } from 'react'

/**
 * Hook to track when initial load is complete
 * Useful for coordinating loading states between multiple data sources
 * 
 * @param conditions Array of conditions to check. Each condition should have:
 *   - dataReady: whether the data is available
 *   - loading: whether the data is currently loading
 * @returns true when all conditions have completed their initial load
 */
export function useInitialLoadTracking(
  conditions: {
    dataReady: boolean
    loading: boolean
  }[]
): boolean {
  const hasInitialLoadCompletedRef = useRef(false)

  useEffect(() => {
    // Initial load is complete when all conditions are met
    const allReady = conditions.every(
      ({ dataReady, loading }) => dataReady && !loading
    )

    if (!hasInitialLoadCompletedRef.current && allReady) {
      hasInitialLoadCompletedRef.current = true
    }
    // Note: We intentionally check conditions on every render to detect when they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditions.map(c => `${c.dataReady}-${c.loading}`).join(',')])

  return hasInitialLoadCompletedRef.current
}

