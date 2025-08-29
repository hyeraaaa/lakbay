import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const BackToLogin: React.FC = () => {
  return (
    <div className="text-center">
      <Link
        href="/login"
        className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 inline mr-1" />
        Back to sign in
      </Link>
    </div>
  );
};

export default BackToLogin; 