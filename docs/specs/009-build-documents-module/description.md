# 📦 DOCUMENTS MODULE — WATER REFILLING STATION SYSTEM (PRD + BUILD INSTRUCTION)

## Implementation
1. Use the file `docs\specs\009-build-documents-module\AquaFlow Documents.html` and make sure to rebuild this the behavior as well as the design should be 1:1 copy but in a react + tailwind css.
2. For the backend logic you ,ust follow the AGENTS.md and dont impliment the upload logic just upload to the resulting table that you will come up.
3. Make sure that the design is the same to the rebuild one you will build using react + tailwind css


## ⚠️ IMPORTANT SCOPE CLARIFICATION

This instruction explicitly **EXCLUDES file upload implementation**.

You MUST NOT implement:
- Supabase Storage upload logic
- File transfer logic
- File compression
- Signed URL generation logic for upload

👉 The upload system will be built separately.

You will only build:
1. PostgreSQL schema (migration)
2. Form and Document metadata saving system (thsi can be a single table since i only need the original_name of the uploaded file) Check the html file what are the other data you should need to capture.
3. Document management module (React + TypeScript + Tailwind)

---

# 1. 📊 POSTGRESQL SCHEMA MIGRATION (SUPABASE)

Create the migration file in postgreSQL.
Save the migration inside this working directory: `docs\specs\009-build-documents-module` and name it 'documents_table_migration.sql'



## Constraints:

- build the UI exactly like in the attach claude design file.
- It should be a react + tailwind css avoid plain css when converting the html design to my module in the app. Just use the css and etc if there is no way this could be recreated in react + tailwind css.
- Make sure that the scope is only limited in documents module.
- Make sure to follow the clean code principles, typescript, tailwindcss.
- Update the `docs/DESIGN.md` to match the design system of the attach html files build by claude design.
- all files or markdown produce by the /skills i used should only be created inside the cuirrent working path except for the ADR which should be put here  `docs\adr`.
> **2026-07-15 storage addendum:** The earlier metadata-only upload exclusion below is superseded by the approved fable-review ISS-006 implementation. The current feature includes private Supabase Storage upload and short-lived signed URLs as specified in `REQUIREMENTS.md` and `ACCEPTANCE.md`.
