import { Check } from "lucide-react"

interface VerificationProgressProps {
  getStepStatus: (step: number) => "complete" | "current" | "pending"
}

export const VerificationProgress = ({ getStepStatus }: VerificationProgressProps) => {
  const steps = [
    { number: 1, title: "Select ID Type" },
    { number: 2, title: "Capture Front" },
    { number: 3, title: "Capture Back" },
  ]

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const status = getStepStatus(step.number)
        return (
          <div key={step.number} className="flex items-center">
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${
                  status === "complete"
                    ? "bg-primary text-primary-foreground"
                    : status === "current"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                }
              `}
            >
              {status === "complete" ? <Check className="h-4 w-4" /> : step.number}
            </div>
            <span className={`ml-2 text-sm ${status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
              {step.title}
            </span>
            {index < 2 && <div className="w-8 h-px bg-border mx-4" />}
          </div>
        )
      })}
    </div>
  )
}
