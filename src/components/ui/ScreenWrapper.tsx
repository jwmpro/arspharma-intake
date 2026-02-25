"use client";
import React from "react";
import { useForm } from "@/context/FormContext";
import ProgressBar from "./ProgressBar";

interface ScreenWrapperProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showProgress?: boolean;
  children: React.ReactNode;
}

export default function ScreenWrapper({
  title,
  subtitle,
  showBack = true,
  showProgress = true,
  children,
}: ScreenWrapperProps) {
  const { prevStep, currentStep } = useForm();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-neffy-50/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-neffy-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {showBack && currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neffy-50 transition-colors text-neffy-600"
                  aria-label="Go back"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {/* Logo */}
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-orange-500">neffy®</span>
              </div>
            </div>
          </div>
          {showProgress && <ProgressBar />}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 animate-fadeIn overflow-visible">
        {title && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neffy-100 bg-white/80">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-neffy-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5C17.944 5.328 18 5.661 18 6v6c0 3.243-1.71 5.948-4.243 7.547a12.1 12.1 0 01-3.757 1.91 12.1 12.1 0 01-3.757-1.91C3.71 17.948 2 15.243 2 12V6c0-.339.056-.672.166-1.001z"
                clipRule="evenodd"
              />
            </svg>
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex gap-3">
            <a href="https://customerconsents.s3.amazonaws.com/Beluga_Health_PA_Privacy_Policy.pdf" target="_blank" rel="noopener" className="hover:text-neffy-500 transition-colors">
              Privacy Policy
            </a>
            <a href="https://customerconsents.s3.amazonaws.com/Beluga_Health_Telemedicine_Informed_Consent.pdf" target="_blank" rel="noopener" className="hover:text-neffy-500 transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
