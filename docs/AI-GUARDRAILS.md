## General Guardrails

AI agents must not:

- Invent features not written in the spec.
- Modify unrelated files.
- Rewrite large parts of the app without approval.
- Change database schema without a migration plan.
- Add new dependencies without justification.
- Remove tests without explanation.
- Disable linting, typechecking, or security checks.
- Hardcode secrets, API keys, or credentials.
- Change authentication or authorization logic casually.
- Replace existing architecture patterns without permission.