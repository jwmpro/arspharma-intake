"use client";
import { useState } from "react";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";
import { ScreenConfig } from "@/config/screens";

interface Props {
  screen: ScreenConfig;
}

export default function TextareaScreen({ screen }: Props) {
  const { nextStep, setField, setAnswer } = useForm();
  const [value, setValue] = useState("");

  const handleContinue = () => {
    const finalValue = value.trim() || (screen.placeholder || "");

    // Map to direct formObj fields if specified
    if (screen.formField) {
      setField(screen.formField as keyof import("@/context/FormContext").FormData, finalValue);
    }
    // Also store as Q/A if questionKey exists
    if (screen.questionKey) {
      setAnswer(screen.id, screen.questionKey, finalValue);
    }

    nextStep();
  };

  return (
    <ScreenWrapper title={screen.title} subtitle={screen.subtitle}>
      <div className="space-y-6">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={screen.placeholder || ""}
          rows={4}
          className="w-full px-4 py-3 text-lg border-2 border-neffy-200 rounded-xl focus:border-neffy-500 focus:ring-2 focus:ring-neffy-200 outline-none transition-all bg-white resize-none placeholder-gray-400"
        />
        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </ScreenWrapper>
  );
}
