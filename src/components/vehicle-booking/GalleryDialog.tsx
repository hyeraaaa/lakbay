"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

type GalleryDialogProps = {
  carImages: string[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function GalleryDialog({ carImages, isOpen, onOpenChange }: GalleryDialogProps) {
  const isExactlyThree = carImages.length === 3
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All photos</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {carImages.map((url, index) => {
            const isFull = isExactlyThree
              ? true
              : index % 3 === 0 || (carImages.length % 2 === 1 && index === carImages.length - 1)
            const containerClasses = isFull
              ? "col-span-2"
              : "col-span-1"
            const heightClasses = isFull
              ? "h-52 sm:h-64 md:h-80"
              : "h-40 sm:h-48 md:h-56"
            return (
              <div key={url + index} className={`${containerClasses}`}>
                <div className={`relative w-full ${heightClasses}`}>
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover rounded cursor-pointer"
                    onClick={() => onOpenChange(false)}
                    unoptimized
                  />
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}


