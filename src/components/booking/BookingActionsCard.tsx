"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Star, Loader2 } from 'lucide-react';
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

interface BookingActionsCardProps {
  booking: Booking;
  onAction: (action: string) => void;
}

export default function BookingActionsCard({ booking, onAction }: BookingActionsCardProps) {
  const canCancel = bookingService.utils.canCancelBooking(booking);
  const canReview = bookingService.utils.canReviewBooking(booking, booking.user_id);
  const canCheckIn = bookingService.utils.canCheckIn(booking, booking.user_id);
  const canEndEarly = bookingService.utils.canEndEarly(booking, booking.user_id);

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {booking.status === BookingStatus.PENDING_PAYMENT && (
          <Button
            onClick={() => handleAction('pay')}
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

        {canCancel && (
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

        {canCheckIn && (
          <Button
            onClick={() => handleAction('check-in')}
            disabled={actionLoading === 'check-in'}
            className={`w-full bg-black hover:bg-neutral-900 text-white ${actionLoading === 'check-in' ? 'opacity-70' : ''}`}
          >
            {actionLoading === 'check-in' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Check In'
            )}
          </Button>
        )}

        {canEndEarly && (
          <Button
            onClick={() => handleAction('end-early')}
            disabled={actionLoading === 'end-early'}
            className={`w-full bg-white hover:bg-neutral-100 text-black border ${actionLoading === 'end-early' ? 'opacity-70' : ''}`}
          >
            {actionLoading === 'end-early' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'End Early'
            )}
          </Button>
        )}

        {canReview && (
          <AlertDialog
            open={isReviewOpen}
            onOpenChange={(open) => {
              if (!reviewSubmitting) setIsReviewOpen(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button className="w-full bg-white hover:bg-neutral-100 text-black border">
                Leave Review
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave a review</AlertDialogTitle>
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
      </CardContent>
    </Card>
  );
}
