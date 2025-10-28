"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, AlertCircle, Loader2 } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/components/NotificationProvider';
import CheckInForm from './CheckInForm';
import CheckOutForm from './CheckOutForm';

interface OwnerBookingActionsCardProps {
  booking: Booking;
  onAction: (action: string) => void;
}

export default function OwnerBookingActionsCard({ booking, onAction }: OwnerBookingActionsCardProps) {
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showCheckOutForm, setShowCheckOutForm] = useState(false);
  const { success, error: notifyError } = useNotification();
  const isCancellationPending = booking.cancellation_status === 'pending_owner_approval';

  // Don't show actions if booking is cancelled or completed
  if (booking.status === BookingStatus.CANCELED || booking.status === BookingStatus.COMPLETED) {
    return null;
  }

  const handleActionClick = (action: string) => {
    if (action === 'checkin') {
      setShowCheckInForm(true);
      return;
    }
    if (action === 'checkout') {
      setShowCheckOutForm(true);
      return;
    }
    setActionType(action);
    setIsActionOpen(true);
  };

  const handleConfirmAction = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      switch (actionType) {
        case 'approve':
          await bookingService.approveBooking(booking.booking_id);
          success('Booking approved successfully');
          break;
        case 'approveCancellation':
          await bookingService.approveCancellation(booking.booking_id);
          success('Cancellation approved successfully');
          break;
        case 'rejectCancellation':
          await bookingService.rejectCancellation(booking.booking_id);
          success('Cancellation rejected');
          break;
        case 'reject':
          await bookingService.rejectBooking(booking.booking_id, rejectReason.trim() || undefined);
          success('Booking rejected');
          break;
        case 'checkout':
          // This case is now handled by the CheckOutForm component
          break;
        case 'checkin':
          // This case is now handled by the CheckInForm component
          break;
        case 'endEarly':
          await bookingService.endEarly(booking.booking_id);
          success('Booking ended early');
          break;
        default:
          throw new Error('Unknown action');
      }
      setIsActionOpen(false);
      setRejectReason(''); // Reset reject reason
      // Call onAction to trigger data refresh in the parent component
      await onAction(actionType);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : `Failed to ${actionType} booking`);
      notifyError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (checkinData: { odometer_reading?: number; odometer_photo_url?: string }) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await bookingService.checkIn(booking.booking_id, checkinData);
      success('Checked in successfully');
      setShowCheckInForm(false);
      // Call onAction to trigger data refresh in the parent component
      await onAction('checkin');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to check in');
      notifyError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (checkoutData: { odometer_reading?: number; odometer_photo_url?: string }) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await bookingService.checkOut(booking.booking_id, checkoutData);
      success('Checked out successfully');
      setShowCheckOutForm(false);
      // Call onAction to trigger data refresh in the parent component
      await onAction('checkout');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to check out');
      notifyError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionConfig = (action: string) => {
    const configs = {
      approve: {
        title: 'Approve Booking',
        description: 'Are you sure you want to approve this booking? The customer will be notified and payment will be processed.',
        buttonText: 'Approve Booking',
        triggerButtonClass: 'bg-black hover:bg-neutral-900 text-white',
        confirmButtonClass: 'bg-black hover:bg-neutral-900 text-white',
      },
      approveCancellation: {
        title: 'Approve Cancellation',
        description: 'Approve this cancellation request. An 80% refund will be issued to the customer as per policy.',
        buttonText: 'Approve Cancellation',
        triggerButtonClass: 'bg-black hover:bg-neutral-900 text-white',
        confirmButtonClass: 'bg-black hover:bg-neutral-900 text-white',
      },
      rejectCancellation: {
        title: 'Reject Cancellation',
        description: 'Reject this cancellation request. The booking will remain active.',
        buttonText: 'Reject Cancellation',
        triggerButtonClass: 'bg-white hover:bg-neutral-100 text-black border',
        confirmButtonClass: 'bg-white hover:bg-neutral-100 text-black border',
      },
      reject: {
        title: 'Reject Booking',
        description: 'Are you sure you want to reject this booking? The customer will be notified and a full refund will be processed.',
        buttonText: 'Reject Booking',
        triggerButtonClass: 'bg-white hover:bg-neutral-100 text-black border',
        confirmButtonClass: 'bg-white hover:bg-neutral-100 text-black border',
      },
      checkout: {
        title: 'Check Out Vehicle',
        description: 'Confirm that the customer has picked up the vehicle and the rental period has started.',
        buttonText: 'Check Out',
        triggerButtonClass: 'bg-black hover:bg-neutral-900 text-white',
        confirmButtonClass: 'bg-black hover:bg-neutral-900 text-white',
      },
      checkin: {
        title: 'Check In Vehicle',
        description: 'Confirm that the customer has returned the vehicle and the rental period has ended. This will automatically complete the booking.',
        buttonText: 'Check In',
        triggerButtonClass: 'bg-black hover:bg-neutral-900 text-white',
        confirmButtonClass: 'bg-black hover:bg-neutral-900 text-white',
      },
      endEarly: {
        title: 'End Booking Early',
        description: 'End this ongoing booking early. Payouts and refunds will be calculated per policy.',
        buttonText: 'End Early',
        // Keep trigger button white, but confirm button black as requested
        triggerButtonClass: 'bg-white hover:bg-neutral-100 text-black border',
        confirmButtonClass: 'bg-black hover:bg-neutral-900 text-white',
      },
    } as const;
    return configs[action as keyof typeof configs] || configs.approve;
  };

  const renderActionButton = (action: string, condition: boolean) => {
    if (!condition) return null;

    const config = getActionConfig(action);
    const isCurrentAction = actionType === action && isSubmitting;

    return (
      <Button
        key={action}
        onClick={() => handleActionClick(action)}
        disabled={isSubmitting}
        className={`w-full ${config.triggerButtonClass} ${isSubmitting ? 'opacity-70' : ''}`}
      >
        {isCurrentAction ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          config.buttonText
        )}
      </Button>
    );
  };

  // Show check-in form if requested
  if (showCheckInForm) {
    return (
      <CheckInForm
        bookingId={booking.booking_id}
        onCheckIn={handleCheckIn}
        onCancel={() => setShowCheckInForm(false)}
        isLoading={isSubmitting}
      />
    );
  }

  // Show check-out form if requested
  if (showCheckOutForm) {
    return (
      <CheckOutForm
        bookingId={booking.booking_id}
        onCheckOut={handleCheckOut}
        onCancel={() => setShowCheckOutForm(false)}
        isLoading={isSubmitting}
      />
    );
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
          {renderActionButton('approve', booking.status === BookingStatus.AWAITING_OWNER_APPROVAL && !isCancellationPending)}
          {renderActionButton('reject', booking.status === BookingStatus.AWAITING_OWNER_APPROVAL && !isCancellationPending)}
          {renderActionButton('approveCancellation', isCancellationPending && booking.status !== BookingStatus.ON_GOING)}
          {renderActionButton('rejectCancellation', isCancellationPending && booking.status !== BookingStatus.ON_GOING)}
          {renderActionButton('checkout', booking.status === BookingStatus.CONFIRMED && !isCancellationPending)}
          {renderActionButton('checkin', booking.status === BookingStatus.ON_GOING && !isCancellationPending)}
          {renderActionButton('endEarly', booking.status === BookingStatus.ON_GOING && !isCancellationPending)}

          {booking.status === BookingStatus.PENDING_PAYMENT && (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Waiting for customer payment
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getActionConfig(actionType).title}</AlertDialogTitle>
            <AlertDialogDescription>
              {getActionConfig(actionType).description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {actionType === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for rejection (optional)</label>
              <Textarea
                placeholder="Please provide a reason for rejecting this booking..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          {actionType === 'approveCancellation' && booking.cancellation_reason && (
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
              <div className="font-medium mb-1">Cancellation Reason</div>
              <div className="whitespace-pre-line">{booking.cancellation_reason}</div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={handleConfirmAction}
              className={getActionConfig(actionType).confirmButtonClass}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                getActionConfig(actionType).buttonText
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
