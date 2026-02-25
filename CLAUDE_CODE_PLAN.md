# Gever Health Intake — Claude Code Autonomous Build & Deploy Plan

## Context
A 27-screen medical intake questionnaire for hair loss treatment has been built as a Next.js 14 app in `gever-intake/`. TypeScript compiles clean (`npx tsc --noEmit` passes). The codebase is ~2,700 lines across 31 source files. It needs: build verification, bug fixes, local testing, git setup, Netlify deployment, and custom domain configuration.

## Pre-Requisites (User Must Provide)
Before starting, confirm these are available:
- [ ] Stripe API keys (publishable + secret) — ask user if not in env
- [ ] Twilio Account SID, Auth Token, and Verify Service SID
- [ ] Beluga API key (staging first, then production)
- [ ] Beluga Pharmacy ID (not yet provided — critical)
- [ ] Netlify account access (either CLI token or `netlify login`)
- [ ] DNS access to geverhealth.com (for CNAME record)

---

## Phase 1: Build Verification & Bug Fixes

### Step 1.1: Install & Build
```bash
cd gever-intake
npm install --legacy-peer-deps
npx tsc --noEmit          # Should pass (verified)
npm run build             # Full Next.js production build
```
If build fails, check the error output. Known issue: Stripe SDK initializes at module level — already fixed with lazy `getStripe()` function in `src/app/api/create-payment-intent/route.ts`.

### Step 1.2: Create `.env.local` with User's Keys
```bash
cp .env.example .env.local
# Fill in real values — ask user for each key
```

