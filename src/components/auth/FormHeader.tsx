import React from "react";
import Image from "next/image";

interface FormHeaderProps {
  title: string;
  subtitle?: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-4 sm:mb-6 md:mb-8">
      <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
        <Image
          src="/logo.png"
          alt="Lakbay Logo"
          width={80}
          height={80}
          className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
        />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default FormHeader; 