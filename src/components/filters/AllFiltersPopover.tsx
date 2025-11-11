"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { PRICE_MAX, PRICE_MIN, PRICE_STEP, chipBase, seatOptions, typeOptions, yearOptions, iconForType } from "./constants";
import { cn } from "@/lib/utils";
import { useSearchParamHelpers } from "@/hooks/filter/useSearchParamHelpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const BRANDS = ["Toyota","Honda","Mitsubishi","Nissan","Ford","Hyundai","Kia"];

export const AllFiltersPopover = () => {
  const { current, parseCsvToSet, searchParams, pathname, router } = useSearchParamHelpers();
  const isMobile = useIsMobile();

  const currentMinRate = Number(current("minRate") || PRICE_MIN);
  const currentMaxRate = Number(current("maxRate") || PRICE_MAX);
  const displayMin = isNaN(currentMinRate) ? PRICE_MIN : currentMinRate;
  const displayMax = isNaN(currentMaxRate) ? PRICE_MAX : currentMaxRate;

  const [open, setOpen] = useState(false);
  const [priceMin, setPriceMin] = useState<number>(displayMin);
  const [priceMax, setPriceMax] = useState<number>(displayMax);
  const [pendingTypes, setPendingTypes] = useState<Set<string>>(parseCsvToSet(current("type")));
  const [pendingBrands, setPendingBrands] = useState<Set<string>>(parseCsvToSet(current("brand")));
  const [pendingModelsText, setPendingModelsText] = useState<string>(current("model") ?? "");
  const [pendingSeats, setPendingSeats] = useState<string | null>((current("seats") || null) as string | null);
  const [pendingYear, setPendingYear] = useState<string | null>((current("year") || null) as string | null);

  useEffect(() => {
    setPriceMin(displayMin);
    setPriceMax(displayMax);
    setPendingTypes(parseCsvToSet(current("type")));
    setPendingBrands(parseCsvToSet(current("brand")));
    setPendingModelsText(current("model") ?? "");
    setPendingSeats((current("seats") || null) as string | null);
    setPendingYear((current("year") || null) as string | null);
  }, [current, parseCsvToSet, displayMin, displayMax]);

  const content = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">All filters</span>
        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => {
          setPendingTypes(new Set());
          setPendingBrands(new Set());
          setPendingModelsText("");
          setPendingSeats(null);
          setPendingYear(null);
          setPriceMin(PRICE_MIN);
          setPriceMax(PRICE_MAX);
        }}>Clear all</Button>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Daily price</div>
        <div className="px-1">
          <div className="relative h-6 mt-1">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded bg-gray-200" />
            <div className="absolute top-1/2 -translate-y-1/2 h-1 rounded bg-gray-700" style={{ left: `${((priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`, right: `${100 - ((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%` }} />
            <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={priceMin} onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))} className="absolute pointer-events-auto appearance-none w-full bg-transparent top-0 h-6" />
            <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={priceMax} onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))} className="absolute pointer-events-auto appearance-none w-full bg-transparent top-0 h-6" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Min</label>
            <Input type="number" inputMode="numeric" min={PRICE_MIN} max={priceMax} step={PRICE_STEP} value={priceMin} onChange={(e) => { const raw = Number(e.target.value); setPriceMin(Math.max(PRICE_MIN, Math.min(raw, priceMax))); }} />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Max</label>
            <Input type="number" inputMode="numeric" min={priceMin} max={PRICE_MAX} step={PRICE_STEP} value={priceMax} onChange={(e) => { const raw = Number(e.target.value); setPriceMax(Math.min(PRICE_MAX, Math.max(raw, priceMin))); }} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Vehicle type</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {typeOptions.map(opt => {
            const active = pendingTypes.has(opt.key);
            return (
              <button key={opt.key} type="button" onClick={() => setPendingTypes(prev => { const next = new Set(prev); if (next.has(opt.key)) next.delete(opt.key); else next.add(opt.key); return next; })}
                className={cn("flex items-center gap-2 rounded border px-2 py-2 text-sm", active ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}
              >
                <span className="text-gray-700">{iconForType(opt.key)}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Make & model</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BRANDS.map(b => {
            const active = pendingBrands.has(b);
            return (
              <button key={b} type="button" onClick={() => setPendingBrands(prev => { const next = new Set(prev); if (next.has(b)) next.delete(b); else next.add(b); return next; })}
                className={cn("flex items-center gap-2 rounded border px-2 py-1 text-sm", active ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}
              >
                {active ? <Check className="w-4 h-4" /> : <span className="w-4 h-4" />}
                <span>{b}</span>
              </button>
            );
          })}
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-gray-500">Models (comma-separated)</label>
          <Input value={pendingModelsText} onChange={(e) => setPendingModelsText(e.target.value)} placeholder="e.g., Vios, Civic" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Year</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-32 overflow-auto">
            <button type="button" onClick={() => setPendingYear(null)} className={cn("rounded border px-2 py-1 text-sm", !pendingYear ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>Any</button>
            {yearOptions.map(y => (
              <button key={y} type="button" onClick={() => setPendingYear(y)} className={cn("rounded border px-2 py-1 text-sm", pendingYear === y ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>{y}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Seats</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPendingSeats(null)} className={cn("rounded border px-2 py-1 text-sm", !pendingSeats ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>Any</button>
            {seatOptions.map(s => {
              const val = s.replace('+','');
              const active = pendingSeats === val;
              return (
                <button key={s} type="button" onClick={() => setPendingSeats(val)} className={cn("rounded border px-2 py-1 text-sm", active ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>{s}</button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setPendingTypes(parseCsvToSet(current("type")));
          setPendingBrands(parseCsvToSet(current("brand")));
          setPendingModelsText(current("model") ?? "");
          setPendingSeats((current("seats") || null) as string | null);
          setPendingYear((current("year") || null) as string | null);
          setPriceMin(displayMin);
          setPriceMax(displayMax);
          setOpen(false);
        }}>Cancel</Button>
        <Button onClick={() => {
          const params = new URLSearchParams(searchParams?.toString() || "");
          if (priceMin <= PRICE_MIN) params.delete("minRate"); else params.set("minRate", String(priceMin));
          if (priceMax >= PRICE_MAX) params.delete("maxRate"); else params.set("maxRate", String(priceMax));
          const typeCsv = Array.from(pendingTypes).join(',');
          if (typeCsv) params.set("type", typeCsv); else params.delete("type");
          const brandCsv = Array.from(pendingBrands).join(',');
          const modelCsv = (pendingModelsText || "").split(',').map(s => s.trim()).filter(Boolean).join(',');
          if (brandCsv) params.set("brand", brandCsv); else params.delete("brand");
          if (modelCsv) params.set("model", modelCsv); else params.delete("model");
          if (pendingYear) params.set("year", pendingYear); else params.delete("year");
          if (pendingSeats) params.set("seats", pendingSeats); else params.delete("seats");
          params.set("_", String(Date.now()));
          router.push(`${pathname}?${params.toString()}`);
          setOpen(false);
        }}>Apply filters</Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className={chipBase}>
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">All filters</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-4 h-[90vh] overflow-auto">
          <SheetHeader>
            <SheetTitle>All filters</SheetTitle>
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
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm">All filters</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-[720px]">
        {content}
      </PopoverContent>
    </Popover>
  );
};

export default AllFiltersPopover;






