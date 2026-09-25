# Security Policy

## Supported scope

DevMind AI is an early-stage browser application. Security reports about credential exposure, unsafe request construction, XSS, dependency issues, or accidental secret inclusion are welcome.

## Reporting

Please do not publish credentials or an exploitable proof of concept in a public issue. Contact the repository maintainer privately through GitHub with:

- a clear description of the issue;
- reproduction steps;
- affected files or components;
- impact and any suggested mitigation.

## Credential handling

DevMind AI does not persist provider API keys to localStorage. However, direct browser requests necessarily expose a user-entered key to the browser environment. Treat direct-provider mode as a local experimentation feature, not as a secure multi-user gateway.

For production deployments, use a server-side proxy with authentication, authorization, rate limiting, request validation, logging controls, and server-side secret storage.
