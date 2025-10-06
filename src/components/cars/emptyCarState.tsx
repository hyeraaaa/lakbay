import { Car, Plus, CreditCard } from "lucide-react"
import Link from "next/link"

interface EmptyCarsStateProps {
  needsStripeSetup?: boolean
}

export function EmptyCarsState({ needsStripeSetup = false }: EmptyCarsStateProps) {
  if (needsStripeSetup) {
    return (
      <div className="flex flex-col my-auto items-center justify-center px-4 py-10">
        <div className="bg-muted/50 rounded-full p-6 mb-6">
          <CreditCard className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Payment setup required</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          You need to set up your Stripe Connect account to receive payments before adding vehicles to the platform.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Go to</span>
          <Link href="/settings" className="font-medium underline hover:text-foreground transition-colors">
            Settings
          </Link>
          <span>to set up payments</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col my-auto items-center justify-center px-4 py-10">
      <div className="bg-muted/50 rounded-full p-6 mb-6">
        <Car className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">No cars in your fleet yet</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Start building your car collection by adding your first vehicle. Track details, manage rates, and organize your
        entire fleet in one place.
      </p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Click the</span>
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
          <Plus className="h-3 w-3" />
        </div>
        <span>button to get started</span>
      </div>
    </div>
  )
}
