export type Lang = "he" | "en";

const translations = {
  // Global UI
  continue: { he: "המשך", en: "Continue" },
  back: { he: "חזרה", en: "Back" },
  yes: { he: "כן", en: "Yes" },
  no: { he: "לא", en: "No" },
  agree: { he: "מסכים/ה", en: "I Agree" },
  decline: { he: "לא מסכים/ה", en: "I Decline" },
  none: { he: "אין", en: "None" },
  unknown: { he: "לא ידוע", en: "Unknown" },
  required: { he: "שדה חובה", en: "Required field" },
  hipaaCompliant: { he: "תואם HIPAA", en: "HIPAA Compliant" },
  privacyPolicy: { he: "מדיניות פרטיות", en: "Privacy Policy" },
  termsOfUse: { he: "תנאי שימוש", en: "Terms of Use" },
  noneOfThese: { he: "אף אחד מהם", en: "None of these" },
  switchLang: { he: "English", en: "עברית" },

  // Screen 1: Landing
  landingTitle: { he: "שאלון רפואי לנשירת שיער", en: "Hair Loss Medical Questionnaire" },
  landingSubtitle: { he: "ענה על מספר שאלות קצרות כדי שהרופא שלנו יוכל להתאים לך את הטיפול המושלם", en: "Answer a few quick questions so our doctor can find the perfect treatment for you" },
  landingCta: { he: "יאללה, בוא נתחיל", en: "Let's Get Started" },
  landingBadge1: { he: "רופאים מורשים", en: "Licensed Physicians" },
  landingBadge2: { he: "משלוח חינם", en: "Free Shipping" },
  landingBadge3: { he: "דיסקרטי לחלוטין", en: "100% Discreet" },
  landingStep1: { he: "מלא שאלון קצר", en: "Complete a short questionnaire" },
  landingStep2: { he: "רופא בודק את הפרטים", en: "A doctor reviews your details" },
  landingStep3: { he: "קבל משלוח עד הבית", en: "Get treatment delivered home" },
  landingHowItWorks: { he: "איך זה עובד?", en: "How it works" },

  // Screen 2: Consent
  consentTitle: { he: "הסכמה לתנאים", en: "Terms & Privacy" },
  consentText: {
    he: "אני מאשר/ת את תנאי הפרטיות ומדיניות השימוש",
    en: "I approve the terms of privacy and conditions of use",
  },
  consentCheckbox: {
    he: "קראתי ואני מסכים/ה לתנאי השימוש ומדיניות הפרטיות",
    en: "I have read and agree to the Terms of Use and Privacy Policy",
  },

  // Screen 3: Sex at birth
  sexAtBirthTitle: { he: "מהו המין שנקבע לך בלידה?", en: "What was your sex assigned at birth?" },
  sexAtBirthMale: { he: "זכר", en: "Male" },
  sexAtBirthFemale: { he: "נקבה", en: "Female" },

  // Screen 4: DOB
  dobTitle: { he: "תאריך לידה", en: "Date of Birth" },
  dobDay: { he: "יום", en: "Day" },
  dobMonth: { he: "חודש", en: "Month" },
  dobYear: { he: "שנה", en: "Year" },
  dobError: { he: "חייב להיות מעל גיל 18", en: "Must be 18 or older" },
  dobInvalid: { he: "תאריך לא תקין", en: "Invalid date" },

  // Screen 4: Male conditions
  maleCondTitle: { he: "האם אתה סובל מאחד מהמצבים הבאים?", en: "Do you suffer from any of the following conditions?" },
  maleCondOpt1: { he: "בעיות זקפה", en: "Erectile dysfunction" },
  maleCondOpt2: { he: "הגדלת שדיים", en: "Breast enlargement" },

  // Screen 5: Medical conditions (textarea)
  medCondTitle: { he: "האם יש לך מצב רפואי?", en: "Do you have any medical conditions?" },
  medCondPlaceholder: { he: "אין", en: "None" },

  // Screen 6: Medications
  medsTitle: { he: "האם אתה נוטל תרופות כלשהן?", en: "Are you currently taking any medications?" },
  medsPlaceholder: { he: "לא ידוע", en: "Unknown" },

  // Screen 7: Allergies
  allergiesTitle: { he: "האם יש לך אלרגיות לתרופות?", en: "Do you have any medication allergies?" },
  allergiesPlaceholder: { he: "אין", en: "None" },

  // Screen 8: Affected areas
  affectedTitle: { he: "אילו אזורים מושפעים?", en: "Which areas are affected?" },
  affectedOpt1: { he: "קו קדמי", en: "Hairline / Front" },
  affectedOpt2: { he: "קו אחורי (קרחת)", en: "Crown / Back" },
  affectedOpt3: { he: "קדמי ואחורי", en: "Front and back" },
  affectedOpt4: { he: "צדדים", en: "Sides" },
  affectedOpt5: { he: "כל הראש", en: "All over" },

  // Screen 9: Duration
  durationTitle: { he: "כמה זמן אתה חווה נשירת שיער?", en: "How long have you been experiencing hair loss?" },
  durationOpt1: { he: "פחות משנה", en: "Less than a year" },
  durationOpt2: { he: "1-5 שנים", en: "1-5 years" },
  durationOpt3: { he: "מעל 5 שנים", en: "Over 5 years" },

  // Screen 10: Severity
  severityTitle: { he: "כמה שיער נשר לך?", en: "How much hair have you lost?" },
  severityOpt1: { he: "מעט", en: "A little" },
  severityOpt2: { he: "בינוני", en: "Moderate" },
  severityOpt3: { he: "הרבה", en: "A lot" },

  // Screen 11: Cause
  causeTitle: { he: "מה לדעתך הסיבה לנשירת השיער?", en: "What do you believe is causing your hair loss?" },
  causeOpt1: { he: "תורשתיות/גנטיקה", en: "Hereditary / Genetics" },
  causeOpt2: { he: "סטרס", en: "Stress" },
  causeOpt3: { he: "תרופות", en: "Medications" },
  causeOpt4: { he: "מצב רפואי", en: "Medical condition" },
  causeOpt5: { he: "אחר", en: "Other" },
  causeOpt6: { he: "לא יודע", en: "Unknown" },

  // Screen 12: Doctor eval
  doctorEvalTitle: { he: "האם נבדקת על ידי רופא בנוגע לנשירת שיער?", en: "Have you been evaluated by a physician for hair loss?" },

  // Screen 12a: Doctor diagnosis (conditional)
  doctorDiagTitle: { he: "מה הייתה האבחנה?", en: "What was the diagnosis?" },
  doctorDiagOpt1: { he: "התקרחות אנדרוגנטית", en: "Androgenetic alopecia" },
  doctorDiagOpt2: { he: "התקרחות אזורית (אלופציה אראטה)", en: "Alopecia areata" },
  doctorDiagOpt3: { he: "נשירת שיער טלוגנית", en: "Telogen effluvium" },
  doctorDiagOpt4: { he: "התקרחות ממשיכה (טרקציה)", en: "Traction alopecia" },
  doctorDiagOpt5: { he: "התקרחות צלקתית", en: "Scarring alopecia" },
  doctorDiagOpt6: { he: "אחר", en: "Other" },
  doctorDiagOpt7: { he: "לא זוכר", en: "I don't remember" },

  // Screen 12b: Doctor eval details (conditional)
  doctorEvalDetailsTitle: { he: "ספר לנו עוד על האבחנה", en: "Tell us more about the diagnosis" },
  doctorEvalDetailsPlaceholder: { he: "פרט/י כאן...", en: "Please describe..." },

  // Screen 13: Scalp conditions
  scalpTitle: { he: "האם יש לך בעיות בקרקפת?", en: "Do you have any scalp problems?" },

  // Screen 14: Dandruff
  dandruffTitle: { he: "האם יש לך קשקשים מופרזים?", en: "Do you experience excessive dandruff?" },

  // Screen 15: Other body areas
  bodyAreasTitle: { he: "האם אתה מאבד שיער באזורים אחרים בגוף?", en: "Are you losing hair in other body areas?" },

  // Screen 15a: Body areas details (conditional)
  bodyAreasDetailsTitle: { he: "ספר לנו על נשירת שיער בגוף", en: "Tell us about body hair loss" },
  bodyAreasDetailsPlaceholder: { he: "פרט/י כאן...", en: "Please describe..." },

  // Screen 16: Previous treatments
  treatmentsTitle: { he: "האם ניסית טיפולים לנשירת שיער בעבר?", en: "Have you tried hair loss treatments before?" },

  // Screen 16a: Treatments details (conditional)
  treatmentsDetailsTitle: { he: "אילו טיפולים ניסית?", en: "What treatments have you tried?" },
  treatmentsDetailsPlaceholder: { he: "פרט/י כאן...", en: "Please describe..." },

  // Screen 17: Serious conditions
  seriousCondTitle: {
    he: "האם אתה סובל מאחד מהמצבים הבאים?",
    en: "Do you suffer from any of the following conditions?",
  },
  seriousCondOpt1: { he: "סרטן ערמונית", en: "Prostate cancer" },
  seriousCondOpt2: { he: "סרטן השד", en: "Breast cancer" },
  seriousCondOpt3: { he: "מחלות כבד", en: "Liver disease" },
  seriousCondOpt4: { he: "מחלות כליות", en: "Kidney disease" },
  seriousCondOpt5: { he: "סוכרת", en: "Diabetes" },
  seriousCondOpt6: { he: "לחץ דם נמוך", en: "Low blood pressure" },

  // Screen 18: Mood
  moodTitle: { he: "האם אתה סובל מהפרעות מצב רוח?", en: "Do you suffer from mood disorders?" },

  // Screen 18a: Mood details (conditional)
  moodDetailsTitle: { he: "ספר לנו על מצב הרוח שלך", en: "Tell us about your mood condition" },
  moodDetailsPlaceholder: { he: "פרט/י כאן...", en: "Please describe..." },

  // Screen 19: Questions for doctor
  doctorQTitle: { he: "האם יש לך שאלות לרופא?", en: "Do you have any questions for the doctor?" },
  doctorQPlaceholder: { he: "אין", en: "None" },

  // Screen 20: Truthfulness
  truthTitle: { he: "הצהרת אמיתות", en: "Truthfulness Declaration" },
  truthText: {
    he: "אני מצהיר/ה שכל המידע שמסרתי הוא אמיתי ומדויק. אני מבין/ה שמידע שגוי עלול להשפיע על הטיפול הרפואי שלי.",
    en: "I declare that all information I have provided is truthful and accurate. I understand that inaccurate information may affect my medical treatment.",
  },

  // Screen 21: Treatment consent
  treatConsentTitle: { he: "הסכמה מדעת לטיפול", en: "Informed Treatment Consent" },
  treatConsentText: {
    he: `טופס הסכמה מדעת לטיפול בנשירת שיער

הטיפולים המוצעים עשויים לכלול:

פינסטריד (Finasteride): תרופה הנלקחת דרך הפה שעובדת על ידי חסימת ההמרה של טסטוסטרון ל-DHT, ההורמון האחראי לנשירת שיער תורשתית. תופעות לוואי אפשריות כוללות: ירידה בחשק המיני, קושי בזקפה, ירידה בנפח הזרע, רגישות בחזה, ולעיתים נדירות דיכאון.

מינוקסידיל (Minoxidil): תכשיר מקומי או כדור שמרחיב כלי דם בקרקפת ומעודד צמיחת שיער. תופעות לוואי אפשריות כוללות: גירוי בקרקפת, צמיחת שיער לא רצויה בפנים, סחרחורת, ולעיתים נדירות שינויים בקצב הלב.

אני מבין/ה ומסכים/ה:
• הטיפול מחייב שימוש רציף ועקבי
• תוצאות עשויות להשתנות מאדם לאדם
• יש לדווח על כל תופעת לוואי לרופא מיד
• ניתן להפסיק את הטיפול בכל עת`,
    en: `Informed Consent for Hair Loss Treatment

The proposed treatments may include:

Finasteride: An oral medication that works by blocking the conversion of testosterone to DHT, the hormone responsible for hereditary hair loss. Possible side effects include: decreased libido, erectile difficulty, decreased semen volume, breast tenderness, and rarely depression.

Minoxidil: A topical solution or oral tablet that dilates blood vessels in the scalp to encourage hair growth. Possible side effects include: scalp irritation, unwanted facial hair growth, dizziness, and rarely changes in heart rate.

I understand and agree:
• Treatment requires consistent and continuous use
• Results may vary from person to person
• Any side effects should be reported to the doctor immediately
• Treatment may be discontinued at any time`,
  },

  // Screen 22: Phone verification (2FA)
  phoneTitle: { he: "אימות טלפון", en: "Phone Verification" },
  phoneFirstName: { he: "שם פרטי", en: "First Name" },
  phoneLastName: { he: "שם משפחה", en: "Last Name" },
  phoneNumber: { he: "מספר טלפון", en: "Phone Number" },
  phoneSendCode: { he: "שלחו לי קוד", en: "Send me a code" },
  phoneEnterCode: { he: "הכנס את הקוד שקיבלת", en: "Enter the code you received" },
  phoneVerify: { he: "אימות", en: "Verify" },
  phoneResend: { he: "שלח קוד חדש", en: "Resend code" },
  phoneChangeNumber: { he: "שנה מספר טלפון", en: "Change phone number" },
  phoneSuccess: { he: "כל הכבוד גבר, ממשיכים!", en: "Phone verified! Let's continue." },
  phoneInvalid: { he: "מספר טלפון לא תקין", en: "Invalid phone number" },
  phoneCodeInvalid: { he: "קוד שגוי, נסה שוב", en: "Invalid code, please try again" },

  // Screen 23: Email & ID
  emailTitle: { he: "פרטי התקשרות", en: "Contact Details" },
  emailLabel: { he: "אימייל", en: "Email" },
  idLabel: { he: "תעודת זהות", en: "ID Number" },

  // Screen 24: Shipping
  shippingTitle: { he: "כתובת משלוח", en: "Shipping Address" },
  shippingStreet: { he: "רחוב ומספר", en: "Street Address" },
  shippingCity: { he: "עיר", en: "City" },

  // Screen 25: Medication type
  medSelectTitle: { he: "בחר את סוג הטיפול", en: "Choose Your Treatment Type" },
  medSelectPills: { he: "כדורים", en: "Oral Tablets" },
  medSelectPillsDesc: {
    he: "פינסטריד 1mg + מינוקסידיל 2.5mg - כדור משולב ליום",
    en: "Finasteride 1mg + Minoxidil 2.5mg — one combined daily tablet",
  },
  medSelectDrops: { he: "טיפות", en: "Topical Solution" },
  medSelectDropsDesc: {
    he: "פינסטריד 0.3% + מינוקסידיל 5% - תמיסה לקרקפת",
    en: "Finasteride 0.3% + Minoxidil 5% — solution applied to scalp",
  },
  perMonth: { he: "לחודש", en: "/month" },

  // Screen 26: Plan
  planTitle: { he: "בחר מסלול", en: "Choose Your Plan" },
  plan3Month: { he: "3 חודשים", en: "3 Months" },
  plan6Month: { he: "6 חודשים", en: "6 Months" },
  planBestValue: { he: "מקסימום הנחה!", en: "Best Value!" },
  planFeatureShipping: { he: "משלוח חינם", en: "Free shipping" },
  planFeatureDoctor: { he: "ייעוץ רופא", en: "Doctor consultation" },
  planFeatureSupport: { he: "תמיכה מלאה", en: "Full support" },
  planFeatureSavings: { he: "חיסכון מקסימלי", en: "Maximum savings" },
  planTotal: { he: 'סה"כ', en: "Total" },

  // Screen 27: Checkout
  checkoutTitle: { he: "תשלום", en: "Payment" },
  checkoutOrderSummary: { he: "סיכום הזמנה", en: "Order Summary" },
  checkoutPay: { he: "שלם", en: "Pay Now" },
  checkoutSuccess: { he: "בהצלחה!", en: "Good Luck!" },
  checkoutSuccessMsg: {
    he: "התשלום התקבל בהצלחה. רופא יבדוק את הפרטים שלך תוך 24 שעות.",
    en: "Payment received! A doctor will review your information within 24 hours.",
  },
  checkoutProcessing: { he: "מעבד תשלום...", en: "Processing payment..." },
  checkoutError: { he: "שגיאה בתשלום, נסה שוב", en: "Payment error, please try again" },

  // Discount codes
  discountCodeLabel: { he: "קוד הנחה", en: "Discount Code" },
  discountCodePlaceholder: { he: "הכנס קוד הנחה", en: "Enter discount code" },
  discountCodeApply: { he: "החל", en: "Apply" },
  discountCodeRemove: { he: "הסר", en: "Remove" },
  discountCodeValid: { he: "קוד הנחה הוחל!", en: "Discount code applied!" },
  discountCodeInvalid: { he: "קוד הנחה לא תקין או פג תוקף", en: "Invalid or expired discount code" },
  discountCodeChecking: { he: "בודק...", en: "Checking..." },
  discountSummary: { he: "הנחה", en: "Discount" },
  discountTotal: { he: 'סה"כ לתשלום', en: "Total to pay" },
  discountOriginalPrice: { he: "מחיר מקורי", en: "Original price" },

  // Disqualification
  disqualifiedTitle: {
    he: "מצטערים, אינך עומד/ת בקריטריונים.",
    en: "Sorry, you do not meet the criteria.",
  },
  disqualifiedText: {
    he: "איננו יכולים לרשום לך מרשם היום.",
    en: "We cannot prescribe for you today.",
  },
  disqualifiedRestart: {
    he: "התחל מחדש",
    en: "Start over",
  },

  // Currency
  currency: { he: "₪", en: "₪" },
  nis: { he: 'ש"ח', en: "NIS" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}

export default translations;
