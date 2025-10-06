"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
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
        </div>
      </CardContent>
    </Card>
  );
}

