"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { chipBase, typeOptions, iconForType } from "./constants";
import { cn } from "@/lib/utils";
import { useSearchParamHelpers } from "@/hooks/filter/useSearchParamHelpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const TypeFilterPopover = () => {
  const { current, parseCsvToSet, stringifySetToCsv, searchParams, pathname, router } = useSearchParamHelpers();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [pendingTypes, setPendingTypes] = useState<Set<string>>(parseCsvToSet(current("type")));

  useEffect(() => {
    setPendingTypes(parseCsvToSet(current("type")));
  }, [current, parseCsvToSet]);

  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Vehicle type</span>
        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setPendingTypes(new Set())}>Reset</Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {typeOptions.map((opt) => {
          const active = pendingTypes.has(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setPendingTypes(prev => {
                  const next = new Set(prev);
                  if (next.has(opt.key)) next.delete(opt.key); else next.add(opt.key);
                  return next;
                });
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-md border p-3 transition-colors",
                active ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className="text-gray-700">{iconForType(opt.key)}</div>
              <div className="text-xs text-gray-800">{opt.label}</div>
            </button>
          );
        })}
      </div>
      <div className="pt-1 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => { setPendingTypes(parseCsvToSet(current("type"))); setOpen(false); }}>Cancel</Button>
        <Button onClick={() => {
          const params = new URLSearchParams(searchParams?.toString() || "");
          const csv = stringifySetToCsv(pendingTypes);
          if (!csv) params.delete("type"); else params.set("type", csv);
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
            <span className="text-sm">Vehicle type</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-4 h-[85vh] overflow-auto">
          <SheetHeader>
            <SheetTitle>Vehicle type</SheetTitle>
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
          <span className="text-sm">Vehicle type</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[calc(100vw-2rem)] sm:w-[420px]">
        {content}
      </PopoverContent>
    </Popover>
  );
};

export default TypeFilterPopover;


