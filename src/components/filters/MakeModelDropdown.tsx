"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { chipBase } from "./constants";
import { cn } from "@/lib/utils";
import { useSearchParamHelpers } from "@/hooks/filter/useSearchParamHelpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const BRANDS = ["Toyota","Honda","Mitsubishi","Nissan","Ford","Hyundai","Kia"];

export const MakeModelDropdown = () => {
  const { current, parseCsvToSet, searchParams, pathname, router } = useSearchParamHelpers();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [pendingBrands, setPendingBrands] = useState<Set<string>>(parseCsvToSet(current("brand")));
  const [pendingModelsText, setPendingModelsText] = useState<string>(current("model") ?? "");

  useEffect(() => {
    setPendingBrands(parseCsvToSet(current("brand")));
    setPendingModelsText(current("model") ?? "");
  }, [current, parseCsvToSet]);

  const content = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Brand</span>
        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setPendingBrands(new Set())}>Clear</Button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {BRANDS.map((b) => {
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

      <div className="flex items-center justify-between pt-1">
        <span className="text-sm font-medium">Models</span>
        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setPendingModelsText("")}>Clear</Button>
      </div>
      <div className="space-y-1">
        <label className="block text-xs text-gray-500">Comma-separated (e.g., Vios, Civic)</label>
        <Input value={pendingModelsText} onChange={(e) => setPendingModelsText(e.target.value)} placeholder="e.g., Vios, Civic" />
      </div>

      <div className="pt-2 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setPendingBrands(parseCsvToSet(current("brand")));
          setPendingModelsText(current("model") ?? "");
          setOpen(false);
        }}>Cancel</Button>
        <Button onClick={() => {
          const params = new URLSearchParams(searchParams?.toString() || "");
          const brandCsv = Array.from(pendingBrands).join(',');
          const modelCsv = (pendingModelsText || "").split(',').map(s => s.trim()).filter(Boolean).join(',');
          if (brandCsv) params.set("brand", brandCsv); else params.delete("brand");
          if (modelCsv) params.set("model", modelCsv); else params.delete("model");
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
            <span className="text-sm">Make & model</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-4 h-[75vh] overflow-auto">
          <SheetHeader>
            <SheetTitle>Make & model</SheetTitle>
          </SheetHeader>
          <div className="mt-3">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={chipBase}>
          <span className="text-sm">Make & model</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] sm:w-80 p-2">
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MakeModelDropdown;


