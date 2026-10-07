# Digify CX Landing Page

Static HTML/CSS/JavaScript site. No package manifest or application backend is present in the inspected root. index.html loads script.js; app.js is a separate file not loaded by that page.

## Technical handover and dependencies

- [Technical handover](HANDOVER.md): ownership, setup, credential rotation, verification and recovery.
- [Dependency and API/OAuth configuration list](DEPENDENCIES.md): runtime, external services and configuration inventory.

**Handover requirement:** all API/OAuth credentials and related shared/deployment secrets in use must be rotated or reissued, configured and tested under the receiving owner. Completion must be recorded; these documentation changes do not rotate live credentials.

## Local preview

Serve the repository root using a static web server, for example:

```sh
python -m http.server 8000
```

Open http://localhost:8000. No npm build is defined in this repository.

## Source and external dependencies

- `index.html` — page content, CDN dependencies and script entry point.
- `styles.css` and `script.js` — active styling and interactions.
- `assets/` — local images/media.
- `app.js` — separate Formspree submission code; not loaded by current index.html.

The active contact form currently simulates completion. Verify and implement actual message delivery before treating it as an operational enquiry channel. Refer to [DEPENDENCIES.md](DEPENDENCIES.md) for external libraries and hosting handover requirements.
