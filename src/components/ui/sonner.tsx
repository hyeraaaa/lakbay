"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      expand={true}
      richColors={true}
      duration={4000}
      icons={{
        success: <CheckCircle className="h-4 w-4 text-green-600" />,
        error: <AlertCircle className="h-4 w-4 text-red-600" />,
        info: <Info className="h-4 w-4 text-blue-600" />,
      }}
      toastOptions={{
        // Use solid fallbacks to avoid transparency when CSS vars aren't available in the portal
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid rgba(0,0,0,0.08)',
        },
        className: 'group toast bg-background text-foreground border border-border shadow-lg !z-[9999]',
      }}
      {...props}
    />
  )
}

export { Toaster }
