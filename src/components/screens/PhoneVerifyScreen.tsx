"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";

// ⚠️  Flip to false to re-enable phone verification
const SKIP_PHONE_VERIFICATION = true;

type Step = "info" | "success";

/** Collects name + phone (simplified for US form) */
function SkipPhoneVerification() {
  const { nextStep, setField, data } = useForm();
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const formatPhone = (raw: string) => raw.replace(/\D/g, "").slice(0, 10);

  const validatePhone = () => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
  };

  const handleContinue = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!validatePhone()) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    const fullPhone = `+1${digits}`;

    setField("firstName", firstName.trim());
    setField("lastName", lastName.trim());
    setField("phone", fullPhone);
    setField("phoneVerified", true);
    nextStep();
  };

  const inputClass =
    "w-full px-4 py-3 text-lg border-2 border-neffy-200 rounded-xl focus:border-neffy-500 focus:ring-2 focus:ring-neffy-200 outline-none transition-all bg-white";

  return (
    <ScreenWrapper title="Phone Verification">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setError(""); }}
            className={inputClass}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setError(""); }}
            className={inputClass}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Phone Number
          </label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-3 bg-neffy-50 border-2 border-neffy-200 rounded-xl text-gray-600 font-medium shrink-0">
              <span>🇺🇸</span>
              <span>+1</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }}
              placeholder="555-123-4567"
              className={inputClass}
              dir="ltr"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <Button onClick={handleContinue} disabled={!firstName || !lastName || !phone}>
          Continue
        </Button>
      </div>
    </ScreenWrapper>
  );
}

export default function PhoneVerifyScreen() {
  if (SKIP_PHONE_VERIFICATION) return <SkipPhoneVerification />;

  return <SkipPhoneVerification />;
}
