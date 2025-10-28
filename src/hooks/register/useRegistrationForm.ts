// hooks/useRegistrationForm.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/auth/useAuth";
import { authService, RegistrationData } from "@/services/authServices";

export const useRegistrationForm = () => {
  const router = useRouter();
  const { googleLogin, authError, isProcessing } = useAuth();
  const [formData, setFormData] = useState<RegistrationData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    address_line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [serverError, setServerError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle phone number specially - add +63 prefix and limit to 10 digits
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, "");
      const limitedDigits = digitsOnly.slice(0, 10);
      const fullWithCountry = limitedDigits ? `+63${limitedDigits}` : "";
      setFormData(prev => ({ ...prev, [name]: fullWithCountry }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.address_line1) newErrors.address_line1 = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.postal_code) newErrors.postal_code = "Postal code is required";
    if (!formData.country) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError("");

    try {
      const { ok, data, message } = await authService.register(formData);

      if (!ok) {
        if (data.errors && typeof data.errors === "object") {
          const serverErrors: { [key: string]: string } = {};
          Object.keys(data.errors).forEach(key => {
            serverErrors[key] = Array.isArray(data.errors[key])
              ? data.errors[key][0]
              : data.errors[key];
          });
          setErrors(serverErrors);
        } else {
          setServerError(message || data.message || "Registration failed. Please try again.");
        }
        return;
      }

      setIsSuccess(true);
      console.log("Registration successful", data);

    } catch (error) {
      console.error("Registration failed", error);
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  // Google Login Handler
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then(res => res.json());

        console.log("Google registration successful", userInfo);
        
        // Use the auth hook for Google login
        const result = await googleLogin(response.access_token, userInfo);
        
        if (result?.isNewUser) {
          console.log('Welcome! Your account has been created automatically.');
          // You could show a toast notification here
        }
        
      } catch (error) {
        console.error("Google registration failed", error);
        // Error handling is done in the auth hook
      }
    },
    onError: (error) => {
      console.error("Google registration error:", error);
      // Error handling is done in the auth hook
    }
  });

  const handleGoogleLogin = () => {
    googleLoginHandler();
  };

  const clearSuccess = () => {
    setIsSuccess(false);
    // Redirect to login page after success alert closes
    router.push('/login');
  };

  return {
    formData,
    showPassword,
    isLoading: isLoading || isProcessing,
    isGoogleLoading: false,
    errors,
    serverError: serverError || authError,
    isSuccess,
    handleInputChange,
    handleSubmit,
    togglePassword,
    handleGoogleLogin,
    clearSuccess,
  };
};
