"use client";

import { Input } from "@/components/ui/input";
import { CalendarIcon, Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useCitySearch } from "@/hooks/useCitySearch";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useDateRange } from "@/hooks/useDateRange";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchbarSmProps {
  className?: string;
}

const SearchbarSm = ({ className }: SearchbarSmProps) => {
  const router = useRouter();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
  } = useDateRange();

  const {
    fromLocation,
    setFromLocation,
    suggestions,
    showSuggestions,
    isLoading,
    handleInputChange,
    suggestionsRef,
    setShowSuggestions,
  } = useCitySearch();

  const { selectedIndex, handleKeyDown, resetSelection, selectedItemRef } =
    useKeyboardNavigation({
      suggestions,
      onSelect: (city) => {
        setFromLocation(`${city.name}, ${city.province}`);
        setShowSuggestions(false);
      },
      onClose: () => setShowSuggestions(false),
    });

  const handleClearInput = () => {
    setFromLocation("");
    setShowSuggestions(false);
  };

  const validateFields = () => {
    const errors: string[] = [];
    if (!fromLocation.trim()) errors.push("Please select a location");
    if (!dateRange?.from) errors.push("Please select a start date");
    if (!dateRange?.to) errors.push("Please select an end date");
    if (dateRange?.from && dateRange?.to && dateRange.to <= dateRange.from) {
      errors.push("End date must be after start date");
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSearch = () => {
    setValidationErrors([]);
    if (!validateFields()) return;

    const params = new URLSearchParams();
    // Expect input as "City, Province" from suggestions; ignore barangay
    const [cityRaw = "", provinceRaw = ""] = fromLocation.split(",");
    const city = cityRaw.trim();
    const province = provinceRaw.trim();
    if (city) params.append("city", city);
    if (province) params.append("province", province);
    if (dateRange?.from) params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
    // cache-buster so same search triggers refetch and re-geocode
    params.append("_", Date.now().toString());
    // Push to user listing page so it can fetch with these filters
    router.push(`/user?${params.toString()}`);
  };

  const isLocationValid = fromLocation.trim() !== "";
  const isStartDateValid = dateRange?.from !== undefined;
  const isEndDateValid = dateRange?.to !== undefined;

  return (
    <div
      className={cn(
        // Compact inline layout without any card container styles
        "flex flex-col sm:flex-row sm:flex-nowrap items-stretch gap-2 w-full",
        className
      )}
    >
      {/* Location */}
      <div className="w-full sm:flex-1 min-w-0 hidden lg:block">
        <div className="relative">
          <Input
            id="from-location-sm"
            value={fromLocation}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              handleKeyDown(e);
              if (e.key === "Enter" && !showSuggestions) handleSearch();
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowSuggestions(false);
                resetSelection();
              }, 200);
            }}
            className={cn(
              "border border-gray-200 focus-visible:ring-1 h-10 shadow-none w-full rounded-md pr-9 min-w-0",
              !isLocationValid && validationErrors.length > 0 && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder="Where to?"
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
                      index === selectedIndex && "bg-gray-100"
                    )}
                    onClick={() => {
                      setFromLocation(`${city.name}, ${city.province}`);
                      setShowSuggestions(false);
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

      {/* Dates */}
      <div className="hidden lg:flex items-stretch gap-2 sm:border-l sm:border-gray-200 sm:pl-2">
        <Popover open={isStartPopoverOpen} onOpenChange={setIsStartPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "items-center text-left font-normal h-10 shrink-0",
                !isStartDateValid && validationErrors.length > 0 && "border-red-500 text-red-500"
              )}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {dateRange?.from ? format(dateRange.from, "MMM dd") : "Start"}
              </span>
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
                <Button variant="outline" onClick={handleClearDates} className="flex-1" disabled={!dateRange?.from && !dateRange?.to}>
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
              variant="outline"
              className={cn(
                "items-center text-left font-normal h-10 shrink-0",
                !isEndDateValid && validationErrors.length > 0 && "border-red-500 text-red-500"
              )}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {dateRange?.to ? format(dateRange.to, "MMM dd") : "End"}
              </span>
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
                <Button variant="outline" onClick={handleClearDates} className="flex-1" disabled={!dateRange?.from && !dateRange?.to}>
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

      {/* Search */}
      <Button variant="ghost" onClick={handleSearch} className="rounded-md px-4 h-10 w-full sm:w-auto shrink-0 flex items-center gap-2 justify-center">
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline">Search</span>
      </Button>
    </div>
  );
};

export default SearchbarSm;


