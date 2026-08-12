# xihui metadata governance evidence

Public, redacted release-candidate evidence for the xihui metadata-governance
system. This repository deliberately contains no customer records, credentials,
private keys, database connection strings, or backup data.

Evidence is consumed only through commit-addressed `raw.githubusercontent.com`
URIs and SHA-256 digests in a separately signed baseline manifest. The public
keys in `keys/` identify the owner and independent-review receipts; they cannot
be used to sign new evidence.

Release candidate source identities:

- xihui: `d091cf0b74135cbe3665c5f9c6c8edc4c887db50`
- metadata-core: `2ff6276cd49a84a3c65f6426e51682b7431d8b69`

The reports were produced against an isolated PostgreSQL clone. Its database
identity is represented only by a SHA-256 fingerprint in the signed manifest.
Public, redacted, signed release evidence for xihui metadata governance
