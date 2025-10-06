export function normalizeTransmissionLabel(raw?: string | null): string {
  const value = (raw || "").toString().trim().toLowerCase()
  if (!value) return "Automatic"

  // Direct enum-like values or combined tokens
  if (
    value === "manual_transmission_mt" ||
    value.includes("manual") ||
    value.includes(" mt")
  ) return "Manual"

  if (
    value === "automatic_transmission_at" ||
    value.includes("automatic") ||
    value.includes(" at")
  ) return "Automatic"

  if (
    value === "continuously_variable_transmission_cvt" ||
    value.includes("cvt") ||
    value.includes("continuously variable")
  ) return "CVT"

  if (
    value === "automated_manual_transmission_amt" ||
    value.includes("amt") ||
    value.includes("automated manual")
  ) return "AMT"

  if (
    value === "dual_clutch_transmission_dct_dsg" ||
    value.includes("dct") ||
    value.includes("dsg") ||
    value.includes("dual-clutch")
  ) return "DCT/DSG"

  if (value === "tiptronic_manumatic" || value.includes("tiptronic") || value.includes("manumatic")) return "Tiptronic"

  if (
    value === "single_speed_transmission_evs" ||
    value.includes("single") ||
    value.includes("single-speed") ||
    value.includes("evs") ||
    value.includes("ev ")
  ) return "Single-speed"

  // Fallback to original raw value if it is already presentable; otherwise capitalize first letter
  return raw || "Automatic"
}


