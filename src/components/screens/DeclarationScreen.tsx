"use client";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";
import { SCREENS } from "@/config/screens";

interface Props {
  screen: { id: string };
}

export default function DeclarationScreen({ screen }: Props) {
  const { nextStep, setDisqualified } = useForm();

  // Determine which declaration to show based on screen ID
  const isPharmacistWaiver = screen.id === "pharmacist-waiver";

  const title = isPharmacistWaiver ? "Pharmacist Counseling Waiver" : "Declaration of Truthfulness";

  const content = isPharmacistWaiver
    ? "I acknowledge that I am choosing to waive my right to pharmacist counseling at this time. I understand that if I have any questions now or in the future, I may contact Patient Support to request a counseling session with a licensed pharmacist or healthcare provider."
    : "I declare that all information provided in this questionnaire is true and accurate to the best of my knowledge. I understand that providing false information may affect my safety and the quality of care I receive.";

  return (
    <ScreenWrapper title={title}>
      <div className="space-y-6">
        <div className="p-5 bg-neffy-50/50 rounded-xl border border-neffy-100">
          <p className="text-gray-700 leading-relaxed text-lg">
            {content}
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={nextStep}>
            I Agree
          </Button>
          <Button variant="danger" onClick={() => setDisqualified(true)}>
            I Decline
          </Button>
        </div>
      </div>
    </ScreenWrapper>
  );
}
