# Vehicle Registration System

This document describes the vehicle registration system that allows vehicle owners to submit required documents for vehicle verification and approval.

## Overview

The registration system consists of:
- **Frontend**: `DocumentUploadDialog` component for document uploads
- **Backend**: Registration service and API endpoints
- **Database**: Registration records stored in the database

## Frontend Components

### DocumentUploadDialog

A React component that provides a dialog interface for uploading vehicle registration documents.

#### Props

```typescript
interface DocumentUploadDialogProps {
  children: React.ReactNode;  // Trigger element (usually a button)
  vehicleId: number;          // ID of the vehicle to register
}
```

#### Usage Example

```tsx
import { DocumentUploadDialog } from "@/components/cars/documentUploadDialog";

// In your component
<DocumentUploadDialog vehicleId={vehicle.vehicle_id}>
  <Button>Submit Documents</Button>
</DocumentUploadDialog>
```

#### Features

- File upload for Original Receipt and Certificate of Registration
- Image preview for uploaded documents
- Form validation
- Loading states during submission
- Success/error notifications using AnimatedAlert
- Support for PDF, JPG, JPEG, and PNG files

## Backend API Endpoints

### Base URL
```
http://localhost:3000/api/registration
```

### Endpoints

#### 1. Submit Registration
```
POST /:vehicleId/submit
```

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: multipart/form-data`

**Body (FormData):**
- `originalReceipt`: File (required)
- `certificateOfRegistration`: File (required)
- `additionalDocumentType`: string (optional)
- `additionalDocument`: File (optional)
- `additionalDocumentNumber`: string (optional)

**Response:**
```json
{
  "message": "Vehicle registration submitted successfully. Please wait for admin review.",
  "registrationId": 123
}
```

#### 2. Get Registration Status
```
GET /:vehicleId/status
```

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "hasRegistration": true,
  "registration": {
    "id": 123,
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00Z",
    "reviewedAt": null,
    "reviewNotes": null
  },
  "vehicle": {
    "vehicle_id": 456,
    "brand": "Toyota",
    "model": "Camry",
    "year": 2020,
    "availability": "on_hold"
  }
}
```

#### 3. Get Owner Registrations
```
GET /owner/all
```

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
[
  {
    "registration_id": 123,
    "status": "pending",
    "submitted_at": "2024-01-15T10:30:00Z",
    "vehicle": {
      "vehicle_id": 456,
      "brand": "Toyota",
      "model": "Camry",
      "year": 2020,
      "availability": "on_hold"
    }
  }
]
```

#### 4. Get All Registrations (Admin Only)
```
GET /?page=1&limit=10&status=pending
```

**Headers:**
- `Authorization: Bearer <ADMIN_JWT_TOKEN>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (optional)

#### 5. Review Registration (Admin Only)
```
POST /:registrationId/review
```

**Headers:**
- `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- `Content-Type: application/json`

**Body:**
```json
{
  "status": "approved",
  "notes": "Documents verified successfully"
}
```

## Registration Service

The `registrationService` provides methods for interacting with the registration API:

```typescript
import { registrationService } from "@/services/registrationService";

// Submit registration
const result = await registrationService.submitRegistration({
  vehicleId: 123,
  originalReceipt: file1,
  certificateOfRegistration: file2
});

// Get status
const status = await registrationService.getRegistrationStatus(123);

// Get owner registrations
const registrations = await registrationService.getOwnerRegistrations();
```

## File Upload Requirements

### Supported Formats
- **Images**: JPG, JPEG, PNG
- **Documents**: PDF

### File Size Limit
- Maximum file size: 10MB per file

### Storage Location
Files are stored in: `server/lakbay-backend/uploads/registration-documents/`

## Registration Status Flow

1. **Pending**: Initial status when documents are submitted
2. **Under Review**: Admin is reviewing the documents
3. **Approved**: Documents verified, vehicle becomes available
4. **Rejected**: Documents rejected, owner needs to resubmit

## Security Features

- JWT authentication required for all endpoints
- Admin middleware for admin-only operations
- File type validation
- File size limits
- User ownership verification

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors**: File type, size, required fields
- **Authentication Errors**: Invalid or missing JWT tokens
- **Authorization Errors**: Insufficient permissions
- **Business Logic Errors**: Vehicle not found, already registered, etc.

## Testing

Use the provided HTTP test file: `server/lakbay-backend/registration-endpoints-test.http`

### Prerequisites
1. Backend server running on port 3000
2. Valid JWT token from login
3. Test documents in `test-documents/` directory

### Running Tests
1. Install REST Client extension in VS Code
2. Open the HTTP test file
3. Replace `YOUR_JWT_TOKEN_HERE` with actual token
4. Click "Send Request" above each endpoint

## Integration with Vehicle System

The registration system integrates with the existing vehicle system:

- Vehicles with `availability: "on_hold"` show the document upload dialog
- Upon approval, vehicle availability changes to `"available"`
- Registration status is tracked per vehicle
- Vehicle owners can view their registration history

## Future Enhancements

- Email notifications for status changes
- Document expiration tracking
- Bulk document upload
- Document preview in admin panel
- Registration analytics and reporting
