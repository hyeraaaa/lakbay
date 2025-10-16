"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { chipBase, PRICE_MAX, PRICE_MIN, PRICE_STEP } from "./constants";
import { useSearchParamHelpers } from "@/hooks/filter/useSearchParamHelpers";

export const PriceFilterPopover = () => {
  const { current, setParams, searchParams, pathname, router } = useSearchParamHelpers();

  const currentMinRate = Number(current("minRate") || PRICE_MIN);
  const currentMaxRate = Number(current("maxRate") || PRICE_MAX);
  const displayMin = isNaN(currentMinRate) ? PRICE_MIN : currentMinRate;
  const displayMax = isNaN(currentMaxRate) ? PRICE_MAX : currentMaxRate;

  const [priceMin, setPriceMin] = useState<number>(displayMin);
  const [priceMax, setPriceMax] = useState<number>(displayMax);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setPriceMin(displayMin);
    setPriceMax(displayMax);
  }, [displayMin, displayMax]);

  const commitPrice = (minVal: number, maxVal: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (minVal <= PRICE_MIN) params.delete("minRate"); else params.set("minRate", String(minVal));
    if (maxVal >= PRICE_MAX) params.delete("maxRate"); else params.set("maxRate", String(maxVal));
    params.set("_", String(Date.now()));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
                setOpen(false);
              }}
            >
              View results
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PriceFilterPopover;






