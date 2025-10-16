"use client";

import { cn } from "@/lib/utils";
import PriceFilterPopover from "./PriceFilterPopover";
import TypeFilterPopover from "./TypeFilterPopover";
import MakeModelDropdown from "./MakeModelDropdown";
import YearFilterPopover from "./YearFilterPopover";
import SeatsFilterPopover from "./SeatsFilterPopover";
import AllFiltersPopover from "./AllFiltersPopover";

interface FilterBarProps {
  className?: string;
}

const FilterBar = ({ className }: FilterBarProps) => {
  return (
    <div
      id="filter-bar"
      className={cn(
        "w-full",
        className
      )}
    >
      <div className="mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:[-ms-overflow-style:auto] lg:[scrollbar-width:auto] lg:[&::-webkit-scrollbar]:block">
          <PriceFilterPopover />
          <TypeFilterPopover />
          <MakeModelDropdown />
          <YearFilterPopover />
          <SeatsFilterPopover />
          <AllFiltersPopover />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;


