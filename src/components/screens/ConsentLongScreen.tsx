"use client";
import { useState, useRef } from "react";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";

const consentText = `Treatment Consent and Acknowledgment

This document serves as my informed consent for telemedicine consultation and treatment related to anaphylaxis emergency preparedness, specifically regarding the prescription and use of neffy (epinephrine nasal spray).

I acknowledge that I have received information about:
- The nature and purpose of the treatment
- Potential risks and benefits of neffy nasal spray
- Alternative treatment options available
- My right to ask questions before proceeding

I understand that:
- This is a telemedicine consultation and not an in-person examination
- The healthcare provider will make recommendations based on information I provide
- I am responsible for providing accurate and complete medical information
- I will follow all instructions provided by the healthcare provider
- I should seek emergency medical care if I experience a serious allergic reaction

I consent to proceed with this telemedicine consultation and, if appropriate, receive a prescription for neffy.`;

export default function ConsentLongScreen() {
  const { nextStep, setDisqualified } = useForm();
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolled(true);
    }
  };

  return (
    <ScreenWrapper title="Treatment Consent">
      <div className="space-y-6">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-80 overflow-y-auto p-5 bg-white border-2 border-neffy-100 rounded-xl text-gray-700 leading-relaxed whitespace-pre-line scroll-smooth text-sm"
        >
          {consentText}
        </div>

        {!hasScrolled && (
          <p className="text-sm text-gray-400 text-center animate-pulse">
            Scroll down to continue
          </p>
        )}

        <div className="space-y-3">
          <Button onClick={nextStep} disabled={!hasScrolled}>
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
