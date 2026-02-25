"use client";
import { useState } from "react";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";

export default function ConsentScreen() {
  const { nextStep, setField } = useForm();
  const [checked, setChecked] = useState(false);

  const handleAgree = () => {
    setField("consentsSigned", true);
    nextStep();
  };

  return (
    <ScreenWrapper title="Terms & Privacy">
      <div className="space-y-6">
        <p className="text-gray-600 text-lg leading-relaxed">
          By using this service, you agree to our Terms and Privacy Policy. We are committed to protecting your personal health information and using it only as described.
        </p>

        <label className="flex items-start gap-3 p-4 bg-neffy-50/50 rounded-xl border border-neffy-100 cursor-pointer hover:bg-neffy-50 transition-colors">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-neffy-300 text-neffy-500 focus:ring-neffy-400"
          />
          <span className="text-gray-700 leading-relaxed">
            I acknowledge that I have read and agree to the Privacy Policy and Terms of Use.
          </span>
        </label>

        <div className="flex gap-3 text-sm">
          <a
            href="https://customerconsents.s3.amazonaws.com/Beluga_Health_PA_Privacy_Policy.pdf"
            target="_blank"
            rel="noopener"
            className="text-neffy-500 underline hover:text-neffy-600"
          >
            Privacy Policy
          </a>
          <a
            href="https://customerconsents.s3.amazonaws.com/Beluga_Health_Telemedicine_Informed_Consent.pdf"
            target="_blank"
            rel="noopener"
            className="text-neffy-500 underline hover:text-neffy-600"
          >
            Terms of Use
          </a>
        </div>

        <Button onClick={handleAgree} disabled={!checked}>
          Continue
        </Button>
      </div>
    </ScreenWrapper>
  );
}
