"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Car, Search, RefreshCw } from "lucide-react"

export default function NoVehiclesAvailable() {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Error Code */}
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">0</h1>
          <div className="w-16 h-1 bg-gray-700 dark:bg-gray-300 mx-auto rounded-full"></div>
        </div>

        {/* Gorilla Image */}
        <div className="mb-4 relative">
          <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/gorilla-404.jpeg"
              alt="Disappointed gorilla looking for vehicles"
              fill
              className="object-cover grayscale"
              priority
            />
          </div>
          <div className="absolute -top-2 -right-2 bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-semibold transform rotate-12">
            No Cars!
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-4 space-y-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-balance">No vehicles found...</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 text-pretty max-w-sm mx-auto">
            Looks like our gorilla friend here couldn&apos;t find any vehicles matching your search. 
            Maybe try adjusting your filters or check back later!
          </p>
        </div>

        {/* Fun Fact */}
        <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Fun fact:</span> Gorillas are great at finding food, but apparently not so great at finding cars. 
            Don&apos;t worry though, we&apos;re working on it!
          </p>
        </div>
      </div>
    </div>
  )
}
