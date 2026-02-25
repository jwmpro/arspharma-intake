# Gever Health — Hair Loss Intake Questionnaire

Dynamic 27-screen medical intake questionnaire with 2FA phone verification, Hebrew/English i18n, and Stripe payment (Card, Apple Pay, Google Pay, PayPal).

## Quick Deploy to Netlify

### 1. Push to GitHub
```bash
cd gever-intake
git init
git add .
git commit -m "Initial commit: Gever Health intake questionnaire"
gh repo create gever-intake --private --push
```

### 2. Deploy on Netlify
1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
2. Select your `gever-intake` repo
3. Build settings are auto-detected from `netlify.toml`
4. Add environment variables (see below)
5. Deploy

### 3. Set Custom Domain
1. In Netlify → **Domain management** → **Add custom domain**
2. Enter: `intake.geverhealth.com` (or your preferred subdomain)
3. In your DNS provider for geverhealth.com, add a CNAME record:
   ```
   intake  CNAME  <your-netlify-site>.netlify.app
   ```
4. Netlify auto-provisions SSL

## Environment Variables

Set these in Netlify → Site settings → Environment variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_live_...) |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID (AC...) |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify Service SID (VA...) |
| `BELUGA_API_URL` | `https://api.belugahealth.com` (production) or `https://api-staging.belugahealth.com` (staging) |
| `BELUGA_API_KEY` | Beluga API Bearer token |
| `BELUGA_PHARMACY_ID` | Pharmacy ID for the medications |

## Twilio Setup

1. Create a [Twilio Verify Service](https://www.twilio.com/console/verify/services)
2. Enable **SMS** channel
3. Set the service name to "Gever Health" (appears in SMS message)
4. Copy the **Service SID** (VA...) to `TWILIO_VERIFY_SERVICE_SID`

## Stripe Setup

1. In [Stripe Dashboard](https://dashboard.stripe.com) → Settings → Payment methods
2. Enable: **Cards**, **Apple Pay**, **Google Pay**, **PayPal**
3. For Apple Pay: add and verify your domain in Stripe → Settings → Apple Pay
4. PayPal requires enabling the Stripe-PayPal connector in your dashboard
5. Copy your API keys to the env variables

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Entry point
│   ├── layout.tsx            # HTML shell
│   ├── globals.css           # Tailwind + custom styles
│   └── api/
│       ├── send-otp/         # Twilio SMS send
│       ├── verify-otp/       # Twilio SMS verify
│       ├── create-payment-intent/  # Stripe payment
│       └── submit-visit/     # Beluga API submission
├── config/
│   ├── translations.ts       # Hebrew/English strings
│   ├── medications.ts        # Medication medIds & pricing
│   └── screens.ts            # 27 screen definitions
├── context/
│   └── FormContext.tsx        # Global form state
└── components/
    ├── Questionnaire.tsx      # Screen router
    ├── ui/                    # Shared components
    └── screens/               # 14 screen types
```

## Screen Flow (27 screens)

1. Landing → 2. Consent → 3. DOB → 4. Male conditions → 5. Medical conditions →
6. Medications → 7. Allergies → 8. Affected areas → 9. Duration → 10. Severity →
11. Cause → 12. Doctor eval → 13. Scalp → 14. Dandruff → 15. Body areas →
16. Treatments → 17. Serious conditions → 18. Mood → 19. Doctor questions →
20. Truthfulness → 21. Treatment consent → 22. Phone 2FA → 23. Email/ID →
24. Shipping → 25. Medication type → 26. Plan select → 27. Checkout

## Beluga API Payload

The questionnaire builds and submits this payload to `POST /visit/createNoPayPhotos`:

```json
{
  "formObj": {
    "consentsSigned": true,
    "firstName": "...",
    "lastName": "...",
    "dob": "MM/DD/YYYY",
    "phone": "+972...",
    "email": "...",
    "address": "...",
    "city": "...",
    "state": "IL",
    "zip": "00000",
    "sex": "Male",
    "selfReportedMeds": "...",
    "allergies": "...",
    "medicalConditions": "...",
    "patientPreference": [{ "name": "...", "strength": "...", "quantity": "...", "refills": "...", "medId": "..." }],
    "Q1": "Question with POSSIBLE ANSWERS: ...",
    "A1": "selected answer",
    ...
  },
  "pharmacyId": "...",
  "masterId": "gever_...",
  "company": "geverHealth",
  "visitType": "hairlossHebrew" | "hairloss"
}
```

## Local Development

```bash
npm install
cp .env.example .env.local  # Fill in your keys
npm run dev
```
