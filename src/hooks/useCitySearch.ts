"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import citiesData from "@/json/cities.json";

interface City {
  name: string;
  province: string;
  city?: boolean;
}

const provinceMap: { [key: string]: string } = {
  MM: "Metro Manila",
  ABR: "Abra",
  APA: "Apayao",
  BEN: "Benguet",
  IFU: "Ifugao",
  KAL: "Kalinga",
  MOU: "Mountain Province",
  ILN: "Ilocos Norte",
  ILS: "Ilocos Sur",
  LUN: "La Union",
  PAN: "Pangasinan",
  BTN: "Batanes",
  CAG: "Cagayan",
  ISA: "Isabela",
  NUV: "Nueva Vizcaya",
  QUI: "Quirino",
  AUR: "Aurora",
  BAN: "Bataan",
  BUL: "Bulacan",
  NUE: "Nueva Ecija",
  PAM: "Pampanga",
  TAR: "Tarlac",
  ZMB: "Zambales",
  BTG: "Batangas",
  CAV: "Cavite",
  LAG: "Laguna",
  QUE: "Quezon",
  RIZ: "Rizal",
  MAD: "Marinduque",
  MDR: "Mindoro Oriental",
  MDW: "Mindoro Occidental",
  PLW: "Palawan",
  ROM: "Romblon",
  ALB: "Albay",
  CAN: "Camarines Norte",
  CAS: "Camarines Sur",
  CAT: "Catanduanes",
  MAS: "Masbate",
  SOR: "Sorsogon",
  AKL: "Aklan",
  ANT: "Antique",
  CAP: "Capiz",
  GUI: "Guimaras",
  ILI: "Iloilo",
  NEC: "Negros Occidental",
  BOH: "Bohol",
  CEB: "Cebu",
  NEG: "Negros Oriental",
  SIG: "Siquijor",
  BIL: "Biliran",
  EAS: "Eastern Samar",
  LEY: "Leyte",
  NSA: "Northern Samar",
  SLE: "Southern Leyte",
  WSA: "Western Samar",
  ZAN: "Zamboanga del Norte",
  ZAS: "Zamboanga del Sur",
  ZSI: "Zamboanga Sibugay",
  BUK: "Bukidnon",
  CAM: "Camiguin",
  LAN: "Lanao del Norte",
  MSC: "Misamis Occidental",
  MSR: "Misamis Oriental",
  COM: "Compostela Valley",
  DAV: "Davao del Norte",
  DAS: "Davao del Sur",
  DAO: "Davao Oriental",
  DVO: "Davao Occidental",
  NCO: "North Cotabato",
  SAR: "Sarangani",
  SCO: "South Cotabato",
  SUN: "Surigao del Norte",
  SUR: "Surigao del Sur",
  AGN: "Agusan del Norte",
  AGS: "Agusan del Sur",
  DIN: "Dinagat Islands",
  BAS: "Basilan",
  LAS: "Lanao del Sur",
  MAG: "Maguindanao",
  SLU: "Sulu",
  TAW: "Tawi-Tawi",
};

export const useCitySearch = () => {
  const [fromLocation, setFromLocation] = useState("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get the cities data with full province names
  const cities = citiesData.map((city) => ({
    name: city.city ? `${city.name} City` : city.name,
    province: provinceMap[city.province] || city.province,
    city: city.city,
  }));

  // Search cities
  const searchCities = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      // Add a small delay to simulate network request and make loading state visible
      setTimeout(() => {
        const searchTerms = query
          .toLowerCase()
          .split(",")
          .map((term) => term.trim());

        const filteredCities = cities.filter((city) => {
          // If there's a comma in the search, treat it as a city, province search
          if (searchTerms.length > 1) {
            const cityMatch = city.name.toLowerCase().includes(searchTerms[0]);
            const provinceMatch = city.province
              .toLowerCase()
              .includes(searchTerms[1]);
            return cityMatch && provinceMatch;
          }

          // Otherwise search in both name and province
          return (
            city.name.toLowerCase().includes(query.toLowerCase()) ||
            city.province.toLowerCase().includes(query.toLowerCase())
          );
        });

        setSuggestions(filteredCities);
        setShowSuggestions(true);
        setIsLoading(false);
      }, 300);
    },
    [cities]
  );

  // Handle input change with debouncing
  const handleInputChange = useCallback(
    (value: string) => {
      setFromLocation(value);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        searchCities(value);
      }, 300);
    },
    [searchCities]
  );

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    fromLocation,
    setFromLocation,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isLoading,
    handleInputChange,
    suggestionsRef,
  };
};
