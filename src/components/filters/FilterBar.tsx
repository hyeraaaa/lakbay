"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface FilterBarProps {
  className?: string;
}

const chipBase = "h-9 px-3 rounded-full border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 flex items-center gap-2";

const FilterBar = ({ className }: FilterBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value?: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value === undefined || value === null || `${value}`.trim() === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    // bump nonce to force refetch even if params structurally same
    params.set("_", String(Date.now()));
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleParam = (key: string, toggleValue: string) => {
    const current = searchParams?.get(key);
    setParam(key, current === toggleValue ? null : toggleValue);
  };

  const current = (key: string) => searchParams?.get(key) || undefined;

  const typeOptions = [
    { key: "sedan", label: "Sedan" },
    { key: "suv", label: "SUVs" },
    { key: "truck", label: "Trucks" },
    { key: "van", label: "Vans" },
    { key: "luxury", label: "Luxury" },
    { key: "electric", label: "Electric" },
    { key: "hybrid", label: "Hybrid" },
  ];
  const yearOptions = Array.from({ length: 11 }, (_, i) => String(new Date().getFullYear() - i));
  const seatOptions = ["2", "4", "5", "7", "8+" ];
  const PRICE_MIN = 0;
  const PRICE_MAX = 10000;
  const PRICE_STEP = 100;

  const currentMinRate = Number(current("minRate") || PRICE_MIN);
  const currentMaxRate = Number(current("maxRate") || PRICE_MAX);
  const displayMin = isNaN(currentMinRate) ? PRICE_MIN : currentMinRate;
  const displayMax = isNaN(currentMaxRate) ? PRICE_MAX : currentMaxRate;

  const [priceMin, setPriceMin] = useState<number>(displayMin);
  const [priceMax, setPriceMax] = useState<number>(displayMax);
  const [pricePopoverOpen, setPricePopoverOpen] = useState<boolean>(false);
  const [typePopoverOpen, setTypePopoverOpen] = useState<boolean>(false);
  // Multi-select: maintain a set of selected type keys
  const parseTypesParam = useCallback((val: string | undefined) => {
    if (!val) return new Set<string>();
    return new Set(val.split(',').map(s => s.trim()).filter(Boolean));
  }, []);
  const stringifyTypesParam = (set: Set<string>) => Array.from(set).join(',');
  const [pendingTypes, setPendingTypes] = useState<Set<string>>(parseTypesParam(current("type")));
  // Multi-select Brand/Model support
  const parseCsvToSet = useCallback((val: string | undefined) => {
    if (!val) return new Set<string>();
    return new Set(val.split(',').map(s => s.trim()).filter(Boolean));
  }, []);
  const stringifySetToCsv = (set: Set<string>) => Array.from(set).join(',');
  const [makeModelOpen, setMakeModelOpen] = useState<boolean>(false);
  const [pendingBrands, setPendingBrands] = useState<Set<string>>(parseCsvToSet(current("brand")));
  const [pendingModelsText, setPendingModelsText] = useState<string>(current("model") ?? "");
  // Seats and Year pending values for All filters popover
  const [pendingSeats, setPendingSeats] = useState<string | null>(current("seats") ?? null);
  const [pendingYear, setPendingYear] = useState<string | null>(current("year") ?? null);
  const [allFiltersOpen, setAllFiltersOpen] = useState<boolean>(false);
  const [yearPopoverOpen, setYearPopoverOpen] = useState<boolean>(false);
  const [seatsPopoverOpen, setSeatsPopoverOpen] = useState<boolean>(false);

  const commitPrice = (minVal: number, maxVal: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (minVal <= PRICE_MIN) params.delete("minRate"); else params.set("minRate", String(minVal));
    if (maxVal >= PRICE_MAX) params.delete("maxRate"); else params.set("maxRate", String(maxVal));
    params.set("_", String(Date.now()));
    router.push(`${pathname}?${params.toString()}`);
  };

  // Sync local state when URL params change externally
  useEffect(() => {
    setPriceMin(displayMin);
    setPriceMax(displayMax);
  }, [displayMin, displayMax]);

  const typeParam = searchParams?.get("type") || undefined;
  const brandParam = searchParams?.get("brand") || undefined;
  const modelParam = searchParams?.get("model") || undefined;
  const seatsParam = (searchParams?.get("seats") || null) as string | null;
  const yearParam = (searchParams?.get("year") || null) as string | null;

  useEffect(() => {
    setPendingTypes(parseTypesParam(typeParam));
  }, [typeParam, parseTypesParam]);
  useEffect(() => {
    setPendingBrands(parseCsvToSet(brandParam));
    setPendingModelsText(modelParam ?? "");
    setPendingSeats(seatsParam);
    setPendingYear(yearParam);
  }, [brandParam, modelParam, seatsParam, yearParam, parseCsvToSet]);

  // simple inline icons to avoid external deps
  const CarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="10" width="18" height="5" rx="2" />
      <path d="M5 10l2-3h10l2 3" />
      <circle cx="7" cy="16" r="1.5" />
      <circle cx="17" cy="16" r="1.5" />
    </svg>
  );
  const VanIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="9" width="13" height="6" rx="2" />
      <path d="M16 11h3l2 2v2h-5z" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="18" cy="17" r="1.5" />
    </svg>
  );
  const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="10" width="10" height="5" rx="1" />
      <path d="M13 12h4l2 2v1h-6z" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="18" cy="17" r="1.5" />
    </svg>
  );
  const BoltIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
  const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 3c-4.5 0-8 3.5-8 8 0 5 4 8 8 8 6 0 9-5 10-9-4 1-9-4-10-7z" />
      <path d="M2 20c4-4 8-6 12-6" />
    </svg>
  );
  const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
    </svg>
  );
  const iconForType = (key: string) => {
    // Use the car silhouette for most types
    if (key === "electric") return <CarIcon />;
    if (key === "hybrid") return <CarIcon />;
    if (key === "luxury") return <CarIcon />;
    if (key.includes("truck")) return <TruckIcon />;
    if (key.includes("van")) return <VanIcon />;
    // sedan and suv default to car icon
    return <CarIcon />;
  };

  return (
    <div
      id="filter-bar"
      className={cn(
        "w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-200",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-2">
        <div className="flex items-center justify-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:[-ms-overflow-style:auto] lg:[scrollbar-width:auto] lg:[&::-webkit-scrollbar]:block">
          <Popover open={pricePopoverOpen} onOpenChange={setPricePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className={chipBase}>
                <span className="text-sm">Daily price</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Daily price</span>
                  <Button
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setPriceMin(PRICE_MIN);
                      setPriceMax(PRICE_MAX);
                    }}
                  >
                    Clear
                  </Button>
                </div>

                <div className="px-1">
                  <div className="relative h-6 mt-2">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded bg-gray-200" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-1 rounded bg-gray-700"
                      style={{
                        left: `${((priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                        right: `${100 - ((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step={PRICE_STEP}
                      value={priceMin}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), priceMax);
                        setPriceMin(val);
                      }}
                      className="absolute pointer-events-auto appearance-none w-full bg-transparent top-0 h-6"
                    />
                    <input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step={PRICE_STEP}
                      value={priceMax}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), priceMin);
                        setPriceMax(val);
                      }}
                      className="absolute pointer-events-auto appearance-none w-full bg-transparent top-0 h-6"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={PRICE_MIN}
                      max={priceMax}
                      step={PRICE_STEP}
                      value={priceMin}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        const clamped = Math.max(PRICE_MIN, Math.min(raw, priceMax));
                        setPriceMin(clamped);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={priceMin}
                      max={PRICE_MAX}
                      step={PRICE_STEP}
                      value={priceMax}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        const clamped = Math.min(PRICE_MAX, Math.max(raw, priceMin));
                        setPriceMax(clamped);
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-600">Range: ₱{priceMin.toLocaleString()} – ₱{priceMax.toLocaleString()}</div>
                <div className="pt-1">
                  <Button
                    className="w-full h-9"
                    onClick={() => {
                      commitPrice(priceMin, priceMax);
                      setPricePopoverOpen(false);
                    }}
                  >
                    View results
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className={chipBase}>
                <span className="text-sm">Vehicle type</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[420px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vehicle type</span>
                  <Button
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => setPendingTypes(new Set())}
                  >
                    Reset
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPendingTypes(parseTypesParam(current("type")));
                      setTypePopoverOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams?.toString() || "");
                      const csv = stringifyTypesParam(pendingTypes);
                      if (!csv) params.delete("type"); else params.set("type", csv);
                      params.set("_", String(Date.now()));
                      router.push(`${pathname}?${params.toString()}`);
                      setTypePopoverOpen(false);
                    }}
                  >
                    View results
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu open={makeModelOpen} onOpenChange={setMakeModelOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={chipBase}>
                <span className="text-sm">Make & model</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 p-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <DropdownMenuLabel>Brand</DropdownMenuLabel>
                  <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setPendingBrands(new Set())}>Clear</Button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {["Toyota","Honda","Mitsubishi","Nissan","Ford","Hyundai","Kia"].map((b) => {
                    const active = pendingBrands.has(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setPendingBrands(prev => { const next = new Set(prev); if (next.has(b)) next.delete(b); else next.add(b); return next; })}
                        className={cn("flex items-center gap-2 rounded border px-2 py-1 text-sm", active ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}
                      >
                        {active ? <Check className="w-4 h-4" /> : <span className="w-4 h-4" />}
                        <span>{b}</span>
                      </button>
                    );
                  })}
                </div>

                <DropdownMenuSeparator />

                <div className="flex items-center justify-between">
                  <DropdownMenuLabel>Models</DropdownMenuLabel>
                  <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setPendingModelsText("")}>Clear</Button>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-gray-500">Comma-separated (e.g., Vios, Civic)</label>
                  <Input value={pendingModelsText} onChange={(e) => setPendingModelsText(e.target.value)} placeholder="e.g., Vios, Civic" />
                </div>

                <div className="pt-1 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setPendingBrands(parseCsvToSet(current("brand")));
                    setPendingModelsText(current("model") ?? "");
                    setMakeModelOpen(false);
                  }}>Cancel</Button>
                  <Button onClick={() => {
                    const params = new URLSearchParams(searchParams?.toString() || "");
                    const brandCsv = Array.from(pendingBrands).join(',');
                    const modelCsv = (pendingModelsText || "").split(',').map(s => s.trim()).filter(Boolean).join(',');
                    if (brandCsv) params.set("brand", brandCsv); else params.delete("brand");
                    if (modelCsv) params.set("model", modelCsv); else params.delete("model");
                    params.set("_", String(Date.now()));
                    router.push(`${pathname}?${params.toString()}`);
                    setMakeModelOpen(false);
                  }}>View results</Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover open={yearPopoverOpen} onOpenChange={setYearPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className={chipBase}>
                <span className="text-sm">Years</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Year</span>
                  <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setPendingYear(null)}>Reset</Button>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-auto">
                  <button type="button" onClick={() => setPendingYear(null)} className={cn("rounded border px-2 py-1 text-sm", !pendingYear ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>Any</button>
                  {yearOptions.map((y) => (
                    <button key={y} type="button" onClick={() => setPendingYear(y)} className={cn("rounded border px-2 py-1 text-sm", pendingYear === y ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50")}>{y}</button>
                  ))}
                </div>
                <div className="pt-1 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => { setPendingYear(current("year") ?? null); setYearPopoverOpen(false); }}>Cancel</Button>
                  <Button onClick={() => {
                    const params = new URLSearchParams(searchParams?.toString() || "");
                    if (pendingYear) params.set("year", pendingYear); else params.delete("year");
                    params.set("_", String(Date.now()));
                    router.push(`${pathname}?${params.toString()}`);
                    setYearPopoverOpen(false);
                  }}>View results</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={seatsPopoverOpen} onOpenChange={setSeatsPopoverOpen}>
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
                  <Button variant="outline" onClick={() => { setPendingSeats(current("seats") ?? null); setSeatsPopoverOpen(false); }}>Cancel</Button>
                  <Button onClick={() => {
                    const params = new URLSearchParams(searchParams?.toString() || "");
                    if (pendingSeats) params.set("seats", pendingSeats); else params.delete("seats");
                    params.set("_", String(Date.now()));
                    router.push(`${pathname}?${params.toString()}`);
                    setSeatsPopoverOpen(false);
                  }}>View results</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          
          <Popover open={allFiltersOpen} onOpenChange={setAllFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className={chipBase}>
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm">All filters</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[720px]">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">All filters</span>
                  <Button
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      // Only reset local selections; commit happens on Apply filters
                      setPendingTypes(new Set());
                      setPendingBrands(new Set());
                      setPendingModelsText("");
                      setPendingSeats(null);
                      setPendingYear(null);
                      setPriceMin(PRICE_MIN);
                      setPriceMax(PRICE_MAX);
                    }}
                  >
                    Clear all
                  </Button>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Daily price</div>
                  <div className="px-1">
                    <div className="relative h-6 mt-1">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded bg-gray-200" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-1 rounded bg-gray-700"
                        style={{
                          left: `${((priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                          right: `${100 - ((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                        }}
                      />
                      <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={priceMin}
                        onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                        className="absolute pointer-events-auto appearance-none w-full bg-transparent top-0 h-6" />
                      <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={priceMax}
                        onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                        className="absolute pointer-events-auto appearance-none w-full bg-transparent top-0 h-6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Min</label>
                      <Input type="number" inputMode="numeric" min={PRICE_MIN} max={priceMax} step={PRICE_STEP}
                        value={priceMin} onChange={(e) => {
                          const raw = Number(e.target.value);
                          setPriceMin(Math.max(PRICE_MIN, Math.min(raw, priceMax)));
                        }} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Max</label>
                      <Input type="number" inputMode="numeric" min={priceMin} max={PRICE_MAX} step={PRICE_STEP}
                        value={priceMax} onChange={(e) => {
                          const raw = Number(e.target.value);
                          setPriceMax(Math.min(PRICE_MAX, Math.max(raw, priceMin)));
                        }} />
                    </div>
                  </div>
                </div>

                {/* Vehicle type */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Vehicle type</div>
                  <div className="grid grid-cols-4 gap-2">
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

                {/* Brand and models */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Make & model</div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Toyota","Honda","Mitsubishi","Nissan","Ford","Hyundai","Kia"].map(b => {
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

                {/* Year and Seats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Year</div>
                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-auto">
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
                    // reset to current URL params
                    setPendingTypes(parseTypesParam(current("type")));
                    setPendingBrands(parseCsvToSet(current("brand")));
                    setPendingModelsText(current("model") ?? "");
                    setPendingSeats(current("seats") ?? null);
                    setPendingYear(current("year") ?? null);
                    setPriceMin(displayMin);
                    setPriceMax(displayMax);
                    setAllFiltersOpen(false);
                  }}>Cancel</Button>
                  <Button onClick={() => {
                    const params = new URLSearchParams(searchParams?.toString() || "");
                    // price
                    if (priceMin <= PRICE_MIN) params.delete("minRate"); else params.set("minRate", String(priceMin));
                    if (priceMax >= PRICE_MAX) params.delete("maxRate"); else params.set("maxRate", String(priceMax));
                    // type
                    const typeCsv = Array.from(pendingTypes).join(',');
                    if (typeCsv) params.set("type", typeCsv); else params.delete("type");
                    // brand/model
                    const brandCsv = Array.from(pendingBrands).join(',');
                    const modelCsv = (pendingModelsText || "").split(',').map(s => s.trim()).filter(Boolean).join(',');
                    if (brandCsv) params.set("brand", brandCsv); else params.delete("brand");
                    if (modelCsv) params.set("model", modelCsv); else params.delete("model");
                    // year/seats
                    if (pendingYear) params.set("year", pendingYear); else params.delete("year");
                    if (pendingSeats) params.set("seats", pendingSeats); else params.delete("seats");
                    // bump
                    params.set("_", String(Date.now()));
                    router.push(`${pathname}?${params.toString()}`);
                    setAllFiltersOpen(false);
                  }}>Apply filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;


