"use client";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";

export default function MedicationSelectScreen() {
  const { nextStep } = useForm();

  // This screen is not used in the Neffy form
  // Skip directly to next screen
  return (
    <ScreenWrapper title="Medication Selection">
      <div className="space-y-4">
        <p className="text-gray-600">This step is not used in the current flow.</p>
      </div>
    </ScreenWrapper>
  );
}
