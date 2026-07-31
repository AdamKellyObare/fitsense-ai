# FitSense AI — Privacy Policy

> **DRAFT — NOT LEGAL ADVICE.** This document was prepared as an early working draft to speed up eventual App Store / Play Store submission. It reflects what the app actually does as of this writing, but it has **not** been reviewed by a lawyer and **must** be reviewed by qualified legal counsel before publishing it or submitting the app for review. Replace every `[bracketed placeholder]` before use.

**Last updated:** [DATE]

## 1. Who we are

FitSense AI ("**we**," "**our**," "**us**") is a mobile and web application that helps users log meals, estimate calories and macronutrients, and track daily nutrition goals. This policy explains what information we collect, how we use it, and the choices you have.

- **Data controller:** [COMPANY / LEGAL ENTITY NAME]
- **Contact:** [SUPPORT EMAIL ADDRESS]
- **Address:** [COMPANY ADDRESS, if required in your jurisdiction]

## 2. Information we collect

### 2.1 Account information
When you register, we collect your **name**, **email address**, and **password**. Passwords are never stored in plain text — they are hashed using Argon2id, a modern, one-way hashing algorithm, before being saved.

### 2.2 Profile and goal information
To personalize your calorie and macro targets, we collect information you choose to provide: **age, height, weight, sex, activity level, and fitness goal** (e.g. cutting, maintenance, bulking). This is used only to calculate suggested nutrition targets and is never required beyond what you enter.

### 2.3 Meal and nutrition data
When you log a meal, we store the **text description you enter** (e.g. "two eggs and toast"), the **AI-estimated calories, protein, carbs, and fat** for that meal, and the **date/time** it was logged.

To generate that estimate, the meal description you type is sent to **OpenAI** (the maker of the underlying AI model) for processing. OpenAI's use of this data is governed by [OpenAI's own API data usage policy](https://openai.com/policies/api-data-usage-policies) — as of this writing, API data submitted this way is not used to train OpenAI's models. We send only the food description text, not your name, email, or other account details, as part of that request.

### 2.4 Water intake
Daily water intake is currently stored **only on your device** (not on our servers) and is not linked to your account server-side.

### 2.5 Camera and photo library access
The app requests permission to access your **camera** and **photo library**. This permission supports meal-photo capture features. [UPDATE THIS SECTION once photo-based meal scanning ships — describe exactly what happens to a captured photo: is it sent to a server, to OpenAI, stored, or processed only on-device.]

### 2.6 Technical and session data
We use cookies to keep you signed in securely: an access token, a refresh token, and a CSRF (anti-forgery) token. These are functional cookies required for the app to work — we do not use advertising or tracking cookies, and we do not currently use any third-party analytics or advertising SDKs.

## 3. How we use your information

We use your information to:
- Create and maintain your account
- Calculate personalized calorie/macro targets
- Estimate nutrition information for meals you log (via OpenAI, as described above)
- Show you your own history, trends, and progress
- Maintain the security of your account (authentication, fraud/abuse prevention)

We do **not** sell your personal information, and we do not share it with third parties for their own marketing purposes.

## 4. Where your data is stored

Your account and meal data is stored in a managed PostgreSQL database hosted by a third-party cloud infrastructure provider ([Neon](https://neon.tech)). [Add hosting region/data-residency detail if relevant to your users, e.g. EU users under GDPR.]

## 5. Data retention and deletion

We retain your data for as long as your account is active. You may delete individual logged meals at any time from within the app. To delete your entire account and all associated data, contact us at [SUPPORT EMAIL ADDRESS]. [Once a self-serve account-deletion feature ships in-app, update this section and remove the manual-request language — both Apple and Google increasingly require in-app deletion, not just an email request.]

## 6. Your rights

Depending on where you live, you may have rights to access, correct, export, or delete your personal data, and to object to or restrict certain processing. To exercise any of these rights, contact us at [SUPPORT EMAIL ADDRESS]. [If you have EU/UK/California users, this section needs jurisdiction-specific language — GDPR and CCPA impose specific disclosure requirements this draft does not fully cover.]

## 7. Children's privacy

FitSense AI is not directed at children under [13 / 16 — pick per jurisdiction] and we do not knowingly collect personal information from children under that age. If you believe a child has provided us with personal information, contact us at [SUPPORT EMAIL ADDRESS] so we can remove it.

## 8. Health disclaimer

FitSense AI provides calorie and macronutrient **estimates** for informational purposes only. It is not a medical device, and it does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before making significant changes to your diet, especially if you have a medical condition.

## 9. Subscriptions and payments

[This section is a placeholder — FitSense AI does not currently process payments. Once subscription billing ships, describe: what's billed, how (Apple In-App Purchase / Google Play Billing), what data the payment processor sees (typically FitSense AI does not see full payment card details — Apple/Google handle that directly), and your refund/cancellation policy.]

## 10. Changes to this policy

We may update this policy from time to time. If we make material changes, we will notify you via the app or by email before the change takes effect.

## 11. Contact us

Questions about this policy: [SUPPORT EMAIL ADDRESS]
