"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckOutFormProps {
  bookingId: number;
  onCheckOut: (data: { odometer_reading?: number; odometer_photo_url?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CheckOutForm({ bookingId, onCheckOut, onCancel, isLoading = false }: CheckOutFormProps) {
  const [odometerReading, setOdometerReading] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'odometer-photos');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const data = await response.json();
      return data.url;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let finalPhotoUrl = photoUrl;

      // Upload photo if file is selected
      if (photoFile && !photoUrl) {
        finalPhotoUrl = await uploadPhoto(photoFile);
      }

      // Validate odometer data if provided
      const odometer = odometerReading.trim();
      if (odometer && isNaN(Number(odometer))) {
        setError('Odometer reading must be a valid number');
        return;
      }

      // If odometer is provided, photo is required
      if (odometer && !finalPhotoUrl) {
        setError('Photo is required when providing odometer reading');
        return;
      }

      // If photo is provided, odometer is required
      if (finalPhotoUrl && !odometer) {
        setError('Odometer reading is required when providing photo');
        return;
      }

      const checkoutData: { odometer_reading?: number; odometer_photo_url?: string } = {};
      
      if (odometer) {
        checkoutData.odometer_reading = Number(odometer);
      }
      
      if (finalPhotoUrl) {
        checkoutData.odometer_photo_url = finalPhotoUrl;
      }

      await onCheckOut(checkoutData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out');
    }
  };

  const handleSkipOdometer = async () => {
    setError(null);
    try {
      await onCheckOut({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Check Out Vehicle
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
            <Label htmlFor="odometer">Starting Odometer Reading (km) - Optional</Label>
            <Input
              id="odometer"
              type="number"
              placeholder="Enter current odometer reading"
              value={odometerReading}
              onChange={(e) => setOdometerReading(e.target.value)}
              disabled={isLoading || isUploadingPhoto}
            />
            <p className="text-xs text-gray-500">
              GPS tracking will be the primary method. Odometer reading is optional for verification.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Odometer Photo - Optional</Label>
            <div className="space-y-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading || isUploadingPhoto}
              />
              {photoPreview && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Odometer preview"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    disabled={isLoading || isUploadingPhoto}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Take a clear photo of the odometer reading. Required if providing odometer reading.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">Or enter photo URL</Label>
            <Input
              id="photoUrl"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              disabled={isLoading || isUploadingPhoto || !!photoFile}
            />
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || isUploadingPhoto}
              className="w-full"
            >
              {(isLoading || isUploadingPhoto) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploadingPhoto ? 'Uploading...' : 'Checking Out...'}
                </>
              ) : (
                'Check Out with Odometer Data'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipOdometer}
              disabled={isLoading || isUploadingPhoto}
              className="w-full"
            >
              Check Out with GPS Only
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading || isUploadingPhoto}
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
