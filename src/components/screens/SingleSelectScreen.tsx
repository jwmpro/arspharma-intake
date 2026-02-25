"use client";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { ScreenConfig } from "@/config/screens";

interface Props {
  screen: ScreenConfig;
}

export default function SingleSelectScreen({ screen }: Props) {
  const { nextStep, setAnswer } = useForm();

  const handleSelect = (value: string) => {
    if (screen.questionKey) {
      setAnswer(screen.id, screen.questionKey, value);
    }
    nextStep();
  };

  return (
    <ScreenWrapper title={screen.title} subtitle={screen.subtitle}>
      <div className="space-y-3">
        {screen.options?.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className="w-full text-center p-5 bg-white border-2 border-neffy-100 rounded-xl hover:border-neffy-400 hover:bg-neffy-50/50 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md group"
          >
            <span className="text-lg font-semibold text-gray-800 group-hover:text-neffy-700 transition-colors">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </ScreenWrapper>
  );
}
