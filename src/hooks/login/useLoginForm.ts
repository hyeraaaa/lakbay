import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/auth/useAuth";

interface FormData {
  email: string;
  password: string;
}

export const useLoginForm = () => {
  const { login, googleLogin, authError, isProcessing } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await login(formData);
      
      if (!result.success) {
        // Handle login errors
        if (result.error) {
          // The error is already set in the auth context
          return;
        }
      }
      
      // Login successful - redirect is handled by the auth hook
      console.log("Login successful", result.user);
      
    } catch (error) {
      console.error("Login failed", error);
      // Error handling is done in the auth hook
    }
  };

  // Google Login Handler
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then(res => res.json());

        console.log("Google login successful", userInfo);
        
        // Use the auth hook for Google login
        const result = await googleLogin(response.access_token, userInfo);
        
        if (result?.isNewUser) {
          console.log('Welcome! Your account has been created automatically.');
          // You could show a toast notification here
        }
        
      } catch (error) {
        console.error("Google login failed", error);
        // Error handling is done in the auth hook
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      // Error handling is done in the auth hook
    }
  });

  const handleGoogleLogin = () => {
    googleLoginHandler();
  };

  // No UI-based resend flow; handled automatically in useAuth

  return {
    formData,
    showPassword,
    isLoading: isProcessing,
    isGoogleLoading: false, 
    errors,
    serverError: authError,
    handleInputChange,
    togglePassword,
    handleSubmit,
    handleGoogleLogin,
  };
}; 