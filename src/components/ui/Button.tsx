"use client";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "lg",
  fullWidth = true,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neffy-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";

  const variants = {
    primary: "bg-neffy-500 text-white hover:bg-neffy-600 shadow-md hover:shadow-lg",
    secondary: "bg-neffy-100 text-neffy-700 hover:bg-neffy-200 shadow-sm",
    outline: "border-2 border-neffy-300 text-neffy-600 hover:bg-neffy-50 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
