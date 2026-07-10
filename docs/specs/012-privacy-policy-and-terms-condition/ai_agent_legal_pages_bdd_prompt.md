# AI Agent Prompt: Build Privacy Policy, Terms and Conditions, and Consent Flow

You are an AI coding agent working inside an existing web app codebase.

Your task is to implement a modern, Philippines-aware legal consent flow for a customer-information web app.

The implementation must include:

1. Privacy Policy / Privacy Notice page
2. Terms and Conditions page
3. Consent checkboxes on sign-up and customer-facing forms
4. Editable placeholder markdown files for the legal page content
5. Footer/navigation links to the legal pages
6. Behavior-driven development acceptance criteria, not TDD

Do not over-engineer. Match the existing framework, styling system, routing pattern, and component conventions already used in the codebase.

---

## Legal and jurisdiction context

The app is intended for users/customers in the Philippines.

The legal content should be drafted in a practical Philippines-aware way and reference the following concepts:

- Republic Act No. 10173, also known as the Data Privacy Act of 2012
- National Privacy Commission or NPC guidance
- Customer/data-subject rights, such as access, correction, objection, deletion/erasure, withdrawal of consent, and complaint filing
- Clear, specific, informed consent for collecting and processing personal information
- Data minimization: collect only what is necessary for the declared purpose
- Separate optional consent for marketing/promotional communications

Important: The generated content is a placeholder and must include a visible note that the business owner should review it with a qualified legal professional before production use.

---

## Required file/content structure

Create editable markdown placeholder files so the business owner can easily modify the legal text without editing the page/component logic.

Use this structure unless the existing project already has a better equivalent content convention:

```txt
/content
  /legal
    privacy-policy.md
    terms-and-conditions.md
```

The legal pages must render content from these markdown files:

```txt
/content/legal/privacy-policy.md
/content/legal/terms-and-conditions.md
```

If the app already uses another content directory convention, such as `src/content`, `app/content`, or `data/legal`, follow the project convention, but keep the final paths obvious and documented.

Add comments or a short README note explaining:

```txt
To update the Privacy Policy or Terms and Conditions, edit:
/content/legal/privacy-policy.md
/content/legal/terms-and-conditions.md
```

---

## Recommended modern web app placement

Implement legal pages using clean, standard routes:

```txt
/privacy-policy
/terms-and-conditions
```

Also add footer links visible on public-facing pages:

```txt
Privacy Policy
Terms and Conditions
```

If the app has an existing footer component, update it.  
If no footer exists, create a simple reusable footer component and include it in the public layout.

For forms, place consent language near the final submit button, not hidden in a separate page.

---

## Content requirements for `/content/legal/privacy-policy.md`

Create a complete placeholder Privacy Policy / Privacy Notice in markdown.

It must include these sections:

```md
# Privacy Policy / Privacy Notice

Last updated: [Month Day, Year]

## 1. Introduction

## 2. Personal Information We Collect

## 3. How We Collect Personal Information

## 4. Why We Collect and Use Your Personal Information

## 5. Legal Basis and Consent

## 6. How We Share Personal Information

## 7. Data Retention

## 8. Data Security

## 9. Cookies and Similar Technologies

## 10. Your Rights as a Data Subject

## 11. Withdrawal of Consent

## 12. Children’s Privacy

## 13. Third-Party Links

## 14. Changes to this Privacy Notice

## 15. Contact Us

## 16. Legal Review Notice
```

Use placeholder values like:

```txt
[App Name]
[Business/Company Name]
[Business Address]
[Contact Email]
[Privacy Contact Email]
[Phone Number]
```

The content must be Philippines-aware and mention that users may contact the National Privacy Commission if they believe their data privacy rights have been violated.

Use plain language. Avoid overly complex legal wording.

---

## Content requirements for `/content/legal/terms-and-conditions.md`

Create a complete placeholder Terms and Conditions document in markdown.

It must include these sections:

```md
# Terms and Conditions

Last updated: [Month Day, Year]

## 1. Acceptance of Terms

## 2. About the Service

## 3. User Accounts and Customer Information

## 4. User Responsibilities

## 5. Orders, Bookings, Payments, or Transactions

## 6. Cancellations, Refunds, and Service Changes

## 7. Acceptable Use

## 8. Intellectual Property

## 9. Third-Party Services

## 10. Disclaimers

## 11. Limitation of Liability

## 12. Suspension or Termination

## 13. Privacy

## 14. Changes to these Terms

## 15. Governing Law

## 16. Contact Us

## 17. Legal Review Notice
```

