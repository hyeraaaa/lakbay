"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Star, Loader2, RefreshCw } from 'lucide-react';
import { Booking, BookingStatus } from '@/services/bookingServices';
import { bookingService } from '@/services/bookingServices';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/components/NotificationProvider';
import { ConfirmationDialog } from '@/components/confirmation-dialog/confimationDialog';

interface BookingActionsCardProps {
  booking: Booking;
  onAction: (action: string) => void;
}

export default function BookingActionsCard({ booking, onAction }: BookingActionsCardProps) {
  const canCancel = bookingService.utils.canCancelBooking(booking);
  const canReview = bookingService.utils.canReviewBooking(booking, booking.user_id);
  const canRequestRefund = bookingService.utils.canRequestRefund(booking, booking.user_id);
  const isCancellationPending = booking.cancellation_status === 'pending_owner_approval';
  
  // Check if there's an existing refund request
  const existingRefund = booking.refunds?.find(refund => 
    refund.status === 'pending' || refund.status === 'processing'
  );
  const hasRefundRequest = !!existingRefund;
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<string>('');

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Review dialog state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Refund dialog state
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState<string>('');
  const [refundSubmitting, setRefundSubmitting] = useState<boolean>(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const { success, error: notifyError } = useNotification();

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      await onAction(action);
    } finally {
      setActionLoading(null);
    }
  };

  // Don't show actions if booking is cancelled
  if (booking.status === BookingStatus.CANCELED) {
    return null;
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isCancellationPending && (
          <div className="space-y-1">
            {booking.cancellation_status && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Cancellation Status:</span>{' '}
                <span className="capitalize">{String(booking.cancellation_status).replaceAll('_', ' ')}</span>
              </div>
            )}
            {booking.cancellation_reason && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Reason:</span>{' '}
                <span className="whitespace-pre-line">{booking.cancellation_reason}</span>
              </div>
            )}
          </div>
        )}
        {booking.status === BookingStatus.PENDING_PAYMENT && (
          <Button
            onClick={() => {
              setActionType('pay');
              setIsActionOpen(true);
            }}
            disabled={actionLoading === 'pay'}
            className={`w-full bg-black hover:bg-neutral-900 text-white ${actionLoading === 'pay' ? 'opacity-70' : ''}`}
          >
            {actionLoading === 'pay' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        )}

        {canCancel && !isCancellationPending && (
          <AlertDialog
            open={isCancelOpen}
            onOpenChange={(open) => {
              if (!isSubmitting) setIsCancelOpen(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button
                className="w-full bg-white hover:bg-neutral-100 text-black border"
              >
                Cancel Booking
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for cancellation. This may impact your refund eligibility.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Textarea
                  placeholder="Reason for cancellation"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                {error && (
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>Back</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isSubmitting || cancelReason.trim().length === 0}
                  className="bg-black hover:bg-neutral-900 text-white"
                  onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setError(null);
                    setIsSubmitting(true);
                    try {
                      await bookingService.cancelBooking(booking.booking_id, cancelReason.trim());
                      setIsCancelOpen(false);
                      setCancelReason('');
                      onAction('cancelled');
                      success('Booking cancellation submitted');
                    } catch (e: unknown) {
                      setError(e instanceof Error ? e.message : 'Failed to cancel booking');
                      notifyError(e instanceof Error ? e.message : 'Failed to cancel booking');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Confirm Cancel'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        

        {canReview && (
          <AlertDialog
            open={isReviewOpen}
            onOpenChange={(open) => {
              if (!reviewSubmitting) setIsReviewOpen(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button className="w-full bg-black text-white">
                Leave a Review
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave a Review</AlertDialogTitle>
                <AlertDialogDescription>
                  Rate your trip and share any feedback. Ratings help hosts and future renters.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, index) => {
                    const starIndex = index + 1;
                    const isActive = starIndex <= reviewRating;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setReviewRating(starIndex)}
                        className="p-0 m-0"
                        aria-label={`Rate ${starIndex} star${starIndex > 1 ? 's' : ''}`}
                      >
                        <Star className={`w-6 h-6 ${isActive ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-sm font-medium">{reviewRating}/5</span>
                </div>
                <Textarea
                  placeholder="Share details about your experience (optional)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                {reviewError && (
                  <p className="text-sm text-red-600">{reviewError}</p>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={reviewSubmitting}>Back</AlertDialogCancel>
                <AlertDialogAction
                  disabled={reviewSubmitting || reviewRating < 1}
                  className="bg-black hover:bg-neutral-900 text-white"
                  onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setReviewError(null);
                    setReviewSubmitting(true);
                    try {
                      await bookingService.leaveReview(booking.booking_id, {
                        rating: reviewRating,
                        comment: reviewComment.trim() || undefined,
                      });
                      setIsReviewOpen(false);
                      setReviewRating(0);
                      setReviewComment('');
                      onAction('reviewed');
                      success('Review submitted');
                    } catch (e: unknown) {
                      setReviewError(e instanceof Error ? e.message : 'Failed to submit review');
                      notifyError(e instanceof Error ? e.message : 'Failed to submit review');
                    } finally {
                      setReviewSubmitting(false);
                    }
                  }}
                >
                  {reviewSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {canRequestRefund && (
          <AlertDialog
            open={isRefundOpen}
            onOpenChange={(open) => {
              if (!refundSubmitting) setIsRefundOpen(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button className="w-full bg-white hover:bg-neutral-100 text-black border">
                <RefreshCw className="w-4 h-4 mr-2" />
                Request a Refund
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Request a refund</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for your refund request. Our team will review your request and respond within 2-3 business days.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-3">
                <Textarea
                  placeholder="Please describe why you're requesting a refund..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
                {refundError && (
                  <p className="text-sm text-red-600">{refundError}</p>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={refundSubmitting}>Back</AlertDialogCancel>
                <AlertDialogAction
                  disabled={refundSubmitting || refundReason.trim().length === 0}
                  className="bg-black hover:bg-neutral-900 text-white"
                  onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setRefundError(null);
                    setRefundSubmitting(true);
                    try {
                      await bookingService.requestRefund(booking.booking_id, 'other', refundReason.trim());
                      setIsRefundOpen(false);
                      setRefundReason('');
                      onAction('refund_requested');
                      success('Refund request submitted');
                    } catch (e: unknown) {
                      setRefundError(e instanceof Error ? e.message : 'Failed to submit refund request');
                      notifyError(e instanceof Error ? e.message : 'Failed to submit refund request');
                    } finally {
                      setRefundSubmitting(false);
                    }
                  }}
                >
                  {refundSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Show disabled refund button if refund request already exists */}
        {hasRefundRequest && (
          <div className="space-y-2">
            <Button 
              disabled 
              className="w-full bg-gray-100 text-gray-500 border cursor-not-allowed"
            >
              Refund Request Pending
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    <ConfirmationDialog
      open={isActionOpen}
      onOpenChange={setIsActionOpen}
      title={'Proceed to Payment'}
      description={'You will be redirected to complete your payment.'}
      confirmText={'Proceed'}
      onConfirm={() => {
        void handleAction('pay');
      }}
    />
    </>
  );
}
