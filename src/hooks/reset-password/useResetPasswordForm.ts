import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authServices";

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

export const useResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState<FormData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const toggleNewPassword = () => setShowNewPassword((prev) => !prev);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const validateForm = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      setServerError(
        "Invalid or missing reset token. Please request a new password reset."
      );
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      const { ok, data } = await authService.resetPassword(token, {
        newPassword: formData.newPassword,
      });

      if (!ok) throw new Error(data.message || "Failed to reset password");

      setIsSuccess(true);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToLogin = () => router.push("/login");

  return {
    formData,
    showNewPassword,
    showConfirmPassword,
    isLoading,
    errors,
    serverError,
    isSuccess,
    token,
    handleInputChange,
    toggleNewPassword,
    toggleConfirmPassword,
    handleSubmit,
    handleRedirectToLogin,
  };
};