Use placeholder values such as:

```txt
[App Name]
[Business/Company Name]
[Contact Email]
[Business Address]
[Refund/Cancellation Policy Placeholder]
```

The Governing Law section must state that the Terms are governed by the laws of the Republic of the Philippines, unless the business owner later changes it.

---

## Consent checkbox requirements

Implement consent checkboxes on the sign-up form and customer-information forms.

### Required consent checkbox

This checkbox must be required before submission:

```txt
I have read and agree to the Terms and Conditions and acknowledge the Privacy Policy.
```

The words `Terms and Conditions` must link to `/terms-and-conditions`.

The words `Privacy Policy` must link to `/privacy-policy`.

The user must not be able to submit the form unless this checkbox is checked.

### Optional marketing checkbox

Add a separate optional checkbox if the app collects marketing consent:

```txt
I agree to receive promotional messages, updates, and offers. I understand that I can unsubscribe or withdraw my consent at any time.
```

This checkbox must not be required.

Do not bundle marketing consent with account creation, checkout, inquiry submission, or other necessary service actions.

### Customer information forms

For customer forms that collect personal information, show a short notice near the submit button:

```txt
By submitting this form, you agree that [App Name] may collect and process your information to handle your request, provide the service, contact you, and comply with applicable laws. Please review our Privacy Policy.
```

`Privacy Policy` must link to `/privacy-policy`.

If the form creates an account, order, booking, inquiry, or customer record, include the required consent checkbox.

---

## Validation behavior

For every form with the required legal consent checkbox:

- Default state: unchecked
- Submit button may be disabled until checked, or validation may show an error after submit
- Error message must be clear and human-readable:

```txt
Please agree to the Terms and Conditions and acknowledge the Privacy Policy before continuing.
```

Do not silently fail.

---

## Accessibility requirements

- The checkbox must have a visible label.
- The label must be associated with the checkbox input.
- Links inside the label must be keyboard accessible.
- Error text must be readable by screen readers if the app already has accessibility patterns.
- The legal pages must use semantic headings.
- The footer links must be keyboard accessible.

---

## BDD specification

Use this behavior-driven development specification as the implementation guide.

### Feature: Legal pages are available to users

#### Scenario: User opens the Privacy Policy page

Given a user is on the web app  
When the user navigates to `/privacy-policy`  
Then the user should see the Privacy Policy / Privacy Notice content  
And the content should be rendered from `/content/legal/privacy-policy.md`  
And the page should include a last updated date  
And the page should include contact placeholders or configured contact details  

#### Scenario: User opens the Terms and Conditions page

Given a user is on the web app  
When the user navigates to `/terms-and-conditions`  
Then the user should see the Terms and Conditions content  
And the content should be rendered from `/content/legal/terms-and-conditions.md`  
And the page should include a last updated date  
And the page should include a governing law section for the Republic of the Philippines  

#### Scenario: User can find legal pages from the footer

Given a user is on a public-facing page  
When the user views the footer  
Then the footer should show a Privacy Policy link  
And the footer should show a Terms and Conditions link  
And each link should navigate to the correct legal page  

---

### Feature: User must consent before submitting customer information

#### Scenario: Sign-up form requires legal consent

Given a user is on the sign-up page  
And the legal consent checkbox is unchecked  
When the user tries to submit the sign-up form  
Then the form should not submit  
And the user should see the message:  
`Please agree to the Terms and Conditions and acknowledge the Privacy Policy before continuing.`  

#### Scenario: Sign-up form submits when required consent is checked

Given a user is on the sign-up page  
And the user has completed all required fields  
And the user checks the required legal consent checkbox  
When the user submits the form  
Then the form should continue with the normal sign-up flow  

#### Scenario: Terms and Privacy links are visible in the consent label

Given a user is on a form with legal consent  
When the user reads the legal consent label  
Then the words `Terms and Conditions` should link to `/terms-and-conditions`  
And the words `Privacy Policy` should link to `/privacy-policy`  

#### Scenario: Marketing consent is optional