### Step 1.3: Run Dev Server & Smoke Test
```bash
npm run dev
```
Open http://localhost:3000 and walk through:
1. Landing page loads, language toggle works
2. Click through screens 1-19 (questionnaire)
3. Phone verification screen renders (won't fully work without Twilio keys)
4. Checkout screen renders Stripe payment form
5. RTL layout correct in Hebrew, LTR in English

### Step 1.4: Fix Any Build/Runtime Issues
Common things to check:
- Stripe Payment Element renders (needs valid publishable key)
- All 27 screens accessible by clicking through
- Hebrew/English toggle switches all text correctly
- Progress bar advances with each screen
- Back button works
- Form data persists across screens (check React Context)

### Step 1.5: Verify API Routes
Test each API route with curl:
```bash
# Test send-otp (needs Twilio)
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+972541234567"}'

# Test create-payment-intent (needs Stripe)
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 1020, "currency": "ils", "email": "test@test.com", "name": "Test User"}'

# Test submit-visit structure (will fail without Beluga key, but should return structured error)
curl -X POST http://localhost:3000/api/submit-visit \
  -H "Content-Type: application/json" \
  -d '{"formData": {"firstName": "Test", "lastName": "User", "dob": "01/15/1990", "phone": "+972541234567", "email": "test@test.com", "address": "123 Main St", "city": "Tel Aviv", "sex": "Male", "selfReportedMeds": "None", "allergies": "None", "medicalConditions": "None", "medicationType": "pills", "planDuration": 6, "answers": {}, "lang": "he"}}'
```

---

## Phase 2: Polish & Responsiveness

### Step 2.1: Mobile Responsiveness
- Test all screens at 375px, 414px, 768px, 1024px widths
- Ensure no horizontal overflow
- Ensure touch targets are at least 44px
- Verify code input boxes on phone verify screen are usable on mobile

### Step 2.2: Form Validation Improvements
- DOB: validate impossible dates (Feb 30, etc.)
- Email: validate format before submission
- Phone: ensure exactly 9-10 digits after removing leading 0
- ID Number: Israeli ID checksum validation (Luhn variant)
- All textareas: max length limits (Beluga has 100 char limit on names)

### Step 2.3: UX Enhancements
- Add screen transition animations (already has fadeIn, verify it works)
- Add loading states to all API calls
- Add error recovery (retry buttons on network failures)
- Ensure consent-long screen scroll detection works on mobile
- Test auto-advance on single-select (should feel snappy)

---

## Phase 3: Stripe Payment Testing

### Step 3.1: Enable Payment Methods in Stripe Dashboard
User needs to enable in Stripe Dashboard → Settings → Payment methods:
- Cards (default)
- Apple Pay (requires domain verification)
- Google Pay (auto-enabled with cards)
- PayPal (requires Stripe-PayPal connector activation)

### Step 3.2: Test Payment Flow
Use Stripe test cards:
- `4242 4242 4242 4242` — successful payment
- `4000 0000 0000 3220` — 3D Secure required
- `4000 0000 0000 0002` — decline

### Step 3.3: Apple Pay Domain Verification
After deploying to the final domain:
1. Download `apple-developer-merchantid-domain-association` from Stripe Dashboard
2. Place at `public/.well-known/apple-developer-merchantid-domain-association`
3. Redeploy

---

## Phase 4: Twilio 2FA Testing

### Step 4.1: Create Twilio Verify Service
If not already done:
1. Go to Twilio Console → Verify → Services
2. Create new service named "Gever Health"
3. Enable SMS channel
4. Copy Service SID (VA...)

### Step 4.2: Test OTP Flow
1. Enter real Israeli phone number (+972...)
2. Verify SMS is received with 6-digit code
3. Enter code, verify success state
4. Test resend after cooldown
5. Test invalid code error handling
6. Test change phone number flow

---

## Phase 5: Beluga API Integration Testing

### Step 5.1: Test Against Staging
Use `BELUGA_API_URL=https://api-staging.belugahealth.com` with staging API key.

### Step 5.2: Verify Payload Format
The submit-visit route builds this payload structure:
```json
{
  "formObj": {
    "consentsSigned": true,
    "firstName": "...", "lastName": "...",
    "dob": "MM/DD/YYYY",
    "phone": "+972...",
    "email": "...",
    "address": "...", "city": "...",
    "state": "IL", "zip": "00000",
    "sex": "Male",
    "selfReportedMeds": "...",
    "allergies": "...",
    "medicalConditions": "...",
    "patientPreference": [{"name": "...", "strength": "...", "quantity": "...", "refills": "...", "medId": "..."}],
    "Q1": "question with POSSIBLE ANSWERS: ...", "A1": "answer",
    ...
  },
  "pharmacyId": "FROM_ENV",
  "masterId": "gever_[timestamp]_[random]",
  "company": "geverHealth",
  "visitType": "hairlossHebrew" | "hairloss"
}
```

### Step 5.3: Handle Known API Errors
Verify the app handles these Beluga responses gracefully:
- `"Patient not eligible for new visit"` — show user-friendly message
- `"Duplicate masterId"` — regenerate and retry
- `"Phone number error"` — format may need adjustment
- Any 400 error — display to user with retry option

### Step 5.4: Pass Language to Submit Route
Ensure the form's current language (`lang`) is passed in the submit-visit request body so `visitType` is set correctly. Currently the submit route reads `formData.lang` — verify this field is included when the checkout calls the API. **This may need a fix**: the FormContext doesn't currently pass `lang` in the formData sent to the API. Fix by including it in the CheckoutScreen's fetch body:
```typescript
body: JSON.stringify({
  formData: { ...data, lang },  // Add lang from useForm()
  paymentIntentId: paymentIntent.id,
}),
```

---

## Phase 6: Git & Deployment

### Step 6.1: Initialize Git
```bash
cd gever-intake
git init
git add .
git commit -m "Initial commit: Gever Health hair loss intake questionnaire"
```

### Step 6.2: Create GitHub Repo
```bash
gh repo create gever-intake --private --source=. --push
```

### Step 6.3: Deploy to Netlify
Option A — CLI:
```bash
npm install -g netlify-cli
netlify login
netlify init          # Link to repo
netlify env:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "pk_..."
netlify env:set STRIPE_SECRET_KEY "sk_..."
netlify env:set TWILIO_ACCOUNT_SID "AC..."
netlify env:set TWILIO_AUTH_TOKEN "..."
netlify env:set TWILIO_VERIFY_SERVICE_SID "VA..."
netlify env:set BELUGA_API_URL "https://api-staging.belugahealth.com"
netlify env:set BELUGA_API_KEY "..."
netlify env:set BELUGA_PHARMACY_ID "..."
netlify deploy --build --prod
```

Option B — Web UI:
1. Go to app.netlify.com → Add new site → Import from Git
2. Select the gever-intake repo
3. Build command: `npm run build` (auto-detected from netlify.toml)
4. Publish directory: `.next`
5. Add all environment variables in Site settings
6. Deploy

### Step 6.4: Install Netlify Next.js Plugin
The `netlify.toml` already references `@netlify/plugin-nextjs`. Ensure it's installed:
```bash
npm install -D @netlify/plugin-nextjs
```

### Step 6.5: Custom Domain Setup
1. In Netlify → Domain management → Add custom domain
2. Enter: `intake.geverhealth.com`
3. In DNS provider for geverhealth.com, add:
   ```
   Type: CNAME
   Name: intake
   Value: [your-site-name].netlify.app
   ```
4. Wait for DNS propagation (up to 24h, usually minutes)
5. Netlify auto-provisions SSL certificate

---

## Phase 7: Post-Deploy Verification

### Step 7.1: Full End-to-End Test
Walk through all 27 screens on the live URL:
1. Landing → Consent → DOB → all questionnaire screens
2. Phone verification with real Israeli number
3. Email/ID → Shipping
4. Medication select → Plan select
5. Stripe checkout with test card
6. Verify Beluga API receives the visit
7. Test in both Hebrew and English

### Step 7.2: Mobile Testing
- Test on actual iPhone (Safari) and Android (Chrome)
- Verify Apple Pay button appears on iOS
- Verify Google Pay appears on Android
- Test PayPal redirect flow

### Step 7.3: Switch to Production
Once staging tests pass:
1. Update `BELUGA_API_URL` to `https://api.belugahealth.com`
2. Update `BELUGA_API_KEY` to production key
3. Update Stripe keys to live mode (pk_live_..., sk_live_...)
4. Redeploy
5. Run full e2e test again

---

## Known Issues to Fix

1. **Language not passed to submit-visit**: CheckoutScreen needs to include `lang` in the API request body (see Phase 5 Step 5.4)
2. **Pharmacy ID missing**: User hasn't provided `BELUGA_PHARMACY_ID` yet — required for Beluga submission
3. **Apple Pay domain verification**: Needs the live domain to be deployed first, then place verification file
4. **Stripe API version**: Using `"2024-12-18.acacia"` — may need updating if Stripe version mismatch occurs

## File Inventory (31 source files)

```
src/app/globals.css
src/app/layout.tsx
src/app/page.tsx
src/app/api/send-otp/route.ts
src/app/api/verify-otp/route.ts
src/app/api/create-payment-intent/route.ts
src/app/api/submit-visit/route.ts
src/config/translations.ts         (Hebrew + English i18n)
src/config/medications.ts          (7 medIds, pricing, plan configs)
src/config/screens.ts              (27 screen definitions)
src/context/FormContext.tsx         (global form state)
src/components/Questionnaire.tsx   (screen router)
src/components/ui/Button.tsx
src/components/ui/LanguageToggle.tsx
src/components/ui/ProgressBar.tsx
src/components/ui/ScreenWrapper.tsx
src/components/screens/LandingScreen.tsx
src/components/screens/ConsentScreen.tsx
src/components/screens/DOBScreen.tsx
src/components/screens/SingleSelectScreen.tsx
src/components/screens/MultiSelectScreen.tsx
src/components/screens/TextareaScreen.tsx
src/components/screens/YesNoScreen.tsx
src/components/screens/DeclarationScreen.tsx
src/components/screens/ConsentLongScreen.tsx
src/components/screens/PhoneVerifyScreen.tsx
src/components/screens/EmailIDScreen.tsx
src/components/screens/ShippingScreen.tsx
src/components/screens/MedicationSelectScreen.tsx
src/components/screens/PlanSelectScreen.tsx
src/components/screens/CheckoutScreen.tsx
```
