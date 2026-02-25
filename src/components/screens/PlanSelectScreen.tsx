"use client";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";
import { CONSULTATION_FEE, SHIPPING_FEE } from "@/config/medications";

export default function PlanSelectScreen() {
  const { nextStep, setField } = useForm();

  const drugPrice = 199;
  const consultationFee = CONSULTATION_FEE;
  const shippingFee = SHIPPING_FEE;
  const total = drugPrice + consultationFee + shippingFee;

  const handleContinue = () => {
    setField("selectedPlanId", "neffy_single");
    nextStep();
  };

  return (
    <ScreenWrapper title="Order Summary">
      <div className="bg-white rounded-2xl border-2 border-neffy-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-neffy-500 mb-4 uppercase tracking-wide">
          neffy® Twin Pack (2 devices)
        </h2>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-gray-700">
            <span className="text-sm">neffy® (epinephrine nasal spray) 2mg × 2</span>
            <span className="font-semibold">${drugPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span className="text-sm">Provider consultation fee</span>
            <span className="font-semibold">${consultationFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span className="text-sm">Shipping</span>
            <span className="font-semibold text-green-600">FREE</span>
          </div>
        </div>

        <hr className="border-neffy-200 my-4" />

        <div className="flex justify-between text-lg">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-2xl text-neffy-500">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <Button onClick={handleContinue} size="lg">
        Continue to Checkout
      </Button>
    </ScreenWrapper>
  );
}