Given a form includes a marketing consent checkbox  
When the user leaves the marketing consent checkbox unchecked  
And the user completes the required fields  
And the user checks the required legal consent checkbox  
Then the user should still be able to submit the form  

---

### Feature: Customer information forms show a privacy notice

#### Scenario: Customer form displays short privacy notice

Given a user is filling out a customer-information form  
When the user reaches the submit area  
Then the user should see a short privacy notice explaining why the information is collected  
And the notice should include a link to the Privacy Policy  

#### Scenario: Customer form blocks submission without required consent

Given a customer-information form collects personal information  
And the required legal consent checkbox is unchecked  
When the user submits the form  
Then the form should not submit  
And the user should see the required legal consent error message  

---

## Suggested implementation approach

1. Inspect the existing project structure.
2. Identify the routing system.
3. Identify the shared layout/footer component.
4. Create markdown files for the Privacy Policy and Terms and Conditions.
5. Create or update legal page routes:
   - `/privacy-policy`
   - `/terms-and-conditions`
6. Render markdown safely using the project’s existing markdown renderer if available.
7. If no markdown renderer exists, add a lightweight, standard markdown rendering approach appropriate for the framework.
8. Add footer links to the legal pages.
9. Create a reusable legal consent component if the app has multiple forms.

Suggested reusable component name:

```txt
LegalConsentCheckbox
```

Suggested props:

```ts
type LegalConsentCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  showMarketingConsent?: boolean;
  marketingChecked?: boolean;
  onMarketingChange?: (checked: boolean) => void;
};
```

Use the existing form state management library if the app already has one.

---

## Suggested reusable text constants

Create constants only if it fits the project convention:

```ts
export const LEGAL_CONSENT_LABEL =
  "I have read and agree to the Terms and Conditions and acknowledge the Privacy Policy.";

export const MARKETING_CONSENT_LABEL =
  "I agree to receive promotional messages, updates, and offers. I understand that I can unsubscribe or withdraw my consent at any time.";

export const LEGAL_CONSENT_ERROR =
  "Please agree to the Terms and Conditions and acknowledge the Privacy Policy before continuing.";

export const SHORT_PRIVACY_NOTICE =
  "By submitting this form, you agree that [App Name] may collect and process your information to handle your request, provide the service, contact you, and comply with applicable laws. Please review our Privacy Policy.";
```

Replace `[App Name]` with the app’s configured name if available.

---

## Data handling notes

If the backend stores consent, add fields only if the existing architecture supports it.

Recommended optional fields:

```txt
termsAcceptedAt
privacyAcknowledgedAt
marketingConsent
marketingConsentAt
```

Do not create database migrations unless this project already has a backend/database setup and the implementation clearly requires it.

If consent records are stored, store timestamps in ISO format.

---

## UI expectations

- Legal pages should look clean and readable.
- Use the app’s existing typography, spacing, layout, and theme.
- Do not create a visually disconnected design.
- Legal pages should be responsive on mobile.
- Footer links should be subtle but easy to find.
- The consent checkbox should be close to the submit button.

---

## Do not do these

- Do not hardcode legal text directly inside route/page components.
- Do not hide Privacy Policy or Terms links only inside the footer.
- Do not require marketing consent.
- Do not use vague consent text such as “I agree to everything.”
- Do not collect extra sensitive information unless the existing app already requires it.
- Do not replace existing business logic unless necessary.
- Do not introduce a large dependency if a simpler markdown rendering approach already exists.
- Do not write tests in TDD style. Use BDD-style acceptance criteria and user-flow validation.

---

## Final deliverables

After implementation, summarize:

1. Files created or changed
2. Where to edit the Privacy Policy content
3. Where to edit the Terms and Conditions content
4. Which routes were added
5. Which forms received consent checkboxes
6. Any assumptions made
7. Any manual legal review still needed

---

## Placeholder Privacy Policy content

Create this file:

```txt
/content/legal/privacy-policy.md
```

With content similar to:

