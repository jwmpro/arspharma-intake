"use client";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";

export default function SexSelectScreen() {
  const { nextStep } = useForm();

  const handleSelect = () => {
    nextStep();
  };

  return (
    <ScreenWrapper title="Biological Sex">
      <div className="space-y-3">
        <button
          onClick={handleSelect}
          className="w-full text-center p-5 bg-white border-2 border-neffy-100 rounded-xl hover:border-neffy-400 hover:bg-neffy-50/50 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md group"
        >
          <span className="text-lg font-semibold text-gray-800 group-hover:text-neffy-700 transition-colors">
            Male
          </span>
        </button>
        <button
          onClick={handleSelect}
          className="w-full text-center p-5 bg-white border-2 border-neffy-100 rounded-xl hover:border-neffy-400 hover:bg-neffy-50/50 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md group"
        >
          <span className="text-lg font-semibold text-gray-800 group-hover:text-neffy-700 transition-colors">
            Female
          </span>
        </button>
      </div>
    </ScreenWrapper>
  );
}
