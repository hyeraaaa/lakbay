"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const useSearchParamHelpers = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = useCallback((key: string) => searchParams?.get(key) || undefined, [searchParams]);

  const setParam = useCallback((key: string, value?: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value === undefined || value === null || `${value}`.trim() === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    params.set("_", String(Date.now()));
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const setParams = useCallback((mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    mutate(params);
    params.set("_", String(Date.now()));
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const parseCsvToSet = useCallback((val: string | undefined) => {
    if (!val) return new Set<string>();
    return new Set(val.split(',').map(s => s.trim()).filter(Boolean));
  }, []);

  const stringifySetToCsv = useCallback((set: Set<string>) => Array.from(set).join(','), []);

  return { current, setParam, setParams, parseCsvToSet, stringifySetToCsv, searchParams, pathname, router };
};


