"use client";
import { useForm } from "@/context/FormContext";
import Button from "@/components/ui/Button";

export default function LandingScreen() {
  const { nextStep } = useForm();

  const steps = [
    { label: "Complete a short questionnaire", icon: "📋" },
    { label: "A provider reviews your details", icon: "👨‍⚕️" },
    { label: "Get neffy delivered to you", icon: "📦" },
  ];

  const badges = [
    { label: "Board-Certified Providers", icon: "👨‍⚕️" },
    { label: "Free Shipping", icon: "📦" },
    { label: "Needle-Free", icon: "💊" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neffy-50 via-white to-neffy-50/50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-5 pt-5 pb-2">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-neffy-500">neffy®</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 max-w-lg mx-auto w-full">
        {/* Hero Section */}
        <div className="w-full mt-6 mb-6 text-center">
          <div className="mx-auto w-24 h-24 mb-5 flex items-center justify-center text-4xl">
            💉
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
            neffy® Intake Questionnaire
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-sm mx-auto">
            The only needle-free epinephrine nasal spray for emergency treatment of anaphylaxis
          </p>
        </div>

        {/* How it works */}
        <div className="w-full bg-white rounded-2xl border border-neffy-100 p-5 mb-6 shadow-sm">
          <h2 className="text-sm font-bold text-neffy-600 uppercase tracking-wider mb-4 text-center">
            How It Works
          </h2>
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neffy-50 rounded-xl flex items-center justify-center text-xl shrink-0 border border-neffy-100">
                  {step.icon}
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="w-full mb-6">
          <Button onClick={nextStep} size="lg" className="shadow-lg hover:shadow-xl">
            Start Questionnaire
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex gap-3 mb-8 w-full">
          {badges.map((b) => (
            <div
              key={b.label}
              className="flex flex-col items-center gap-1.5 flex-1 p-3 bg-white rounded-xl border border-neffy-50 shadow-sm"
            >
              <span className="text-xl">{b.icon}</span>
              <span className="text-[11px] text-gray-500 font-medium text-center leading-tight">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      <footer className="px-5 py-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 border-t border-neffy-50">
        <svg className="w-4 h-4 text-neffy-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5C17.944 5.328 18 5.661 18 6v6c0 3.243-1.71 5.948-4.243 7.547a12.1 12.1 0 01-3.757 1.91 12.1 12.1 0 01-3.757-1.91C3.71 17.948 2 15.243 2 12V6c0-.339.056-.672.166-1.001z"
            clipRule="evenodd"
          />
        </svg>
        <span>HIPAA Compliant</span>
      </footer>
    </div>
  );
}
