"use client";
import { useForm } from "@/context/FormContext";

export default function ProgressBar() {
  const { visibleStepIndex, visibleStepCount } = useForm();
  const progress = visibleStepCount > 1
    ? (visibleStepIndex / (visibleStepCount - 1)) * 100
    : 0;

  return (
    <div className="w-full h-2 bg-neffy-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-neffy-500 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
