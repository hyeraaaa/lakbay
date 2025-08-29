import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const BackToLogin: React.FC = () => {
  return (
    <div className="text-center">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </div>
  );
};

export default BackToLogin; 