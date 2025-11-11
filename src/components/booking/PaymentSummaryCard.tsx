"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { Booking, PaymentStatus } from '@/services/bookingServices';
import { bookingService } from '@/services/bookingServices';

interface PaymentSummaryCardProps {
  booking: Booking;
}

const getPaymentStatusColor = (status: PaymentStatus) => {
  const statusColors = {
    [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [PaymentStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [PaymentStatus.DENIED]: 'bg-red-100 text-red-800',
    [PaymentStatus.REFUNDED]: 'bg-blue-100 text-blue-800',
    [PaymentStatus.PARTIALLY_REFUNDED]: 'bg-orange-100 text-orange-800',
    [PaymentStatus.EXPIRED]: 'bg-gray-100 text-gray-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export default function PaymentSummaryCard({ booking }: PaymentSummaryCardProps) {
  const calculateTotalAmount = () => {
    if (!booking?.payment_details || booking.payment_details.length === 0) return 0;
    const payment = booking.payment_details[0];
    return payment?.amount || 0;
  };

  const getDaysDuration = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Find overage payment details
  const getOveragePayment = () => {
    if (!booking.payment_details || booking.payment_details.length === 0) return null;
    
    // Look for payment details that match the overage amount
    const overageAmount = booking.overage_amount || 0;
    if (overageAmount <= 0) return null;
    
    // Find payment detail that matches overage amount (within small tolerance)
    const overagePayment = booking.payment_details.find(pd => 
      Math.abs(Number(pd.amount) - overageAmount) < 0.01
    );
    
    return overagePayment || null;
  };

  const overagePayment = getOveragePayment();
  const hasOverage = (booking.overage_amount || 0) > 0;

  if (!booking.payment_details || booking.payment_details.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment & Price Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Payment Status</span>
            <Badge className={`${getPaymentStatusColor(booking.payment_details[0].payment_status)}`}>
              {bookingService.utils.getPaymentStatusDisplayText(booking.payment_details[0].payment_status)}
            </Badge>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Price Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Rate ({getDaysDuration()} day{getDaysDuration() !== 1 ? 's' : ''})</span>
                <span>₱{((booking.vehicle?.rate_per_day || 0) * getDaysDuration()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee</span>
                <span>₱{booking.payment_details[0]?.fee_amount?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>₱{booking.payment_details[0]?.tax_amount?.toLocaleString() || '0'}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>₱{calculateTotalAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overage Payment Section */}
          {hasOverage && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                Mileage Overage Payment
              </h4>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Overage Distance:</span>
                  <span className="font-medium text-orange-800">
                    {booking.overage_mileage || 0} km
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Overage Amount:</span>
                  <span className="font-medium text-orange-800">
                    ₱{(booking.overage_amount || 0).toFixed(2)}
                  </span>
                </div>
                {overagePayment && (
                  <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                    <span className="text-sm text-orange-700">Payment Status:</span>
                    <Badge className={`${getPaymentStatusColor(overagePayment.payment_status)}`}>
                      {bookingService.utils.getPaymentStatusDisplayText(overagePayment.payment_status)}
                    </Badge>
                  </div>
                )}
                {!overagePayment && hasOverage && (
                  <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                    <span className="text-sm text-orange-700">Payment Status:</span>
                    <Badge className="bg-gray-100 text-gray-800">
                      Not Initiated
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