```md
# Privacy Policy / Privacy Notice

Last updated: [Month Day, Year]

## 1. Introduction

[App Name] is operated by [Business/Company Name]. This Privacy Policy / Privacy Notice explains how we collect, use, store, share, and protect personal information when you use our website, web app, forms, products, or services.

This notice is prepared with consideration for Republic Act No. 10173, also known as the Data Privacy Act of 2012, and applicable guidance from the National Privacy Commission of the Philippines.

Please replace all bracketed placeholders with your actual business information before publishing this page.

## 2. Personal Information We Collect

Depending on how you use [App Name], we may collect the following information:

- Name
- Email address
- Mobile number or telephone number
- Address or delivery/location details
- Account login details
- Order, booking, inquiry, or transaction details
- Payment-related information, where applicable
- Messages, support requests, and communication records
- Device, browser, IP address, logs, and usage information
- Other information you voluntarily provide through our forms or services

We aim to collect only the information that is necessary for the purpose explained to you.

## 3. How We Collect Personal Information

We may collect personal information when you:

- Create an account
- Submit a form
- Place an order or booking
- Contact customer support
- Subscribe to updates or promotions
- Use our website or web app
- Interact with our pages, messages, or services

## 4. Why We Collect and Use Your Personal Information

We may use your personal information to:

- Create and manage your account
- Process orders, bookings, inquiries, or service requests
- Contact you about your account, transaction, or request
- Provide customer support
- Send service-related notices
- Improve our website, web app, products, and services
- Prevent fraud, abuse, or unauthorized access
- Comply with legal, regulatory, tax, accounting, or reporting obligations
- Send promotional messages only when you have provided separate consent, where required

## 5. Legal Basis and Consent

We process personal information based on applicable lawful grounds, which may include your consent, the need to perform a service or contract with you, compliance with legal obligations, legitimate business interests, or other grounds allowed under Philippine law.

Where consent is required, we will ask for clear and specific consent. You may withdraw consent where applicable, subject to legal or contractual restrictions.

## 6. How We Share Personal Information

We may share personal information with trusted third parties when necessary to operate our services, such as:

- Hosting and cloud service providers
- Payment processors
- Delivery, logistics, or fulfillment partners
- Customer support and communication tools
- Analytics or security service providers
- Professional advisers, where necessary
- Government authorities, regulators, or law enforcement when required by law

We do not sell personal information.

## 7. Data Retention

We keep personal information only for as long as necessary to fulfill the purposes described in this notice, comply with legal obligations, resolve disputes, maintain business records, and enforce agreements.

Retention periods may vary depending on the type of information and the reason it was collected.

## 8. Data Security

We use reasonable organizational, technical, and physical safeguards to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure.

Examples may include access controls, secure passwords, encrypted connections, limited administrative access, monitoring, and regular review of security practices.

However, no online system can be guaranteed to be completely secure.

## 9. Cookies and Similar Technologies

We may use cookies and similar technologies to operate the website, remember preferences, improve performance, analyze usage, and support security.

If we use analytics, advertising, or tracking tools, we will provide appropriate notice and consent options where required.

## 10. Your Rights as a Data Subject

Under the Data Privacy Act of 2012, you may have rights as a data subject, including the right to:

- Be informed about how your personal information is collected and processed
- Access your personal information
- Object to certain types of processing
- Correct inaccurate or outdated information
- Request deletion, blocking, or removal of personal information, where allowed by law
- Withdraw consent, where processing is based on consent
- File a complaint with the National Privacy Commission
- Claim damages where applicable under law
- Exercise other rights provided under applicable data privacy laws and regulations

## 11. Withdrawal of Consent

Where we rely on your consent, you may withdraw it by contacting us at [Privacy Contact Email].

Withdrawal of consent may affect our ability to provide certain services if the information is necessary to complete your request or transaction.

## 12. Children’s Privacy

Our services are not intended for children below the age required by applicable law without the consent or supervision of a parent or legal guardian.

If you believe that a child has provided personal information without proper consent, please contact us.

## 13. Third-Party Links

Our website or web app may contain links to third-party websites, apps, or services. We are not responsible for the privacy practices, content, or security of those third parties.

## 14. Changes to this Privacy Notice

We may update this Privacy Policy / Privacy Notice from time to time. Updates will be posted on this page with a new “Last updated” date.

## 15. Contact Us

For privacy questions, requests, or concerns, you may contact:

[Business/Company Name]  
[Business Address]  
Email: [Privacy Contact Email]  
Phone: [Phone Number]

You may also contact the National Privacy Commission of the Philippines if you believe your data privacy rights have been violated.

## 16. Legal Review Notice

This Privacy Policy / Privacy Notice is a placeholder template and is not legal advice. Before using this in production, please have it reviewed by a qualified legal professional or data privacy adviser.
```

