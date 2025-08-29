import React from "react";
import Image from "next/image";

interface FormHeaderProps {
  title: string;
  subtitle?: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <div className="flex justify-center mb-4 sm:mb-6">
        <Image
          src="/logo.png"
          alt="Lakbay Logo"
          width={80}
          height={80}
          className="w-16 h-16 sm:w-20 sm:h-20"
        />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default FormHeader; 