// hooks/useForgotPasswordForm.ts
import { useState, useEffect } from "react";
import { authService } from "@/services/authServices";

interface ForgotPasswordFormData {
  email: string;
}

export const useForgotPasswordForm = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateEmail = () => {
    if (!formData.email) {
      setError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email");
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
    setError("");

    try {
      const { ok, data } = await authService.forgotPassword({ email: formData.email }); // ✅ pass object

      if (!ok) {
        throw new Error(data.message || "Password reset request failed");
      }

      console.log("Password reset requested for:", formData.email);
      setIsSubmitted(true);
      startResendTimer();

    } catch (err) {
      console.error("Password reset failed", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    setError("");

    try {
      const { ok, data } = await authService.forgotPassword({ email: formData.email }); 

      if (!ok) {
        throw new Error(data.message || "Resend failed");
      }

      console.log("Password reset link resent for:", formData.email);
      startResendTimer();

    } catch (err) {
      console.error("Resend failed", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({ email: "" });
    setError("");
  };

  return {
    formData,
    isLoading,
    isSubmitted,
    error,
    resendTimer,
    isResending,
    handleInputChange,
    handleSubmit,
    handleResend,
    resetForm,
  };
};
