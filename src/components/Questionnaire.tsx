"use client";
import { useForm } from "@/context/FormContext";
import { SCREENS } from "@/config/screens";
import { useAnalytics } from "@/lib/useAnalytics";

// Screen components
import LandingScreen from "./screens/LandingScreen";
import ConsentScreen from "./screens/ConsentScreen";
import DOBScreen from "./screens/DOBScreen";
import SingleSelectScreen from "./screens/SingleSelectScreen";
import MultiSelectScreen from "./screens/MultiSelectScreen";
import TextareaScreen from "./screens/TextareaScreen";
import YesNoScreen from "./screens/YesNoScreen";
import DeclarationScreen from "./screens/DeclarationScreen";
import ConsentLongScreen from "./screens/ConsentLongScreen";
import PhoneVerifyScreen from "./screens/PhoneVerifyScreen";
import EmailIDScreen from "./screens/EmailIDScreen";
import ShippingScreen from "./screens/ShippingScreen";
import PlanSelectScreen from "./screens/PlanSelectScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import DisqualificationScreen from "./screens/DisqualificationScreen";

export default function Questionnaire() {
  const { currentStep, disqualified } = useForm();
  useAnalytics();

  if (disqualified) {
    return (
      <div className="animate-fadeIn">
        <DisqualificationScreen />
      </div>
    );
  }

  const screen = SCREENS[currentStep];

  if (!screen) return null;

  const renderScreen = () => {
    switch (screen.type) {
      case "landing":
        return <LandingScreen />;
      case "consent":
        return <ConsentScreen />;
      case "dob":
        return <DOBScreen />;
      case "single-select":
        return <SingleSelectScreen key={screen.id} screen={screen} />;
      case "multi-select":
        return <MultiSelectScreen key={screen.id} screen={screen} />;
      case "textarea":
        return <TextareaScreen key={screen.id} screen={screen} />;
      case "yes-no":
        return <YesNoScreen key={screen.id} screen={screen} />;
      case "declaration":
        return <DeclarationScreen key={screen.id} screen={screen} />;
      case "consent-long":
        return <ConsentLongScreen />;
      case "phone-verify":
        return <PhoneVerifyScreen />;
      case "email-id":
        return <EmailIDScreen />;
      case "shipping":
        return <ShippingScreen />;
      case "plan-select":
        return <PlanSelectScreen />;
      case "checkout":
        return <CheckoutScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fadeIn">
      {renderScreen()}
    </div>
  );
}
