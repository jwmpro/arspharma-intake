"use client";
import { useState } from "react";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";

export default function DOBScreen() {
  const { nextStep, setField } = useForm();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2010) {
      setError("Please enter a valid date");
      return false;
    }
    const dob = new Date(y, m - 1, d);
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 18) {
      setError("You must be at least 18 years old");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validate()) return;
    // API expects MM/DD/YYYY
    const dobStr = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
    setField("dob", dobStr);
    nextStep();
  };

  const inputClass =
    "w-full px-4 py-3 text-center text-lg font-medium border-2 border-neffy-200 rounded-xl focus:border-neffy-500 focus:ring-2 focus:ring-neffy-200 outline-none transition-all bg-white";

  return (
    <ScreenWrapper title="Date of Birth">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5 text-center">
              Day
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="DD"
              value={day}
              onChange={(e) => { setDay(e.target.value.replace(/\D/g, "")); setError(""); }}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5 text-center">
              Month
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="MM"
              value={month}
              onChange={(e) => { setMonth(e.target.value.replace(/\D/g, "")); setError(""); }}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5 text-center">
              Year
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="YYYY"
              value={year}
              onChange={(e) => { setYear(e.target.value.replace(/\D/g, "")); setError(""); }}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <Button onClick={handleContinue} disabled={!day || !month || !year}>
          Continue
        </Button>
      </div>
    </ScreenWrapper>
  );
}
