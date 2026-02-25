"use client";
import { FormProvider } from "@/context/FormContext";
import Questionnaire from "@/components/Questionnaire";
import { SCREENS } from "@/config/screens";

export default function Home() {
  return (
    <FormProvider totalSteps={SCREENS.length}>
      <Questionnaire />
    </FormProvider>
  );
}
