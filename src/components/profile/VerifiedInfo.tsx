"use client"
import { CheckCircle2 } from 'lucide-react'

type Props = {
  email?: string | null
  phone?: string | null
}

export default function VerifiedInfo({ email, phone }: Props) {
  return (
    <div className="mt-8">
      <div className="text-xs font-semibold text-muted-foreground mb-3">VERIFIED INFO</div>
      <ul className="space-y-3 text-sm">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-black" />
          <span>{email || 'Email address'}</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-black" />
          <span>{phone || 'Phone number'}</span>
        </li>
      </ul>
    </div>
  )
}





