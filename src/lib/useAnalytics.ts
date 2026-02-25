"use client";

import { useEffect, useRef } from "react";
import { useForm } from "@/context/FormContext";
import { SCREENS } from "@/config/screens";
import * as analytics from "./analytics";

export function useAnalytics() {
  const { currentStep, data } = useForm();
  const prevStepRef = useRef<number>(-1);
  const initRef = useRef(false);

  // Initialize session on mount + register unload listeners
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    analytics.initSession("en");

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        analytics.sendBeacon();
      }
    };
    const handleBeforeUnload = () => {
      analytics.sendBeacon();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track screen transitions
  useEffect(() => {
    if (currentStep === prevStepRef.current) return;

    const screen = SCREENS[currentStep];
    if (!screen) return;

    // Leave previous screen
    if (prevStepRef.current >= 0) {
      const prevScreen = SCREENS[prevStepRef.current];
      if (prevScreen) {
        analytics.trackScreenLeave(prevScreen.id);
      }
    }

    // Enter new screen
    analytics.trackScreenEnter(screen.id);
    prevStepRef.current = currentStep;

    // Send current state
    analytics.sendBeacon();
  }, [currentStep]);

  // Mark completed when payment succeeds
  useEffect(() => {
    if (data.paymentComplete) {
      analytics.markCompleted();
      analytics.sendBeacon();
    }
  }, [data.paymentComplete]);
}
