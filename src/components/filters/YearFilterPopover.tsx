"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { chipBase, yearOptions } from "./constants";
import { cn } from "@/lib/utils";
import { useSearchParamHelpers } from "@/hooks/filter/useSearchParamHelpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const YearFilterPopover = () => {
  const { current, searchParams, pathname, router } = useSearchParamHelpers();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [pendingYear, setPendingYear] = useState<string | null>((current("year") || null) as string | null);

  useEffect(() => {
    setPendingYear((current("year") || null) as string | null);
  }, [current]);

  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Year</span>
        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setPendingYear(null)}>Reset</Button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-auto">
        <button type="button" onClick={() => setPendingYear(null)} className={cn("rounded border px-2 py-1 text-sm", !pendingYear ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>Any</button>
        {yearOptions.map((y) => (
          <button key={y} type="button" onClick={() => setPendingYear(y)} className={cn("rounded border px-2 py-1 text-sm", pendingYear === y ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>{y}</button>
        ))}
      </div>
      <div className="pt-1 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => { setPendingYear((current("year") || null) as string | null); setOpen(false); }}>Cancel</Button>
        <Button onClick={() => {
          const params = new URLSearchParams(searchParams?.toString() || "");
          if (pendingYear) params.set("year", pendingYear); else params.delete("year");
          params.set("_", String(Date.now()));
          router.push(`${pathname}?${params.toString()}`);
          setOpen(false);
        }}>View results</Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className={chipBase}>
            <span className="text-sm">Years</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-4 h-[75vh] overflow-auto">
          <SheetHeader>
            <SheetTitle>Year</SheetTitle>
          </SheetHeader>
          <div className="mt-3">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={chipBase}>
          <span className="text-sm">Years</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[calc(100vw-2rem)] sm:w-80">
        {content}
      </PopoverContent>
    </Popover>
  );
};

export default YearFilterPopover;






