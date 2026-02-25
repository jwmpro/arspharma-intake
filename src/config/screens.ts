export type ScreenType =
  | "landing"
  | "consent"
  | "dob"
  | "single-select"
  | "multi-select"
  | "textarea"
  | "yes-no"
  | "declaration"
  | "consent-long"
  | "phone-verify"
  | "email-id"
  | "shipping"
  | "plan-select"
  | "checkout";

export interface ScreenOption {
  label: string;
  value: string;
}

export interface ShowIfCondition {
  screenId: string;
  equals?: string;
  notEquals?: string;
}

// Support AND logic: array means all conditions must be true
export type ShowIfRule = ShowIfCondition | ShowIfCondition[];

export interface ScreenConfig {
  id: string;
  type: ScreenType;
  title?: string;
  subtitle?: string;
  questionKey?: string;
  options?: ScreenOption[];
  placeholder?: string;
  formField?: string;
  showIf?: ShowIfRule;
}

// ──────────────────────────────────────────────────────────────
// Neffy Intake Form — ARS Pharma
// 3 paths: Anaphylaxis YES, Anaphylaxis NO, Naïve
// Total: ~35 screens, ~15 conditional
// ──────────────────────────────────────────────────────────────

export const SCREENS: ScreenConfig[] = [
  // ── 0. Landing ──
  { id: "landing", type: "landing" },

  // ── 1. Consent ──
  { id: "consent", type: "consent", title: "Terms & Privacy" },

  // ── 2. Date of birth ──
  { id: "dob", type: "dob", title: "Date of Birth" },

  // ══════════════════════════════════════════════════════════════
  // Q1: Anaphylaxis experience (primary branch point)
  // ══════════════════════════════════════════════════════════════
  {
    id: "anaphylaxis",
    type: "yes-no",
    title: "Have you experienced anaphylaxis?",
    subtitle: "Anaphylaxis is a severe, potentially life-threatening allergic reaction that can occur rapidly and affect multiple body systems. It is a medical emergency that happens when the body's immune system overreacts to an allergen, causing symptoms like trouble breathing, swelling, and a sudden drop in blood pressure.",
    questionKey: "Have you experienced anaphylaxis? POSSIBLE ANSWERS: Yes; No",
  },

  // ── YES PATH: Q1a — ER visit ──
  {
    id: "anaphylaxis-er",
    type: "yes-no",
    title: "Did the anaphylaxis require emergency room care or other medical treatment?",
    questionKey: "Did the anaphylaxis require emergency room care or other medical treatment? POSSIBLE ANSWERS: Yes; No",
    showIf: { screenId: "anaphylaxis", equals: "Yes" },
  },

  // ── YES PATH: Q1b — Epinephrine use ──
  {
    id: "anaphylaxis-epi-use",
    type: "yes-no",
    title: "Did you need to administer epinephrine (like an EpiPen) when you experienced anaphylaxis?",
    questionKey: "Did you need to administer epinephrine (like an EpiPen) when you experienced anaphylaxis? POSSIBLE ANSWERS: Yes; No",
    showIf: { screenId: "anaphylaxis", equals: "Yes" },
  },

  // ── YES PATH: Q1c — Side effects (if Q1b=Yes) ──
  {
    id: "epi-side-effects",
    type: "textarea",
    title: "Please describe any side effects you may have experienced from using epinephrine.",
    placeholder: "None",
    questionKey: "Please describe any side effects you may have experienced from using epinephrine.",
    showIf: [
      { screenId: "anaphylaxis", equals: "Yes" },
      { screenId: "anaphylaxis-epi-use", equals: "Yes" },
    ],
  },

  // ── YES PATH: Q1d — Know cause ──
  {
    id: "anaphylaxis-cause-known",
    type: "yes-no",
    title: "Do you know what caused the anaphylaxis?",
    questionKey: "Do you know what caused the anaphylaxis? POSSIBLE ANSWERS: Yes; No",
    showIf: { screenId: "anaphylaxis", equals: "Yes" },
  },

  // ── YES PATH: Q1e — Describe cause (if Q1d=Yes) ──
  {
    id: "anaphylaxis-cause-detail",
    type: "textarea",
    title: "Please provide what caused your anaphylaxis event.",
    placeholder: "None",
    questionKey: "Please provide what caused your anaphylaxis event.",
    showIf: [
      { screenId: "anaphylaxis", equals: "Yes" },
      { screenId: "anaphylaxis-cause-known", equals: "Yes" },
    ],
  },

  // ── NO PATH: Q1a — Allergic reaction symptoms ──
  {
    id: "allergic-symptoms",
    type: "multi-select",
    title: "Have you had an allergic reaction with any of the following symptoms?",
    subtitle: "Select all that apply.",
    questionKey: "Have you had an allergic reaction with any of the following symptoms? POSSIBLE ANSWERS: Swelling of the face, lips, tongue or throat; Itching and/or redness; Shortness of breath or difficulty breathing; Coughing, choking, or wheezing; Nausea, vomiting, diarrhea, or abdominal pain; Low blood pressure; Rapid heart rate; Dizziness, lightheadedness, or fainting; Anxiety or confusion; Seizure; Joint pain; None of the above",
    showIf: { screenId: "anaphylaxis", equals: "No" },
    options: [
      { label: "Swelling of the face, lips, tongue or throat", value: "Swelling of the face, lips, tongue or throat" },
      { label: "Itching and/or redness", value: "Itching and/or redness" },
      { label: "Shortness of breath or difficulty breathing", value: "Shortness of breath or difficulty breathing" },
      { label: "Coughing, choking, or wheezing", value: "Coughing, choking, or wheezing" },
      { label: "Nausea, vomiting, diarrhea, or abdominal pain", value: "Nausea, vomiting, diarrhea, or abdominal pain" },
      { label: "Low blood pressure", value: "Low blood pressure" },
      { label: "Rapid heart rate", value: "Rapid heart rate" },
      { label: "Dizziness, lightheadedness, or fainting", value: "Dizziness, lightheadedness, or fainting" },
      { label: "Anxiety or confusion", value: "Anxiety or confusion" },
      { label: "Seizure", value: "Seizure" },
      { label: "Joint pain", value: "Joint pain" },
      { label: "None of the above", value: "None of the above" },
    ],
  },

  // ── NO PATH: Q1b — Why seeking prescription ──
  {
    id: "why-seeking-rx",
    type: "single-select",
    title: "Why are you seeking a prescription for epinephrine?",
    questionKey: "Why are you seeking a prescription for epinephrine? POSSIBLE ANSWERS: I have an allergy that creates a potential for anaphylaxis; I have asthma; I have another reason for wanting to carry epinephrine",
    showIf: { screenId: "anaphylaxis", equals: "No" },
    options: [
      { label: "I have an allergy that creates a potential for anaphylaxis", value: "I have an allergy that creates a potential for anaphylaxis" },
      { label: "I have asthma", value: "I have asthma" },
      { label: "I have another reason for wanting to carry epinephrine", value: "I have another reason for wanting to carry epinephrine" },
    ],
  },

  // ── NO PATH: Q1c — Ever administered epinephrine ──
  {
    id: "ever-administered-epi",
    type: "yes-no",
    title: "Have you ever been administered epinephrine (e.g., EpiPen)?",
    questionKey: "Have you ever been administered epinephrine (e.g., EpiPen)? POSSIBLE ANSWERS: Yes; No",
    showIf: { screenId: "anaphylaxis", equals: "No" },
  },

  // ── NO PATH: Q1d — Date of epinephrine use ──
  {
    id: "epi-use-dates",
    type: "textarea",
    title: "Please provide the date(s) (month and year) when you had to use epinephrine.",
    placeholder: "None",
    questionKey: "Please provide the date(s) (month and year) when you had to use epinephrine.",
    showIf: { screenId: "anaphylaxis", equals: "No" },
  },

  // ══════════════════════════════════════════════════════════════
  // SHARED QUESTIONS (all paths converge here)
  // ══════════════════════════════════════════════════════════════

  // ── Q2: Diagnosed with severe allergy ──
  {
    id: "severe-allergy-diagnosis",
    type: "yes-no",
    title: "Have you been diagnosed with a severe or potentially life-threatening allergy?",
    subtitle: "An allergy where you may go into anaphylaxis.",
    questionKey: "Have you been diagnosed with a severe or potentially life-threatening allergy (an allergy where you may go into anaphylaxis)? POSSIBLE ANSWERS: Yes; No",
  },

  // ── Q3: Allergen types ──
  {
    id: "allergen-types",
    type: "multi-select",
    title: "Which of the following are you allergic to?",
    subtitle: "Select all that apply.",
    questionKey: "Which of the following are you allergic to that may lead to anaphylaxis? POSSIBLE ANSWERS: Eggs; Fish; Fruit; Insect bites or stings; Latex; Medication(s); Milk (dairy); Peanuts; Tree nuts; Shellfish; Wheat; Pollen; Soy; Other; None of the above",
    options: [
      { label: "Eggs", value: "Eggs" },
      { label: "Fish", value: "Fish" },
      { label: "Fruit", value: "Fruit" },
      { label: "Insect bites or stings (bees, wasps, fire ants, mosquitoes)", value: "Insect bites or stings" },
      { label: "Latex", value: "Latex" },
      { label: "Medication(s)", value: "Medication(s)" },
      { label: "Milk (dairy)", value: "Milk (dairy)" },
      { label: "Peanuts", value: "Peanuts" },
      { label: "Tree nuts", value: "Tree nuts" },
      { label: "Shellfish", value: "Shellfish" },
      { label: "Wheat", value: "Wheat" },
      { label: "Pollen", value: "Pollen" },
      { label: "Soy", value: "Soy" },
      { label: "Other", value: "Other" },
      { label: "None of the above", value: "None of the above" },
    ],
  },

  // ── Q4: Previously prescribed epinephrine ──
  {
    id: "prescribed-epi",
    type: "yes-no",
    title: "Have you ever been prescribed epinephrine (e.g., EpiPen)?",
    questionKey: "Have you ever been prescribed epinephrine (e.g., EpiPen)? POSSIBLE ANSWERS: Yes; No",
  },

  // ── Q4a: Which treatments (if Q4=Yes) ──
  {
    id: "prescribed-epi-types",
    type: "multi-select",
    title: "Please select all epinephrine treatments you have been prescribed.",
    questionKey: "Please select all epinephrine treatments you have been prescribed.",
    showIf: { screenId: "prescribed-epi", equals: "Yes" },
    options: [
      { label: "Auvi-Q (epinephrine injection, USP) Auto-injector 0.3mg", value: "Auvi-Q 0.3mg" },
      { label: "EPIPEN (epinephrine injection, USP) Auto-injector 0.3mg", value: "EPIPEN 0.3mg" },
      { label: "Epinephrine Injection Auto-injector (Mylan) 0.3mg", value: "Epinephrine Mylan 0.3mg" },
      { label: "Epinephrine Injection Auto-injector (Teva) 0.3mg", value: "Epinephrine Teva 0.3mg" },
      { label: "Epinephrine Injection Auto-injector (Adrenaclick) 0.3mg", value: "Epinephrine Adrenaclick 0.3mg" },
      { label: "neffy (epinephrine nasal spray) 2mg", value: "neffy 2mg" },
      { label: "I don't know", value: "I don't know" },
    ],
  },

  // ── Q5: Barriers to auto-injector use ──
  {
    id: "auto-injector-barriers",
    type: "multi-select",
    title: "Would you delay or avoid administering epinephrine using an auto-injector in an emergency due to any of the following?",
    subtitle: "Select all that apply.",
    questionKey: "Would you delay or avoid administering epinephrine using an auto-injector in an emergency due to?",
    options: [
      { label: "I have a fear of needles and will not use an auto-injector", value: "Fear of needles" },
      { label: "I have concerns with safety and risk of injury with auto-injector", value: "Safety concerns" },
      { label: "I have discomfort with using my auto-injector correctly", value: "Discomfort with correct use" },
      { label: "I have anxiety or hesitation to use my auto-injector", value: "Anxiety or hesitation" },
      { label: "Financial cost of replacing expired auto-injector", value: "Financial cost" },
      { label: "I have had previous negative experiences with auto-injector", value: "Previous negative experience" },
      { label: "I am reluctant to inject but would use a nasal form in an emergency", value: "Would prefer nasal form" },
      { label: "I have previously hesitated to self-inject when needing to use epinephrine", value: "Previously hesitated" },
      { label: "I have been diagnosed with Trypanophobia (an intense fear of needles)", value: "Trypanophobia" },
      { label: "Lack of portability", value: "Lack of portability" },
      { label: "Other (please specify below)", value: "Other" },
    ],
  },

  // ── Q6: Why neffy ──
  {
    id: "why-neffy",
    type: "textarea",
    title: "Please provide any other information why neffy would be a good choice for you.",
    placeholder: "None",
    questionKey: "In the box below, please provide any other information why neffy would be a good choice for you.",
  },

  // ── Q7: Medical conditions checklist ──
  {
    id: "conditions-checklist",
    type: "multi-select",
    title: "Do you have any of the following?",
    subtitle: "Select all that apply.",
    questionKey: "Do you have any of the following?",
    options: [
      { label: "Diabetes", value: "Diabetes" },
      { label: "Depression", value: "Depression" },
      { label: "Heart problems", value: "Heart problems" },
      { label: "High blood pressure", value: "High blood pressure" },
      { label: "Thyroid problems", value: "Thyroid problems" },
      { label: "Kidney problems", value: "Kidney problems" },
      { label: "Low potassium in blood", value: "Low potassium in blood" },
      { label: "Nasal problems (polyps, injury, broken nose, or nasal surgery)", value: "Nasal problems" },
      { label: "Parkinson's Disease", value: "Parkinson's Disease" },
      { label: "Pregnant or plan to become pregnant", value: "Pregnant or plan to become pregnant" },
      { label: "Plan to breastfeed", value: "Plan to breastfeed" },
      { label: "Pulmonary edema", value: "Pulmonary edema" },
      { label: "None of the above", value: "None of the above" },
    ],
  },

  // ── Q8: See medical professional ──
  {
    id: "sees-doctor-allergies",
    type: "yes-no",
    title: "Do you see a medical professional for severe allergies or serious allergic reactions?",
    subtitle: "Such as a doctor or nurse practitioner for anaphylaxis (Type 1 allergic reaction).",
    questionKey: "Do you see a medical professional for severe allergies or serious allergic reactions, like anaphylaxis? POSSIBLE ANSWERS: Yes; No",
  },

  // ── Q8a: Doctor name (if Q8=Yes) ──
  {
    id: "doctor-name",
    type: "textarea",
    title: "Please provide the full name of your medical doctor or nurse practitioner.",
    placeholder: "None",
    questionKey: "Please provide the full name of your medical doctor or nurse practitioner.",
    showIf: { screenId: "sees-doctor-allergies", equals: "Yes" },
  },

  // ── Q8b: Doctor specialty (if Q8=Yes) ──
  {
    id: "doctor-specialty",
    type: "single-select",
    title: "What is the specialty of your treating doctor or nurse practitioner?",
    questionKey: "What is the specialty of your treating doctor or nurse practitioner?",
    showIf: { screenId: "sees-doctor-allergies", equals: "Yes" },
    options: [
      { label: "Allergy/Immunology", value: "Allergy/Immunology" },
      { label: "Ear Nose & Throat (ENT/Otolaryngology)", value: "ENT/Otolaryngology" },
      { label: "Primary care/Family Medicine", value: "Primary care/Family Medicine" },
      { label: "Other", value: "Other" },
    ],
  },

  // ── Q9: Current medications ──
  {
    id: "current-medications",
    type: "textarea",
    title: "Provide a complete list of all medications you are currently taking.",
    subtitle: "Include prescription medications, over-the-counter drugs, supplements, and herbal remedies.",
    placeholder: "I am not taking medications",
    formField: "selfReportedMeds",
    questionKey: "Provide a complete list of all medications you are currently taking for all medical conditions.",
  },

  // ── Q10: Medical conditions ──
  {
    id: "medical-conditions-text",
    type: "textarea",
    title: "List all medical conditions you have been diagnosed with.",
    subtitle: "Including serious illnesses, chronic conditions, and conditions for which you are currently taking medication.",
    placeholder: "None",
    formField: "medicalConditions",
    questionKey: "List all medical conditions you have been diagnosed with.",
  },

  // ── Q11: Allergies ──
  {
    id: "allergies-text",
    type: "textarea",
    title: "List all known allergies, including current and past.",
    subtitle: "Include allergies to medications, foods, environmental factors, and other substances. If possible, describe the type of reaction experienced.",
    placeholder: "None",
    formField: "allergies",
    questionKey: "List all known allergies, including current and past.",
  },

  // ══════════════════════════════════════════════════════════════
  // CONSENT & VERIFICATION
  // ══════════════════════════════════════════════════════════════

  // ── Pharmacist counseling waiver ──
  { id: "pharmacist-waiver", type: "declaration", title: "Pharmacist Counseling Waiver" },

  // ── Truthfulness declaration ──
  { id: "truthfulness", type: "declaration", title: "Declaration of Truthfulness" },

  // ── Treatment consent ──
  { id: "treatment-consent", type: "consent-long", title: "Treatment Consent" },

  // ══════════════════════════════════════════════════════════════
  // PATIENT INFO & CHECKOUT
  // ══════════════════════════════════════════════════════════════

  { id: "phone-verify", type: "phone-verify", title: "Verify Your Phone" },
  { id: "email-id", type: "email-id", title: "Your Information" },
  { id: "shipping", type: "shipping", title: "Shipping Address" },
  { id: "plan-select", type: "plan-select", title: "Choose Your Plan" },
  { id: "checkout", type: "checkout", title: "Complete Your Order" },
];
