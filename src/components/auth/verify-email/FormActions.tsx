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
      className="w-full h-9 text-base font-medium"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Sending verification email...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          Send verification email
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </Button>
  );
};

export default FormActions; 