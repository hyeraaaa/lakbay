"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageModalProps {
  selectedImage: string | null
  onClose: () => void
  getImageSrc: (path?: string | null) => string | null
}

export default function ImageModal({
  selectedImage,
  onClose,
  getImageSrc,
}: ImageModalProps) {
  if (!selectedImage) {
    return null
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <div className="relative w-[80vw] max-w-4xl h-[70vh]">
          <Image
            src={getImageSrc(selectedImage) || "/placeholder.svg"}
            alt="Document"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>
    </div>
  )
}
