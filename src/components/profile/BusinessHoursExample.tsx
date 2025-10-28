// Example usage of the BusinessHours component

import BusinessHours from '@/components/profile/BusinessHours'

// Example 1: Owner view (with edit functionality)
function OwnerProfilePage() {
  return (
    <div className="space-y-6">
      <h1>My Profile</h1>
      <BusinessHours isOwner={true} />
    </div>
  )
}

// Example 2: Customer viewing specific owner's hours (public view)
function VehicleOwnerProfilePage({ ownerId }: { ownerId: number }) {
  return (
    <div className="space-y-6">
      <h1>Host Profile</h1>
      <BusinessHours isOwner={false} ownerId={ownerId} />
    </div>
  )
}

// Example 3: Customer viewing vehicle listing with owner hours
function VehicleListingPage({ vehicle }: { vehicle: { owner_id: number } }) {
  return (
    <div className="space-y-6">
      <h1>Vehicle Details</h1>
      {/* Vehicle details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2>Vehicle Information</h2>
          {/* Vehicle info */}
        </div>
        <div>
          <h2>Host Availability</h2>
          <BusinessHours isOwner={false} ownerId={vehicle.owner_id} />
        </div>
      </div>
    </div>
  )
}

// Example 4: Customer dashboard (will show helpful message)
function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <h1>My Dashboard</h1>
      {/* This will show "No Business Hours Available" message for customers */}
      <BusinessHours isOwner={false} />
    </div>
  )
}

export { OwnerProfilePage, VehicleOwnerProfilePage, VehicleListingPage, CustomerDashboardPage }
