"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { XCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { bookingService, PaymentStatus as ServerPaymentStatus } from "@/services/bookingServices"

type ViewState = "processing" | "failed"

export default function PaymentCancelledPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const bookingId = Number(params.id)

  const [state, setState] = useState<ViewState>("processing")
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [remainingHeight, setRemainingHeight] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const booking = await bookingService.getBookingDetails(bookingId)
        const pd = booking?.payment_details?.[0]
        if (!pd) {
          setState("failed")
          setErrorMessage("Payment details not found for this booking.")
          return
        }

        switch (pd.payment_status) {
          case ServerPaymentStatus.PENDING:
            setState("processing")
            break
          case ServerPaymentStatus.DENIED:
          case ServerPaymentStatus.EXPIRED:
            setState("failed")
            break
          case ServerPaymentStatus.COMPLETED:
          case ServerPaymentStatus.REFUNDED:
          case ServerPaymentStatus.PARTIALLY_REFUNDED:
            // If payment ended up completed, redirect to success page
            router.replace(`/user/bookings/${bookingId}/payment-success`)
            break
          default:
            setState("processing")
        }
      } catch (err: unknown) {
        setState("failed")
        setErrorMessage(err instanceof Error ? err.message : "Failed to load payment status")
      }
    }

    load()
    const interval = setInterval(load, 8000)
    return () => {
      clearInterval(interval)
    }
  }, [bookingId, router])

  // Compute remaining height after navbar/header for vertical centering
  useEffect(() => {
    const computeHeight = () => {
      if (typeof window === 'undefined') return
      const viewport = window.innerHeight
      const headerEl = (document.querySelector('header') || document.querySelector('nav')) as HTMLElement | null
      const headerHeight = headerEl ? headerEl.offsetHeight : 0
      setRemainingHeight(Math.max(0, viewport - headerHeight))
    }
    computeHeight()
    window.addEventListener('resize', computeHeight)
    return () => window.removeEventListener('resize', computeHeight)
  }, [])

  const isProcessing = state === "processing"

  return (
    <div
      className="bg-background flex items-center justify-center"
      style={{ minHeight: remainingHeight ? `${remainingHeight}px` : undefined }}
    >
      <div className="w-full max-w-md">
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center space-y-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/user/bookings')}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>

            <div className="flex justify-center">
              {isProcessing ? (
                <div className="h-16 w-16 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive" />
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-card-foreground text-balance">
                {isProcessing ? 'Processing Payment' : 'Payment Cancelled'}
              </h1>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                {isProcessing
                  ? 'Please wait while we confirm your payment status.'
                  : 'Your payment was not completed. You can retry payment from your booking page.'}
              </p>
            </div>

            {!isProcessing && (
              <div className="space-y-3">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => router.push(`/user/bookings/${bookingId}`)}
                >
                  Retry Payment
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push('/user/bookings')}
                >
                  Go to My Bookings
                </Button>
              </div>
            )}

            {!isProcessing && errorMessage && (
              <div className="text-xs text-destructive/80">{errorMessage}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}





