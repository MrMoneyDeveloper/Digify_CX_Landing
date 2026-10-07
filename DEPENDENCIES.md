# Digify CX Landing Page — Dependencies and Configuration

Companion to [HANDOVER.md](HANDOVER.md). Based on repository documentation and configuration/source inspected on 7 October 2026; the live deployment must be reconciled before sign-off. Package manifests and lockfiles remain authoritative for exact transitive versions; this is the operational dependency list, not a frozen software bill of materials.

| Dependency | Required setup / configuration | Source or handover action |
| --- | --- | --- |
| Runtime | Static web host, browser, domain/DNS/TLS | index.html, styles.css, script.js, assets/ |
| External assets | Bootstrap 5.3.3 CDN; Three.js r134; Vanta clouds @latest; Google Fonts | Review pinned versions, availability and CSP before release; @latest is not reproducible. |
| Contact handling | index.html loads script.js with a simulated form completion; app.js contains a Formspree POST but is not loaded | Confirm the intended production delivery path and Formspree ownership before claiming messages reach an inbox. |
| Hosting credentials | Host, domain registrar/DNS and deployment integration access | Provider is not established by source; inventory actual host, deployment tokens and owner. |
| API/OAuth | No live secret-bearing API/OAuth configuration confirmed in the active page | If a form/backend integration is enabled, configure account ownership, endpoints and server-side credentials and add them to this list. |

## API and OAuth completion requirements

For **every enabled API/OAuth integration**, record its accountable owner, provider/project, credential name, scopes, secret-store location, endpoint/redirect URI, expiry/renewal behavior and dependent consumers in the private operations register. Rotate/reissue all applicable keys, client secrets, tokens, grants and deployment credentials; configure each consumer; test the new identity; then revoke the superseded credentials. See the ordered procedure in [HANDOVER.md](HANDOVER.md).

Never put secret values in this file. If the live environment has additional integrations, add their non-secret dependency details before handover sign-off. Items absent from inspected source are unverified, not automatically unnecessary. This documentation update does not perform credential rotation or modify runtime settings.
