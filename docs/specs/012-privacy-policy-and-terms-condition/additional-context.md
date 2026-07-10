
---

# Content Location

Do not hardcode legal text inside React components.

Create:


---


Legal pages should render markdown content.

---

# Footer Placement

Add footer links:


---


Store timestamps using ISO format.

Do not create unnecessary migrations.

---

# Acceptance Criteria (BDD)

## Feature: Privacy Policy Page

Scenario:

Given a user opens the application

When they visit:

/privacy-policy

Then:

- Privacy Policy content is displayed
- Content comes from markdown file
- Page is responsive
- Last updated date is visible


---

## Feature: Terms Page

Scenario:

Given a user visits:

/terms-and-conditions

Then:

- Terms content appears
- Governing law mentions Philippines
- Content comes from markdown file


---

## Feature: User Consent

Scenario:

Given a user signs up

And legal consent is unchecked

When they submit

Then:

Submission must fail.

Show:

"Please agree to the Terms and Conditions and acknowledge the Privacy Policy before continuing."


---

## Feature: Footer Navigation

Given a visitor opens the website

Then footer contains:

- Privacy Policy
- Terms and Conditions

---

# UI Requirements

Keep design consistent with the existing application.

Requirements:

- Responsive
- Mobile friendly
- Accessible
- Clean typography
- No separate unrelated design system

---

# Do Not

Do not:

- Hardcode legal content inside pages
- Hide legal links
- Require marketing consent
- Collect unnecessary personal information
- Add large dependencies
- Rewrite existing business logic
- Create unnecessary database changes

---

# Final Output After Implementation

Provide:

1. Files created
2. Files modified
3. New routes
4. Updated components
5. Forms using legal consent
6. Assumptions made
7. Remaining legal review requirements
