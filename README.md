# xihui metadata governance evidence

Public, redacted release-candidate evidence for the xihui metadata-governance
system. This repository deliberately contains no customer records, credentials,
private keys, database connection strings, or backup data.

Evidence is consumed only through commit-addressed `raw.githubusercontent.com`
URIs and SHA-256 digests in a separately signed baseline manifest. The public
keys in `keys/` identify the owner and independent-review receipts; they cannot
be used to sign new evidence.

Release candidate source identities:

- xihui: `f8d905b57b3f65de349d7c252ecaeed347c80bc8`
- metadata-core: `29cf1bb0191f0f1d916eef8ac4cdeff5f60069ab`

The reports were produced against an isolated PostgreSQL clone. Its database
identity is represented only by a SHA-256 fingerprint in the signed manifest.
Public, redacted, signed release evidence for xihui metadata governance
