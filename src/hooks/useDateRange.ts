"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";

interface UseDateRangeReturn {
  dateRange: DateRange | undefined;
  isStartPopoverOpen: boolean;
  isEndPopoverOpen: boolean;
  totalDays: number;
  setDateRange: (range: DateRange | undefined) => void;
  setIsStartPopoverOpen: (isOpen: boolean) => void;
  setIsEndPopoverOpen: (isOpen: boolean) => void;
  handleConfirmDates: () => void;
  handleClearDates: () => void;
  disablePastDates: (date: Date) => boolean;
}

export const useDateRange = (): UseDateRangeReturn => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false);
  const [isEndPopoverOpen, setIsEndPopoverOpen] = useState(false);

  const getTotalDays = () => {
    if (dateRange?.from && dateRange?.to) {
      return differenceInDays(dateRange.to, dateRange.from) + 1;
    }
    return 0;
  };

  const handleConfirmDates = () => {
    setIsStartPopoverOpen(false);
    setIsEndPopoverOpen(false);
  };

  const handleClearDates = () => {
    setDateRange(undefined);
  };

  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return {
    dateRange,
    isStartPopoverOpen,
    isEndPopoverOpen,
    totalDays: getTotalDays(),
    setDateRange,
    setIsStartPopoverOpen,
    setIsEndPopoverOpen,
    handleConfirmDates,
    handleClearDates,
    disablePastDates,
  };
};
