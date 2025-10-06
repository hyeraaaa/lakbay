"use client"

import { Heart, Share } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type ImageGalleryProps = {
  carImages: string[]
  isGalleryOpen: boolean
  setIsGalleryOpen: (open: boolean) => void
}

export default function ImageGallery({ carImages, isGalleryOpen, setIsGalleryOpen }: ImageGalleryProps) {
  return (
    <div className="flex gap-4">
      {/* Main Image - Left Side */}
      <div className="w-full md:w-2/3">
        <div className="relative aspect-[16/9] md:aspect-auto md:h-[32rem]">
          <Image
            src={carImages[0] || "/placeholder.svg"}
            alt="Vehicle"
            fill
            className="object-contain md:object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
            priority
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
              <Heart className="h-4 w-4" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
              <Share className="h-4 w-4" />
            </button>
          </div>
          {/* View all photos button (mobile only) */}
          <Button
            type="button"
            variant="secondary"
            className="md:hidden absolute bottom-3 right-3 bg-white hover:bg-white active:bg-white hover:opacity-100 active:opacity-100 rounded-lg px-3 py-2 shadow-md flex items-center gap-2"
            onClick={() => setIsGalleryOpen(true)}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-sm font-medium text-gray-900">View {carImages.length} photos</span>
          </Button>
        </div>
      </div>

      <div className="hidden md:flex w-1/3 flex-col gap-4">
        {/* Second Photo */}
        <div className="h-[248px] relative">
          <Image
            src={carImages[1] || "/placeholder.svg"}
            alt="Car view 2"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 1200px) 33vw, 33vw"
          />
        </div>

        {/* Third Photo with Overlay Button */}
        <div className="h-[248px] relative rounded-lg overflow-hidden">
          <Image
            src={carImages[2] || carImages[1] || carImages[0] || "/placeholder.svg"}
            alt="Car view 3"
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 33vw, 33vw"
          />
          <Button
            type="button"
            variant="secondary"
            aria-label="View all photos"
            className="absolute bottom-3 right-3 bg-white hover:bg-white active:bg-white hover:opacity-100 active:opacity-100 rounded-lg px-3 py-2 shadow-md flex items-center gap-2"
            onClick={() => setIsGalleryOpen(true)}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-sm font-medium text-gray-900">View {carImages.length} photos</span>
          </Button>
        </div>
      </div>
    </div>
  )
}


