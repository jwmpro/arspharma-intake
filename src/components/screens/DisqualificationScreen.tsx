"use client";

export default function DisqualificationScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🛑</span>
        </div>

        <div className="space-y-3">
          <p className="text-xl font-bold text-red-600">
            Not Eligible at This Time
          </p>
          <p className="text-gray-600 text-lg">
            Based on the information provided, you may not be eligible for neffy at this time. Please consult with your healthcare provider for alternatives.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="text-neffy-500 hover:text-neffy-600 text-sm underline transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
