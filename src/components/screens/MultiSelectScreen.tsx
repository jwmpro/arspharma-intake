"use client";
import { useState } from "react";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";
import { ScreenConfig } from "@/config/screens";

interface Props {
  screen: ScreenConfig;
}

export default function MultiSelectScreen({ screen }: Props) {
  const { nextStep, setAnswer, setField } = useForm();
  const [selected, setSelected] = useState<string[]>([]);

  const noneValue = "None of the above";

  const handleToggle = (value: string) => {
    setSelected((prev) => {
      // Mutual exclusion: "None of the above" vs everything else
      if (value === noneValue) {
        return prev.includes(noneValue) ? [] : [noneValue];
      }
      const without = prev.filter((v) => v !== noneValue && v !== value);
      if (prev.includes(value)) return without;
      return [...without, value];
    });
  };

  const handleContinue = () => {
    const answer = selected.join("; ");
    if (screen.questionKey) {
      setAnswer(screen.id, screen.questionKey, answer || noneValue);
    }
    // Also store in specific fields for building payload
    if (screen.id === "allergen-types") {
      setField("allergenTypes", selected);
    } else if (screen.id === "conditions-checklist") {
      setField("conditionsChecklist", selected);
    }
    nextStep();
  };

  return (
    <ScreenWrapper title={screen.title} subtitle={screen.subtitle}>
      <div className="space-y-3 mb-6">
        {screen.options?.map((opt) => {
          const isSelected = selected.includes(opt.value);
          const isNone = opt.value === noneValue;
          return (
            <button
              key={opt.value}
              onClick={() => handleToggle(opt.value)}
              className={`w-full text-start p-4 border-2 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm ${
                isSelected
                  ? "border-neffy-500 bg-neffy-50 shadow-md"
                  : "border-neffy-100 bg-white hover:border-neffy-300 hover:shadow-md"
              } ${isNone ? "mt-2" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected ? "bg-neffy-500 border-neffy-500" : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium ${isSelected ? "text-neffy-700" : "text-gray-800"}`}>
                  {opt.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <Button onClick={handleContinue} disabled={selected.length === 0}>
        Continue
      </Button>
    </ScreenWrapper>
  );
}
