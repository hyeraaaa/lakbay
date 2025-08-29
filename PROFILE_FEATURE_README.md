# Dynamic Profile Feature

This feature allows users to view any user's profile using dynamic routing with the URL pattern `/profile/[id]`.

## Features

- **Dynamic Routing**: Access any user's profile via `/profile/[id]`
- **User Discovery**: Browse and search through all users on the platform
- **Profile Viewing**: View detailed information about any user
- **Own Profile Management**: Special features when viewing your own profile

## URL Structure

- `/profile` - Main profile page showing all users with search functionality
- `/profile/[id]` - Individual user profile page (e.g., `/profile/123`)

## Setup Requirements

### Environment Variables

Create a `.env.local` file in the root directory with:

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Backend Requirements

The backend must have the following endpoints:
- `GET /api/users` - Fetch all users (with pagination and filtering)
- `GET /api/users/:userId` - Fetch specific user profile

## API Routes

### Frontend API Routes (Next.js)

- `/api/users` - Proxies to backend `/api/users`
- `/api/users/[id]` - Proxies to backend `/api/users/:userId`

### Backend API Endpoints

- `GET /api/users` - Returns paginated list of users
- `GET /api/users/:userId` - Returns specific user profile

## Usage Examples

### Viewing Your Own Profile
1. Navigate to `/profile`
2. Click "My Profile" button
3. Or directly visit `/profile/[your-user-id]`

### Viewing Other Users' Profiles
1. Navigate to `/profile`
2. Browse the user list or use search
3. Click on any user card to view their profile
4. Or directly visit `/profile/[user-id]`

### Searching Users
1. Go to `/profile`
2. Use the search bar to find users by name or email
3. Results update in real-time as you type

## Features by Profile Type

### Own Profile (`/profile/[your-id]`)
- Edit Profile button
- Verification options (ID, phone)
- Full profile information
- Trust building tips

### Other Users' Profiles (`/profile/[other-id]`)
- Read-only profile information
- No edit buttons
- Limited verification information
- Public profile view

## Security Features

- JWT authentication required for all profile access
- Users can only edit their own profiles
- Profile data is fetched securely through authenticated API calls
- Backend validates user permissions

## Error Handling

- 404 for non-existent users
- Loading states during API calls
- Error messages for failed requests
- Graceful fallbacks for missing data

## Technical Implementation

### Components
- `ProfilePage` - Main profile listing page
- `[id]/page.tsx` - Dynamic profile route component
- API route handlers for proxying backend requests

### State Management
- Uses React hooks for local state
- JWT context for authentication
- Error handling and loading states

### API Integration
- Proxies requests to backend server
- Transforms backend data to frontend format
- Handles authentication headers
- Error handling and status codes

## Future Enhancements

- Profile editing functionality
- Profile picture uploads
- User reviews and ratings
- Social features (following, blocking)
- Privacy settings
- Activity feeds
