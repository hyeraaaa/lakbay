# Google Authentication Setup Guide

## Issue Fixed
The "Invalid Google login" error was caused by a token type mismatch between frontend and backend.

## What Was Fixed
1. **Backend Token Verification**: Updated the backend to verify Google access tokens instead of ID tokens
2. **Frontend Token Handling**: The frontend now correctly sends access tokens to the backend

## Environment Variables Required

Create a `.env.local` file in the `lakbay` directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Google OAuth Configuration
# Get this from Google Cloud Console > APIs & Services > Credentials
# Create OAuth 2.0 Client ID for Web Application
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Create a `.env` file in the `server/lakbay-backend` directory with:

```env
# Backend Google OAuth Configuration
# This should be the same as NEXT_PUBLIC_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_ID=your_google_client_id_here
```

## How to Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "APIs & Services" > "Credentials"
5. Click "Create Credentials" > "OAuth 2.0 Client ID"
6. Choose "Web application"
7. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production domain (for production)
8. Copy the Client ID and use it in your environment variables

## Testing

After setting up the environment variables:

1. Restart your development servers
2. Try logging in with Google
3. The authentication should now work properly

## Changes Made

### Frontend (`lakbay/src/hooks/login/useLoginForm.ts`)
- Updated to send access tokens to backend (this was already correct)

### Backend (`server/lakbay-backend/src/services/authService.js`)
- Changed token verification from ID token to access token
- Updated the Google tokeninfo endpoint URL to use `access_token` parameter instead of `id_token`

