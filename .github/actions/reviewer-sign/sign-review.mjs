import { createHash, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { assertImmutableManifestUrl } from './immutable-url.mjs'

const requiredEnvironment = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

const sha256 = (value) => createHash('sha256').update(value).digest('hex')

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .reduce((normalized, key) => {
        normalized[key] = canonicalize(value[key])
        return normalized
      }, {})
  }
  return value
}

const reviewPayload = (manifest) => JSON.stringify(canonicalize({
  project: manifest.project,
  sources: manifest.sources,
  normalizer: manifest.normalizer,
  databaseFingerprintSha256: manifest.databaseFingerprintSha256,
  bundleContentDigestSha256: manifest.bundleContentDigestSha256,
  releaseCandidate: {
    ...manifest.releaseCandidate,
    reviewAttestation: {
      ...manifest.releaseCandidate.reviewAttestation,
      signedPayloadSha256: undefined,
      signatureBase64: undefined,
    },
  },
  artifacts: [...manifest.artifacts].sort((left, right) => left.kind.localeCompare(right.kind)),
}))

const manifestUrl = requiredEnvironment('INPUT_MANIFEST_URL')
const expectedManifestSha256 = requiredEnvironment('INPUT_MANIFEST_SHA256')
const expectedPublicKeySha256 = requiredEnvironment('INPUT_EXPECTED_PUBLIC_KEY_SHA256')
const expectedKeyId = requiredEnvironment('INPUT_EXPECTED_KEY_ID')
const expectedIssuer = requiredEnvironment('INPUT_EXPECTED_ISSUER')
const privateKeyPem = requiredEnvironment('INPUT_PRIVATE_KEY')

if (!/^[a-f0-9]{64}$/.test(expectedManifestSha256) || !/^[a-f0-9]{64}$/.test(expectedPublicKeySha256)) {
  throw new Error('Manifest and public-key fingerprints must be lowercase SHA-256 values')
}

const url = assertImmutableManifestUrl(manifestUrl)

const response = await fetch(url, { redirect: 'manual' })
if (response.status !== 200) throw new Error(`Manifest download failed without redirect: HTTP ${response.status}`)
const manifestBytes = Buffer.from(await response.arrayBuffer())
if (sha256(manifestBytes) !== expectedManifestSha256) throw new Error('Manifest SHA-256 mismatch')

const privateKey = createPrivateKey(privateKeyPem)
const publicKey = createPublicKey(privateKey)
const actualPublicKeySha256 = sha256(publicKey.export({ type: 'spki', format: 'der' }))
if (actualPublicKeySha256 !== expectedPublicKeySha256) throw new Error('Reviewer private key is not the trusted key')

const manifest = JSON.parse(manifestBytes.toString('utf8'))
const review = manifest?.releaseCandidate?.reviewAttestation
if (!review || review.keyId !== expectedKeyId || review.issuer !== expectedIssuer || review.decision !== 'approved') {
  throw new Error('Manifest reviewer identity does not match the trusted signing policy')
}
if (review.signatureBase64 || review.signedPayloadSha256) throw new Error('Manifest already contains a review signature')
if (manifest?.ownerAttestation?.signatureBase64 || manifest?.ownerAttestation?.signedPayloadSha256) {
  throw new Error('Review signing must happen before owner signing')
}

const payload = reviewPayload(manifest)
review.signedPayloadSha256 = sha256(payload)
review.signatureBase64 = sign('sha256', Buffer.from(payload), privateKey).toString('base64')
if (!verify('sha256', Buffer.from(payload), publicKey, Buffer.from(review.signatureBase64, 'base64'))) {
  throw new Error('Generated reviewer signature did not verify')
}

const outputPath = path.join(requiredEnvironment('RUNNER_TEMP'), 'manifest.reviewed.json')
const outputBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)
fs.writeFileSync(outputPath, outputBytes, { mode: 0o600 })
const reviewedSha256 = sha256(outputBytes)
fs.appendFileSync(requiredEnvironment('GITHUB_OUTPUT'), `reviewed_sha256=${reviewedSha256}\n`)
fs.appendFileSync(requiredEnvironment('GITHUB_STEP_SUMMARY'), `Reviewer-signed manifest SHA-256: \`${reviewedSha256}\`\n`)
