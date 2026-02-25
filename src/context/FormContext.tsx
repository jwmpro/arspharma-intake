"use client";
import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { SCREENS, ShowIfCondition, ShowIfRule } from "@/config/screens";

const STORAGE_KEY = "neffy_form_data";
const STORAGE_STEP_KEY = "neffy_form_step";
const CHECKOUT_STEP = SCREENS.findIndex((s) => s.type === "checkout");

function isStripeRedirect(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return !!(params.get("payment_intent") && params.get("payment_intent_client_secret"));
}

function readCookieFormData(): FormData | null {
  if (typeof window === "undefined") return null;
  try {
    const match = document.cookie.match(/(?:^|;\s*)neffy_checkout_data=([^;]+)/);
    if (!match) return null;
    const json = decodeURIComponent(escape(atob(match[1])));
    const parsed = JSON.parse(json);
    if (!parsed?.formData || typeof parsed.formData !== "object") return null;
    return { ...initialFormData, ...parsed.formData } as FormData;
  } catch {
    return null;
  }
}

function loadPersistedState(): { data: FormData; step: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const step = sessionStorage.getItem(STORAGE_STEP_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as FormData;
    return { data, step: step ? parseInt(step, 10) : 0 };
  } catch {
    return null;
  }
}

function persistState(data: FormData, step: number) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem(STORAGE_STEP_KEY, String(step));
  } catch {}
}

export interface FormData {
  // Personal
  firstName: string;
  lastName: string;
  dob: string; // MM/DD/YYYY
  phone: string;
  email: string;
  idNumber: string;

  // Address
  address: string;
  city: string;
  state: string;
  zip: string;

  // Medical (direct fields)
  selfReportedMeds: string;
  allergies: string;
  medicalConditions: string;

  // Questionnaire answers (Q/A pairs)
  answers: Record<string, string>;

  // Neffy-specific selections
  conditionsChecklist: string[];
  allergenTypes: string[];
  selectedPlanId: string;

  // Verification
  phoneVerified: boolean;
  consentsSigned: boolean;

  // Payment
  paymentIntentId: string;
  paymentComplete: boolean;

  // Discount
  discountCode: string;
  discountAmount: number;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  dob: "",
  phone: "",
  email: "",
  idNumber: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  selfReportedMeds: "",
  allergies: "",
  medicalConditions: "",
  answers: {},
  conditionsChecklist: [],
  allergenTypes: [],
  selectedPlanId: "",
  phoneVerified: false,
  consentsSigned: false,
  paymentIntentId: "",
  paymentComplete: false,
  discountCode: "",
  discountAmount: 0,
};

interface FormContextType {
  data: FormData;
  currentStep: number;
  totalSteps: number;
  visibleStepIndex: number;
  visibleStepCount: number;
  disqualified: boolean;
  setField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  setAnswer: (screenId: string, questionKey: string, answer: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setDisqualified: (value: boolean) => void;
}

const FormContext = createContext<FormContextType | null>(null);

// Evaluate a single showIf condition
function checkCondition(condition: ShowIfCondition, answers: Record<string, string>): boolean {
  const parentAnswer = answers[condition.screenId];
  if (condition.equals !== undefined) {
    return parentAnswer === condition.equals;
  }
  if (condition.notEquals !== undefined) {
    return parentAnswer !== condition.notEquals;
  }
  return true;
}

// Check screen visibility — supports single condition or AND array
function isScreenVisible(index: number, answers: Record<string, string>): boolean {
  const screen = SCREENS[index];
  if (!screen?.showIf) return true;

  const rule: ShowIfRule = screen.showIf;

  // Array = AND logic: all conditions must be true
  if (Array.isArray(rule)) {
    return rule.every((cond) => checkCondition(cond, answers));
  }

  // Single condition
  return checkCondition(rule, answers);
}

export function FormProvider({ children, totalSteps }: { children: ReactNode; totalSteps: number }) {
  const [data, setData] = useState<FormData>(() => {
    const persisted = loadPersistedState();
    if (persisted) return persisted.data;
    if (isStripeRedirect()) {
      const cookie = readCookieFormData();
      if (cookie) return cookie;
    }
    return initialFormData;
  });

  const [currentStep, setCurrentStep] = useState(() => {
    const persisted = loadPersistedState();
    if (persisted) return persisted.step;
    if (isStripeRedirect() && CHECKOUT_STEP >= 0) return CHECKOUT_STEP;
    return 0;
  });

  const [disqualified, setDisqualified] = useState(false);

  useEffect(() => {
    persistState(data, currentStep);
  }, [data, currentStep]);

  const dataRef = useRef(data);
  dataRef.current = data;

  const setField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setAnswer = useCallback((screenId: string, questionKey: string, answer: string) => {
    dataRef.current = {
      ...dataRef.current,
      answers: { ...dataRef.current.answers, [screenId]: answer },
    };
    setData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [screenId]: answer },
    }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      let next = prev + 1;
      while (next < totalSteps && !isScreenVisible(next, dataRef.current.answers)) {
        next++;
      }
      return Math.min(next, totalSteps - 1);
    });
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      let next = prev - 1;
      while (next > 0 && !isScreenVisible(next, dataRef.current.answers)) {
        next--;
      }
      return Math.max(next, 0);
    });
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
  }, [totalSteps]);

  const visibleStepCount = SCREENS.filter((_, i) => isScreenVisible(i, data.answers)).length;
  const visibleStepIndex = SCREENS.slice(0, currentStep + 1)
    .filter((_, i) => isScreenVisible(i, data.answers)).length - 1;

  return (
    <FormContext.Provider
      value={{
        data, currentStep, totalSteps,
        visibleStepIndex, visibleStepCount, disqualified,
        setField, setAnswer, nextStep, prevStep, goToStep, setDisqualified,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useForm(): FormContextType {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useForm must be used within FormProvider");
  return ctx;
}
