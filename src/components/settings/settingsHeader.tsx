import { Settings } from "lucide-react"

interface SettingsHeaderProps {
  title?: string
  description?: string
}

export function SettingsHeader({
  title = "Settings",
  description = "Manage your account settings and preferences",
}: SettingsHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Settings className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
