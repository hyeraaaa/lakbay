"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, ArrowLeft, Receipt } from "lucide-react"
import Link from "next/link"
import { bookingService, PaymentStatus as ServerPaymentStatus } from "@/services/bookingServices"
import { apiRequest } from "@/lib/jwt"

type PaymentStatus = "processing" | "success" | "failed"

type InvoiceSummary = {
  invoice_id?: number | string
  booking?: {
    booking_id?: number
  }
}

export default function PaymentSuccessPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const bookingId = Number(params.id)

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("processing")
  const [transactionId, setTransactionId] = useState<string | undefined>(undefined)
  const [amountPaid, setAmountPaid] = useState<number | undefined>(undefined)
  const [transactionDate, setTransactionDate] = useState<string | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [remainingHeight, setRemainingHeight] = useState<number | null>(null)
  const [invoiceId, setInvoiceId] = useState<number | null>(null)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  useEffect(() => {
    const load = async () => {
      try {
        const booking = await bookingService.getBookingDetails(bookingId)
        const pd = booking?.payment_details?.[0]
        if (!pd) {
          setPaymentStatus("failed")
          setErrorMessage("Payment details not found for this booking.")
          return
        }

        // capture details
        setTransactionId(pd.stripe_payment_intent_id || pd.stripe_session_id || `PD-${pd.payment_detail_id}`)
        setAmountPaid(pd.amount)
        setTransactionDate(pd.transaction_date || pd.updated_at)

        switch (pd.payment_status) {
          case ServerPaymentStatus.COMPLETED:
            setPaymentStatus("success")
            break
          case ServerPaymentStatus.PENDING:
            setPaymentStatus("processing")
            break
          case ServerPaymentStatus.DENIED:
          case ServerPaymentStatus.EXPIRED:
            setPaymentStatus("failed")
            break
          case ServerPaymentStatus.REFUNDED:
          case ServerPaymentStatus.PARTIALLY_REFUNDED:
            setPaymentStatus("success")
            break
          default:
            setPaymentStatus("processing")
        }
        // Try to resolve invoice id for this booking (best effort)
        try {
          const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '')
          const res = await apiRequest(`${baseUrl}/api/audit-invoices-reporting/invoices`, {
            method: 'GET',
          })
          if (res.ok) {
            const data = await res.json()
            const list: Array<InvoiceSummary> = Array.isArray(data?.invoices) ? data.invoices : []
            // Prefer an invoice whose booking matches this booking id
            const match = list.find((inv) => inv?.booking?.booking_id === bookingId) || null
            if (match?.invoice_id) {
              setInvoiceId(Number(match.invoice_id))
            }
          }
        } catch (e) {
          // non-fatal if we cannot resolve invoice id here
        }
      } catch (err: unknown) {
        setPaymentStatus("failed")
        setErrorMessage(err instanceof Error ? err.message : "Failed to load payment status")
      }
    }

    load()
    // poll while pending/processing
    const interval = setInterval(load, 8000)

    return () => {
      clearInterval(interval)
    }
  }, [bookingId])

  // Calculate remaining viewport height after navbar/header to vertically center the card
  useEffect(() => {
    const computeHeight = () => {
      if (typeof window === 'undefined') return
      const viewport = window.innerHeight
      // Try common selectors for app navbar/header
      const headerEl = (document.querySelector('header') || document.querySelector('nav')) as HTMLElement | null
      const headerHeight = headerEl ? headerEl.offsetHeight : 0
      const result = Math.max(0, viewport - headerHeight)
      setRemainingHeight(result)
    }
    computeHeight()
    window.addEventListener('resize', computeHeight)
    return () => window.removeEventListener('resize', computeHeight)
  }, [])

  const getStatusContent = () => {
    switch (paymentStatus) {
      case "processing":
        return {
          icon: <Loader2 className="h-16 w-16 text-accent animate-spin" />,
          title: "Processing Payment",
          description: "Please wait while we process your payment. This may take a few moments.",
          showActions: false,
        }
      case "success":
        return {
          icon: <CheckCircle className="h-16 w-16 text-emerald-600" />,
          title: "Payment Successful!",
          description:
            "Thank you for your booking. Your payment has been processed successfully.",
          showActions: true,
        }
      case "failed":
        return {
          icon: <XCircle className="h-16 w-16 text-destructive" />,
          title: "Payment Failed",
          description: "We were unable to process your payment. Please check your payment details and try again.",
          showActions: true,
        }
    }
  }

  const content = getStatusContent()

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true)
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '')

      // If invoice id is unknown, attempt to fetch it on demand
      let resolvedInvoiceId = invoiceId
      if (!resolvedInvoiceId) {
        const res = await apiRequest(`${baseUrl}/api/audit-invoices-reporting/invoices`, { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          const list: Array<InvoiceSummary> = Array.isArray(data?.invoices) ? data.invoices : []
          const match = list.find((inv) => inv?.booking?.booking_id === bookingId) || null
          if (match?.invoice_id) {
            resolvedInvoiceId = Number(match.invoice_id)
            setInvoiceId(resolvedInvoiceId)
          }
        }
      }

      if (!resolvedInvoiceId) {
        throw new Error('Invoice not found for this booking')
      }

      const url = `${baseUrl}/api/audit-invoices-reporting/invoices/${resolvedInvoiceId}/export?format=pdf`
      const response = await apiRequest(url, { method: 'GET' })
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(text || 'Failed to download receipt')
      }
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)

      const contentDisposition = response.headers.get('Content-Disposition') || ''
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition)
      const fileName = decodeURIComponent(match?.[1] || match?.[2] || `invoice_${resolvedInvoiceId}.pdf`)

      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(downloadUrl)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to download receipt'
      setErrorMessage(msg)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div
      className="bg-background flex pt-20 justify-center"
      style={{ minHeight: remainingHeight ? `${remainingHeight}px` : undefined }}
    >
      <div className="w-full max-w-md">
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center space-y-6">
            {/* Status Icon */}
            <div className="flex justify-center">{content.icon}</div>

            {/* Status Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-card-foreground text-balance">{content.title}</h1>
              <p className="text-muted-foreground text-pretty leading-relaxed">{content.description}</p>
        </div>

            {/* Payment Details (shown on success) */}
            {paymentStatus === "success" && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-card-foreground">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold text-card-foreground">
                    {amountPaid !== undefined ? `₱${amountPaid.toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-card-foreground">
                    {transactionDate ? new Date(transactionDate).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {content.showActions && (
              <div className="space-y-3">
                {paymentStatus === "success" ? (
                  <>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleDownloadReceipt} disabled={isDownloading}>
                      <Receipt className="h-4 w-4 mr-2" />
                      {isDownloading ? 'Preparing Receipt…' : 'Download Receipt'}
                    </Button>
                    <Link href="/user/bookings" className="block">
                      <Button variant="outline" className="w-full bg-transparent">
                        Go to My Bookings
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => router.push(`/user/bookings/${bookingId}`)}
                    >
                      Try Again
                    </Button>
                    <Link href="/" className="block">
                      <Button variant="outline" className="w-full bg-transparent">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                      </Button>
                    </Link>
                  </>
                )}
                      </div>
                    )}

            {/* Processing indicator */}
            {paymentStatus === "processing" && (
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                </div>
              )}
            {paymentStatus === "failed" && errorMessage && (
              <div className="text-xs text-destructive/80">{errorMessage}</div>
            )}
            </CardContent>
          </Card>

        
      </div>
    </div>
  )
}
