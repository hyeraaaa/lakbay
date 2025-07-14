"use client";

import { Input } from "@/components/ui/input";
import { CalendarIcon, Search, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useCitySearch } from "@/hooks/useCitySearch";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useDateRange } from "@/hooks/useDateRange";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchbarProps {
  className?: string;
}

const Searchbar = ({ className }: SearchbarProps) => {
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

    // Check if location is filled
    if (!fromLocation.trim()) {
      errors.push("Please select a location");
    }

    // Check if start date is selected
    if (!dateRange?.from) {
      errors.push("Please select a start date");
    }

    // Check if end date is selected
    if (!dateRange?.to) {
      errors.push("Please select an end date");
    }

    // Check if end date is after start date
    if (dateRange?.from && dateRange?.to && dateRange.to <= dateRange.from) {
      errors.push("End date must be after start date");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSearch = () => {
    // Clear previous validation errors
    setValidationErrors([]);

    // Validate all fields
    if (!validateFields()) {
      return;
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append("location", fromLocation.trim());

    if (dateRange?.from) {
      params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
    }

    if (dateRange?.to) {
      params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
    }

    // Redirect to search results page
    router.push(`/search?${params.toString()}`);
  };

  const isLocationValid = fromLocation.trim() !== "";
  const isStartDateValid = dateRange?.from !== undefined;
  const isEndDateValid = dateRange?.to !== undefined;
  const isDateRangeValid =
    !dateRange?.from || !dateRange?.to || dateRange.to > dateRange.from;

  return (
    <>
      <div
        className={cn(
          "bg-white shadow-md rounded-sm p-2 border border-gray-200 flex flex-col sm:flex-row items-stretch gap-2 max-w-4xl w-full",
          className
        )}
      >
        {/* Where */}
        <div className="w-full sm:flex-1">
          <div className="relative">
            <div>
              <label
                htmlFor="from-location"
                className="absolute text-xs text-gray-500 top-1 left-3 z-10"
              >
                Where
              </label>
              <Input
                id="from-location"
                value={fromLocation}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  handleKeyDown(e);
                  // Allow Enter key to trigger search
                  if (e.key === "Enter" && !showSuggestions) {
                    handleSearch();
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay closing to allow for click events on suggestions
                  setTimeout(() => {
                    setShowSuggestions(false);
                    resetSelection();
                  }, 200);
                }}
                className={cn(
                  "border border-gray-200 focus-visible:ring-1 pt-6 pb-2 h-auto hover:bg-accent transition-colors shadow-none w-full rounded-md",
                  !isLocationValid &&
                    validationErrors.length > 0 &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
                placeholder="Search for a city, municipality, province, or region..."
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {fromLocation && (
                  <button
                    onClick={handleClearInput}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-3 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
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
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                          index === selectedIndex ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          setFromLocation(`${city.name}, ${city.province}`);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-xs text-gray-500">
                          {city.province}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dates and Search */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:border-l sm:border-gray-200 sm:pl-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Popover
              open={isStartPopoverOpen}
              onOpenChange={setIsStartPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "items-center text-left font-normal h-[52px] flex-1 sm:flex-none",
                    !isStartDateValid &&
                      validationErrors.length > 0 &&
                      "border-red-500 text-red-500"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>
                    {dateRange?.from
                      ? format(dateRange.from, "MMM dd, yyyy")
                      : "Trip Start"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 mt-3" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={disablePastDates}
                  fromDate={new Date()}
                  fromMonth={new Date()}
                />
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {totalDays > 0
                        ? `${totalDays} day${totalDays > 1 ? "s" : ""}`
                        : "Select dates"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleClearDates}
                      className="flex-1"
                      disabled={!dateRange?.from && !dateRange?.to}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleConfirmDates}
                      className="flex-1"
                      disabled={!dateRange?.from || !dateRange?.to}
                    >
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
                    "items-center text-left font-normal h-[52px] flex-1 sm:flex-none",
                    !isEndDateValid &&
                      validationErrors.length > 0 &&
                      "border-red-500 text-red-500"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>
                    {dateRange?.to
                      ? format(dateRange.to, "MMM dd, yyyy")
                      : "Trip End"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 mt-3" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={disablePastDates}
                />
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {totalDays > 0
                        ? `${totalDays} day${totalDays > 1 ? "s" : ""}`
                        : "Select dates"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleClearDates}
                      className="flex-1"
                      disabled={!dateRange?.from && !dateRange?.to}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleConfirmDates}
                      className="flex-1"
                      disabled={!dateRange?.from || !dateRange?.to}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button */}
          <Button
            variant="default"
            onClick={handleSearch}
            className="rounded-md text-white px-6 h-[52px] w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 max-w-4xl w-full">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Please complete the following:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Searchbar;
