"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckInFormProps {
  bookingId: number;
  onCheckIn: (data: { odometer_reading?: number; odometer_photo_url?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CheckInForm({ bookingId, onCheckIn, onCancel, isLoading = false }: CheckInFormProps) {
  const [odometerReading, setOdometerReading] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate odometer data if provided
      const odometer = odometerReading.trim();
      if (odometer && isNaN(Number(odometer))) {
        setError('Odometer reading must be a valid number');
        return;
      }

      // If odometer is provided, photo URL is required
      if (odometer && !photoUrl.trim()) {
        setError('Photo URL is required when providing odometer reading');
        return;
      }

      // If photo URL is provided, odometer is required
      if (photoUrl.trim() && !odometer) {
        setError('Odometer reading is required when providing photo URL');
        return;
      }

      const checkinData: { odometer_reading?: number; odometer_photo_url?: string } = {};
      
      if (odometer) {
        checkinData.odometer_reading = Number(odometer);
      }
      
      if (photoUrl.trim()) {
        checkinData.odometer_photo_url = photoUrl.trim();
      }

      await onCheckIn(checkinData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    }
  };

  const handleSkipOdometer = async () => {
    setError(null);
    try {
      await onCheckIn({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Check In Vehicle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="odometer">Odometer Reading (km) - Optional</Label>
            <Input
              id="odometer"
              type="number"
              placeholder="Enter current odometer reading"
              value={odometerReading}
              onChange={(e) => setOdometerReading(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              GPS tracking is the primary method. Odometer reading is optional for verification.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">Odometer Photo URL - Optional</Label>
            <Input
              id="photoUrl"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Enter the URL of the odometer photo. Required if providing odometer reading.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking In...
                </>
              ) : (
                'Check In with Odometer Data'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipOdometer}
              disabled={isLoading}
              className="w-full"
            >
              Check In with GPS Only
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
