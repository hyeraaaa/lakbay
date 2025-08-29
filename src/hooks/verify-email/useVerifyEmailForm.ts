import { useState, useEffect } from "react";
import { authService, VerifyEmailData } from "@/services/authServices";

interface VerifyEmailFormData {
  email: string;
}

export const useVerifyEmailForm = () => {
  const [formData, setFormData] = useState<VerifyEmailFormData>({ email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Clean up timer interval
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationError) setValidationError("");
    if (apiError) setApiError("");
  };

  const validateEmail = () => {
    if (!formData.email) {
      setValidationError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setValidationError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const startResendTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    setResendTimer(60);

    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerInterval(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    setValidationError("");
    setApiError("");

    try {
      const { ok, data } = await authService.verifyEmail({ email: formData.email });

      if (!ok) throw new Error(data.message || "Failed to send verification email");

      console.log("Verification email requested for:", formData.email);
      setIsSubmitted(true);
      startResendTimer();
    } catch (error) {
      console.error("Verification email failed", error);
      setApiError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    setApiError("");

    try {
      const { ok, data } = await authService.verifyEmail({ email: formData.email });

      if (!ok) throw new Error(data.message || "Failed to resend verification email");

      console.log("Verification email resent for:", formData.email);
      startResendTimer();
    } catch (error) {
      console.error("Resend failed", error);
      setApiError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({ email: "" });
    setValidationError("");
    setApiError("");
  };

  return {
    formData,
    isLoading,
    isSubmitted,
    validationError,
    apiError,
    resendTimer,
    isResending,
    handleInputChange,
    handleSubmit,
    handleResend,
    resetForm,
  };
};