---

## Placeholder Terms and Conditions content

Create this file:

```txt
/content/legal/terms-and-conditions.md
```

With content similar to:

```md
# Terms and Conditions

Last updated: [Month Day, Year]

## 1. Acceptance of Terms

By accessing or using [App Name], you agree to these Terms and Conditions. If you do not agree, please do not use the website, web app, products, or services.

These Terms apply to all users, customers, visitors, and others who access or use [App Name].

## 2. About the Service

[App Name] is operated by [Business/Company Name]. The service allows users to [briefly describe what the web app does, such as create an account, submit customer information, place orders, book services, or send inquiries].

Please replace all bracketed placeholders with your actual business information before publishing this page.

## 3. User Accounts and Customer Information

You may be required to provide certain personal information to create an account, submit a form, place an order, book a service, or contact us.

You agree to provide accurate, complete, and updated information. You are responsible for keeping your account login details secure and for activities that occur under your account.

## 4. User Responsibilities

You agree not to:

- Provide false, misleading, or unauthorized information
- Use the service for illegal, harmful, abusive, fraudulent, or unauthorized purposes
- Interfere with the operation or security of the service
- Attempt to access accounts, systems, or data that you are not authorized to access
- Copy, modify, distribute, or exploit the service without permission

## 5. Orders, Bookings, Payments, or Transactions

If [App Name] allows orders, bookings, payments, subscriptions, or other transactions, you agree to provide accurate transaction information and comply with the applicable payment, confirmation, delivery, cancellation, and refund terms shown at the time of transaction.

[Add business-specific transaction terms here.]

## 6. Cancellations, Refunds, and Service Changes

Cancellations, refunds, returns, rescheduling, and service changes are subject to the policy of [Business/Company Name].

[Refund/Cancellation Policy Placeholder]

We may update, modify, suspend, or discontinue parts of the service when necessary.

## 7. Acceptable Use

You must use [App Name] only for lawful purposes and in accordance with these Terms.

We reserve the right to restrict, suspend, or terminate access if we believe that a user has violated these Terms, harmed other users, submitted fraudulent information, or misused the service.

## 8. Intellectual Property

Unless otherwise stated, the website, web app, design, text, graphics, logos, features, and other content are owned by or licensed to [Business/Company Name].

You may not copy, reproduce, modify, distribute, sell, or exploit any part of the service without prior written permission.

## 9. Third-Party Services

The service may use or link to third-party services such as payment processors, logistics providers, analytics tools, messaging tools, or external websites.

We are not responsible for the content, policies, availability, or practices of third-party services.

## 10. Disclaimers

We aim to keep the service accurate, available, and secure, but we do not guarantee that it will always be uninterrupted, error-free, or free from security risks.

The service is provided on an “as is” and “as available” basis, unless otherwise required by law.

## 11. Limitation of Liability

To the maximum extent allowed by applicable law, [Business/Company Name] will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service.

Nothing in these Terms excludes liability that cannot be excluded under applicable law.

## 12. Suspension or Termination

We may suspend or terminate your access to [App Name] if you violate these Terms, misuse the service, create risk for other users, or if required by law.

You may stop using the service at any time.

## 13. Privacy

Your use of [App Name] is also governed by our Privacy Policy / Privacy Notice, which explains how we collect, use, store, share, and protect personal information.

Please review the Privacy Policy at `/privacy-policy`.

## 14. Changes to these Terms

We may update these Terms and Conditions from time to time. Updates will be posted on this page with a new “Last updated” date.

Your continued use of the service after changes are posted means you accept the updated Terms.

## 15. Governing Law

These Terms and Conditions are governed by the laws of the Republic of the Philippines, unless otherwise required by applicable law.

Any disputes will be handled in the proper courts or venues of the Philippines, unless the parties agree otherwise or applicable law requires a different process.

## 16. Contact Us

For questions about these Terms, you may contact:

[Business/Company Name]  
[Business Address]  
Email: [Contact Email]  
Phone: [Phone Number]

## 17. Legal Review Notice

These Terms and Conditions are a placeholder template and are not legal advice. Before using this in production, please have them reviewed by a qualified legal professional.
```
