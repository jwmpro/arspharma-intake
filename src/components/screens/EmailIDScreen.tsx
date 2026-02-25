"use client";
import { useState } from "react";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";

export default function EmailIDScreen() {
  const { nextStep, setField, data } = useForm();
  const [email, setEmail] = useState(data.email);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validate()) return;
    setField("email", email.trim());
    nextStep();
  };

  const inputClass =
    "w-full px-4 py-3 text-lg border-2 border-neffy-200 rounded-xl focus:border-neffy-500 focus:ring-2 focus:ring-neffy-200 outline-none transition-all bg-white";

  return (
    <ScreenWrapper title="Email Address">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="name@email.com"
            className={inputClass}
            dir="ltr"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <Button onClick={handleContinue} disabled={!email}>
          Continue
        </Button>
      </div>
    </ScreenWrapper>
  );
}
