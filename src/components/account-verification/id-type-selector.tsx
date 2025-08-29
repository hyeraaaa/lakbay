"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, CreditCard, Dessert as Passport } from "lucide-react"
import type { IDType } from "@/hooks/account-verification/useVerification"

const ID_TYPES = [
  { value: "drivers-license", label: "Driver's License", icon: CreditCard },
  { value: "passport", label: "Passport", icon: Passport },
  { value: "national-id", label: "National ID", icon: FileText },
  { value: "state-id", label: "State ID", icon: CreditCard },
] as const

interface IDTypeSelectorProps {
  selectedIdType: IDType | ""
  onSelectIdType: (value: IDType) => void
}

export const IDTypeSelector = ({ selectedIdType, onSelectIdType }: IDTypeSelectorProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Step 1: Select ID Type
        </CardTitle>
        <CardDescription>Choose the type of identification document you'll be uploading</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedIdType} onValueChange={(value: IDType) => onSelectIdType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your ID type" />
          </SelectTrigger>
          <SelectContent>
            {ID_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

export { ID_TYPES }
