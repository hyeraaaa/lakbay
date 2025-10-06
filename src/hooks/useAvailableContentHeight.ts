"use client"

import { useEffect, useState } from "react"

/**
 * Computes available viewport height below the app navbar and filter bar.
 * Expects elements with ids `app-navbar` and `filter-bar` to exist.
 */
export const useAvailableContentHeight = (): number | null => {
  const [contentHeight, setContentHeight] = useState<number | null>(null)

  useEffect(() => {
    const measure = () => {
      const nav = document.getElementById("app-navbar")
      const filters = document.getElementById("filter-bar")
      const navH = nav?.offsetHeight ?? 64
      const filtH = filters?.offsetHeight ?? 44
      const remaining = window.innerHeight - navH - filtH
      setContentHeight(remaining > 0 ? remaining : 0)
    }

    measure()
    const onResize = () => measure()
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onResize)

    const ResizeObs = (window as Window & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver
    let roNav: ResizeObserver | null = null
    let roFilter: ResizeObserver | null = null
    if (ResizeObs) {
      roNav = new ResizeObs(measure)
      roFilter = new ResizeObs(measure)
      const navEl = document.getElementById("app-navbar")
      const filtEl = document.getElementById("filter-bar")
      if (navEl) roNav.observe(navEl)
      if (filtEl) roFilter.observe(filtEl)
    }

    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
      if (roNav) roNav.disconnect()
      if (roFilter) roFilter.disconnect()
    }
  }, [])

  return contentHeight
}


