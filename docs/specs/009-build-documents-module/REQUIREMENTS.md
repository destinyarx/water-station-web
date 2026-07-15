# Document storage requirements

- When a user submits document metadata, the system shall require one PDF, PNG, JPEG, or WEBP file no larger than 10 MiB.
- When a valid upload is submitted, the system shall derive `org_id` and `created_by` from the authenticated Clerk session and store the file in the private `documents` bucket under an organization-prefixed path.
- If metadata, path persistence, or file upload fails, the system shall show a friendly error and shall not leave active metadata that claims a usable file.
- When an authorized user opens a document, the system shall issue a signed URL valid for 60 seconds.
- While a document has `visibility = only_me`, the system shall allow only its creator and an organization owner/admin to read its row or file.
- When metadata is soft-deleted, the system shall exclude it from active lists and retain the file until a separate purge workflow is specified.
