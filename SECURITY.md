# Security Policy

Thank you for helping keep @bquery/ui and its users safe.

## Supported versions

Security fixes are provided for the latest release of @bquery/ui.

| Version  | Supported          |
| -------- | ------------------ |
| 1.14.x   | :white_check_mark: |
| < 1.14.0 | :x:                |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Report them privately via one of the following:

1. **GitHub Security Advisories (preferred):** open a private report via the "Report a vulnerability" workflow on this repository.
2. **Email:** contact <support@josunlp.de> with the details below.

Please include:

- A description of the vulnerability and its impact.
- The affected @bquery/ui version(s) and component(s).
- A minimal reproduction: code snippet or step-by-step instructions.
- Any proof-of-concept, stack traces, or logs.

## Disclosure process

1. **Acknowledgement** within **5 business days**.
2. **Triage** within **10 business days** of acknowledgement.
3. **Fix and release** — high-severity issues within **30 days** of validation.
4. **Public advisory** once a fix is available, with credit if you wish.

## Scope

In scope:
- Source code in this repository (`src/**`) and the published `@bquery/ui` package on npm.
- Component rendering, slot injection, and sanitization behaviour.
- Design token and theme APIs that could be misused to inject unsafe content.

Out of scope:
- Vulnerabilities in third-party applications that merely consume @bquery/ui components.
- Issues that require an already-compromised environment.
- Theoretical issues without a demonstrable security impact.

Thank you for helping make @bquery/ui safer for everyone.
