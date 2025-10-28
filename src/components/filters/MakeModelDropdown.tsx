"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, Check } from "lucide-react"
import { useSearchParamHelpers } from "@/hooks/filter/useSearchParamHelpers"
import { chipBase } from "./constants"
import { cn } from "@/lib/utils"

const BRANDS = ["Toyota", "Honda", "Mitsubishi", "Nissan", "Ford", "Hyundai", "Kia"]

export const MakeModelDropdown = () => {
  const { current, parseCsvToSet, searchParams, pathname, router } = useSearchParamHelpers()

  const [open, setOpen] = useState(false)
  const [pendingBrands, setPendingBrands] = useState<Set<string>>(parseCsvToSet(current("brand")))
  const [pendingModelsText, setPendingModelsText] = useState<string>(current("model") ?? "")
  const [initialBrands, setInitialBrands] = useState<Set<string>>(parseCsvToSet(current("brand")))
  const [initialModels, setInitialModels] = useState<string>(current("model") ?? "")

  useEffect(() => {
    const brands = parseCsvToSet(current("brand"))
    const models = current("model") ?? ""
    setPendingBrands(brands)
    setPendingModelsText(models)
    setInitialBrands(brands)
    setInitialModels(models)
  }, [searchParams?.toString()])

  const handleApply = () => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    const brandCsv = Array.from(pendingBrands).join(",")
    const modelCsv = (pendingModelsText || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(",")
    if (brandCsv) params.set("brand", brandCsv)
    else params.delete("brand")
    if (modelCsv) params.set("model", modelCsv)
    else params.delete("model")
    params.set("_", String(Date.now()))
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  const handleCancel = () => {
    setPendingBrands(initialBrands)
    setPendingModelsText(initialModels)
    setOpen(false)
  }

  const handleReset = () => {
    setPendingBrands(new Set())
    setPendingModelsText("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={chipBase}>
          <span className="text-sm">Make & model</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Make & model</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>

          {/* Brand Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Brand</label>
            <div className="grid grid-cols-2 gap-2">
              {BRANDS.map((b) => {
                const active = pendingBrands.has(b)
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() =>
                      setPendingBrands((prev) => {
                        const next = new Set(prev)
                        if (next.has(b)) next.delete(b)
                        else next.add(b)
                        return next
                      })
                    }
                    className={cn(
                      "flex items-center gap-2 rounded border px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                    )}
                  >
                    {active ? <Check className="w-4 h-4" /> : <span className="w-4 h-4" />}
                    <span>{b}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Model Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Models</label>
            <p className="text-xs text-gray-500">Comma-separated (e.g., Vios, Civic)</p>
            <Input
              value={pendingModelsText}
              onChange={(e) => setPendingModelsText(e.target.value)}
              placeholder="e.g., Vios, Civic"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
            <Button variant="outline" size="sm" className="h-8 bg-transparent" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" className="h-8" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MakeModelDropdown
