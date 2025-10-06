import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FormActionsProps {
  isLoading: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ isLoading }) => {
  return (
    <Button
      type="submit"
      className="w-full h-9 sm:h-10 text-sm sm:text-base font-medium"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm">Signing in to Lakbay...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm">Sign in to Lakbay</span>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
      )}
    </Button>
  );
};

export default FormActions; 