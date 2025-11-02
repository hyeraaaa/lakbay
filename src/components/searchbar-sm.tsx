"use client"

import { Input } from "@/components/ui/input"
import { CalendarIcon, Search, Loader2, X, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { useCitySearch } from "@/hooks/useCitySearch"
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation"
import { useDateRange } from "@/hooks/useDateRange"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"

interface SearchbarSmProps {
  className?: string
}

const SearchbarSmContent = ({ className }: SearchbarSmProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false)

  const {
    dateRange,
    isStartPopoverOpen,
    isEndPopoverOpen,
    totalDays,
    setDateRange,
    setIsStartPopoverOpen,
    setIsEndPopoverOpen,
    handleConfirmDates,
    handleClearDates,
    disablePastDates,
  } = useDateRange()

  const {
    fromLocation,
    setFromLocation,
    suggestions,
    showSuggestions,
    isLoading,
    handleInputChange,
    suggestionsRef,
    setShowSuggestions,
  } = useCitySearch()

  const { selectedIndex, handleKeyDown, resetSelection, selectedItemRef } = useKeyboardNavigation({
    suggestions,
    onSelect: (city) => {
      setFromLocation(`${city.name}, ${city.province}`)
      setShowSuggestions(false)
    },
    onClose: () => setShowSuggestions(false),
  })

  // Initialize state from URL parameters
  useEffect(() => {
    const city = searchParams.get('city')
    const province = searchParams.get('province')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Set location if both city and province exist
    if (city && province) {
      setFromLocation(`${city}, ${province}`)
    } else if (city) {
      setFromLocation(city)
    } else {
      // Clear location if no params
      setFromLocation("")
    }

    // Set date range if both dates exist
    if (startDate && endDate) {
      setDateRange({
        from: new Date(startDate),
        to: new Date(endDate)
      })
    } else {
      // Clear dates if no params
      setDateRange(undefined)
    }
  }, [searchParams, setFromLocation, setDateRange])

  // Listen for reset event
  useEffect(() => {
    const handleReset = () => {
      setFromLocation("")
      setDateRange(undefined)
      setShowSuggestions(false)
      setIsStartPopoverOpen(false)
      setIsEndPopoverOpen(false)
    }

    window.addEventListener('lakbay:reset-filters', handleReset)
    return () => {
      window.removeEventListener('lakbay:reset-filters', handleReset)
    }
  }, [setFromLocation, setDateRange])

  const handleClearInput = () => {
    setFromLocation("")
    setShowSuggestions(false)
  }

  const validateFields = () => {
    const errors: string[] = []
    if (!fromLocation.trim()) errors.push("Please select a location")
    if (!dateRange?.from) errors.push("Please select a start date")
    if (!dateRange?.to) errors.push("Please select an end date")
    if (dateRange?.from && dateRange?.to && dateRange.to <= dateRange.from) {
      errors.push("End date must be after start date")
    }
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSearch = () => {
    setValidationErrors([])
    if (!validateFields()) return

    const params = new URLSearchParams()
    const [cityRaw = "", provinceRaw = ""] = fromLocation.split(",")
    const city = cityRaw.trim()
    const province = provinceRaw.trim()
    if (city) params.append("city", city)
    if (province) params.append("province", province)
    if (dateRange?.from) params.append("startDate", format(dateRange.from, "yyyy-MM-dd"))
    if (dateRange?.to) params.append("endDate", format(dateRange.to, "yyyy-MM-dd"))
    params.append("_", Date.now().toString())
    router.push(`/user?${params.toString()}`)
    setIsSearchPopoverOpen(false)
  }

  const isLocationValid = fromLocation.trim() !== ""
  const isStartDateValid = dateRange?.from !== undefined
  const isEndDateValid = dateRange?.to !== undefined

  const getSearchSummary = () => {
    const locationText = fromLocation || "Where to?"
    const dateText =
      dateRange?.from && dateRange?.to
        ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
        : "Add dates"
    return { locationText, dateText }
  }

  const { locationText, dateText } = getSearchSummary()

  return (
    <>
      <div className={cn("lg:hidden w-full", className)}>
        <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="w-full bg-[#fafafc] border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer">
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{locationText}</div>
                <div className="text-xs text-gray-500 truncate">{dateText}</div>
              </div>
              <Search className="w-5 h-5 text-gray-600 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] lg:hidden" side="bottom">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <label htmlFor="from-location-popover" className="text-xs font-medium text-gray-700 mb-1 block">
                  Location
                </label>
                <Input
                  id="from-location-popover"
                  value={fromLocation}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    handleKeyDown(e)
                    if (e.key === "Enter" && !showSuggestions) handleSearch()
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowSuggestions(false)
                      resetSelection()
                    }, 200)
                  }}
                  className={cn(
                    "border border-gray-300 focus-visible:ring-1 h-10 shadow-none w-full rounded-md pr-9 bg-[#fafafc]",
                    !isLocationValid && validationErrors.length > 0 && "border-red-500 focus-visible:ring-red-500",
                  )}
                  placeholder="From?"
                />
                <div className="absolute right-2 top-[calc(1.5rem+0.25rem)] flex items-center gap-2">
                  {fromLocation && (
                    <button onClick={handleClearInput} className="text-gray-500 hover:text-gray-700 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                </div>
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto"
                  >
                    {isLoading ? (
                      <div className="p-2 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((city, index) => (
                        <div
                          key={index}
                          ref={index === selectedIndex ? selectedItemRef : null}
                          className={cn(
                            "px-3 py-2 hover:bg-gray-100 cursor-pointer",
                            index === selectedIndex && "bg-gray-100",
                          )}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setFromLocation(`${city.name}, ${city.province}`)
                            setShowSuggestions(false)
                            // Focus back to input after selection
                            setTimeout(() => {
                              const input = document.getElementById('from-location-popover')
                              if (input) input.focus()
                            }, 0)
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setFromLocation(`${city.name}, ${city.province}`)
                            setShowSuggestions(false)
                          }}
                        >
                          <div className="text-sm font-medium">{city.name}</div>
                          <div className="text-xs text-gray-500">{city.province}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500 text-center">No results found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
              <label className="text-xs font-medium text-gray-700 mb-2 block">Select Dates</label>
                <div className="scale-100 flex flex-col items-center">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    disabled={disablePastDates}
                    fromDate={new Date()}
                    fromMonth={new Date()}
                    className="rounded-md border"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleSearch}
                className="w-full rounded-md h-10 flex items-center gap-2 justify-center"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>

              {validationErrors.length > 0 && (
                <div className="text-xs text-red-500 space-y-1">
                  {validationErrors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className={cn("hidden lg:flex flex-row flex-nowrap items-stretch gap-2 w-full", className)}>
        <div className="w-full flex-1 min-w-0">
          <div className="relative">
            <Input
              id="from-location-sm"
              value={fromLocation}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                handleKeyDown(e)
                if (e.key === "Enter" && !showSuggestions) handleSearch()
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true)
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowSuggestions(false)
                  resetSelection()
                }, 200)
              }}
              className={cn(
                "border border-gray-300 focus-visible:ring-1 h-10 shadow-none w-full rounded-md pr-9 min-w-0 bg-[#fafafc]",
                !isLocationValid && validationErrors.length > 0 && "border-red-500 focus-visible:ring-red-500",
              )}
              placeholder="From?"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {fromLocation && (
                <button onClick={handleClearInput} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
            </div>
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto"
              >
                {isLoading ? (
                  <div className="p-2 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((city, index) => (
                      <div
                        key={index}
                        ref={index === selectedIndex ? selectedItemRef : null}
                        className={cn(
                          "px-3 py-2 hover:bg-gray-100 cursor-pointer",
                          index === selectedIndex && "bg-gray-100",
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setFromLocation(`${city.name}, ${city.province}`)
                          setShowSuggestions(false)
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setFromLocation(`${city.name}, ${city.province}`)
                          setShowSuggestions(false)
                        }}
                      >
                      <div className="text-sm font-medium">{city.name}</div>
                      <div className="text-xs text-gray-500">{city.province}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500 text-center">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-stretch gap-2 border-l border-gray-200 pl-2">
          <Popover open={isStartPopoverOpen} onOpenChange={setIsStartPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="custom"
                className={cn(
                  "items-center text-left font-normal h-10 shrink-0",
                  !isStartDateValid && validationErrors.length > 0 && "border-red-500 text-red-500",
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{dateRange?.from ? format(dateRange.from, "MMM dd") : "Start Date"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(100vw-2rem,24rem)] sm:w-auto p-0 mt-2" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={disablePastDates}
                fromDate={new Date()}
                fromMonth={new Date()}
              />
              <div className="p-2 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClearDates}
                    className="flex-1 bg-transparent"
                    disabled={!dateRange?.from && !dateRange?.to}
                  >
                    Clear
                  </Button>
                  <Button onClick={handleConfirmDates} className="flex-1" disabled={!dateRange?.from || !dateRange?.to}>
                    Confirm
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={isEndPopoverOpen} onOpenChange={setIsEndPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="custom"
                className={cn(
                  "items-center text-left font-normal h-10 shrink-0",
                  !isEndDateValid && validationErrors.length > 0 && "border-red-500 text-red-500",
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">{dateRange?.to ? format(dateRange.to, "MMM dd") : "End Date"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(100vw-2rem,24rem)] sm:w-auto p-0 mt-2" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={disablePastDates}
              />
              <div className="p-2 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClearDates}
                    className="flex-1 bg-transparent"
                    disabled={!dateRange?.from && !dateRange?.to}
                  >
                    Clear
                  </Button>
                  <Button onClick={handleConfirmDates} className="flex-1" disabled={!dateRange?.from || !dateRange?.to}>
                    Confirm
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="black"
          onClick={handleSearch}
          className="rounded-md px-4 h-10 shrink-0 flex items-center gap-2 justify-center"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </Button>
      </div>
    </>
  )
}

const SearchbarSm = ({ className }: SearchbarSmProps) => {
  return (
    <Suspense fallback={
      <div className={cn("lg:hidden w-full", className)}>
        <div className="w-full bg-[#fafafc] border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-3">
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">Loading...</div>
            <div className="text-xs text-gray-500 truncate">Loading...</div>
          </div>
          <Search className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    }>
      <SearchbarSmContent className={className} />
    </Suspense>
  )
}

export default SearchbarSm
