"use client";

import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";

interface AnimatedAlertProps {
  message: string;
  variant?: "destructive" | "default";
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  autoClose?: boolean;
  autoCloseDelay?: number;
  onClose?: () => void;
  className?: string;
}

const AnimatedAlert: React.FC<AnimatedAlertProps> = ({
  message,
  variant = "destructive",
  position = "bottom-right",
  autoClose = true,
  autoCloseDelay = 2500,
  onClose,
  className = "",
}) => {
  const [showAlert, setShowAlert] = useState(true);

  // Auto-close timer
  useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        setShowAlert(false);
        // Delay onClose to allow transition to complete
        setTimeout(() => {
          onClose?.();
        }, 300); // Match the transition duration
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [message, autoClose, autoCloseDelay, onClose]);

  // Reset alert state when message changes
  useEffect(() => {
    if (message) {
      setShowAlert(true);
    }
  }, [message]);

  const handleCloseAlert = () => {
    setShowAlert(false);
    // Delay onClose to allow transition to complete
    setTimeout(() => {
      onClose?.();
    }, 300); // Match the transition duration
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
      default:
        return "bottom-4 right-4";
    }
  };

  const getSlideDirection = () => {
    switch (position) {
      case "top-right":
        return "slide-in-from-top";
      case "top-left":
        return "slide-in-from-top";
      case "bottom-left":
        return "slide-in-from-left";
      case "bottom-right":
      default:
        return "slide-in-from-right";
    }
  };

  if (!message) return null;

  const isDestructive = variant === "destructive";
  const alertColorClass = isDestructive
    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
    : "border-green-500 bg-green-50 dark:bg-green-900/20";
  const iconColorClass = isDestructive
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
  const descColorClass = isDestructive
    ? "text-red-700 dark:text-red-300"
    : "text-green-700 dark:text-green-300";
  const closeHoverClass = isDestructive
    ? "hover:bg-red-100 dark:hover:bg-red-800/30"
    : "hover:bg-green-100 dark:hover:bg-green-800/30";
  const closeIconClass = iconColorClass;

  return (
    <div className={`fixed z-50 max-w-md animate-in ${getSlideDirection()} duration-500 ${getPositionClasses()}`}>
      <Alert 
        variant={variant}
        className={`${alertColorClass} p-6 shadow-lg !grid-cols-1 !w-full transition-all duration-300 ease-in-out ${
          showAlert 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-2 pointer-events-none'
        } ${className}`}
      >
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start space-x-3 flex-1">
            <AlertCircle className={`h-5 w-5 ${iconColorClass} mt-0.5 flex-shrink-0`} />
            <AlertDescription className={`${descColorClass} text-base leading-relaxed !col-start-1`}>
              {message}
            </AlertDescription>
          </div>
          <button
            onClick={handleCloseAlert}
            className={`ml-4 p-1 rounded-full ${closeHoverClass} transition-colors duration-200 flex-shrink-0`}
            aria-label="Close alert"
          >
            <X className={`h-4 w-4 ${closeIconClass}`} />
          </button>
        </div>
      </Alert>
    </div>
  );
};

export default AnimatedAlert; 