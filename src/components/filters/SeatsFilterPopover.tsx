"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { chipBase, seatOptions } from "./constants";
import { cn } from "@/lib/utils";
import { useSearchParamHelpers } from "@/hooks/filter/useSearchParamHelpers";

export const SeatsFilterPopover = () => {
  const { current, searchParams, pathname, router } = useSearchParamHelpers();
  const [open, setOpen] = useState(false);
  const [pendingSeats, setPendingSeats] = useState<string | null>((current("seats") || null) as string | null);

  useEffect(() => {
    setPendingSeats((current("seats") || null) as string | null);
  }, [current]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={chipBase}>
          <span className="text-sm">Seats</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Seats</span>
            <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setPendingSeats(null)}>Reset</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPendingSeats(null)} className={cn("rounded border px-2 py-1 text-sm", !pendingSeats ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>Any</button>
            {seatOptions.map((s) => {
              const val = s.replace('+','');
              const active = pendingSeats === val;
              return (
                <button key={s} type="button" onClick={() => setPendingSeats(val)} className={cn("rounded border px-2 py-1 text-sm", active ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>{s}</button>
              );
            })}
          </div>
          <div className="pt-1 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => { setPendingSeats((current("seats") || null) as string | null); setOpen(false); }}>Cancel</Button>
            <Button onClick={() => {
              const params = new URLSearchParams(searchParams?.toString() || "");
              if (pendingSeats) params.set("seats", pendingSeats); else params.delete("seats");
              params.set("_", String(Date.now()));
              router.push(`${pathname}?${params.toString()}`);
              setOpen(false);
            }}>View results</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SeatsFilterPopover;






