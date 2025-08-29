"use client"

import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const ProfileSkeleton = () => (
  <Card className="mb-6 py-5">
    <CardContent className="pt-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="h-32 w-32 rounded-full bg-gray-200 animate-pulse ring-4 ring-white shadow-lg"></div>

        <div className="flex-1 text-center md:text-left">
          <div className="mb-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 max-w-xs mx-auto md:mx-0"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 max-w-32 mx-auto md:mx-0"></div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
)

export const FormSkeleton = () => (
  <Card className="py-5 mb-5">
    <CardHeader className="mt-5">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={i < 2 ? "md:col-span-2" : ""}>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)
