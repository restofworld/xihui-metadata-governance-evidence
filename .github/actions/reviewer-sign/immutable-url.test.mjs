import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { assertImmutableManifestUrl } from './immutable-url.mjs'

const commit = 'a'.repeat(40)

describe('reviewer signing immutable URL policy', () => {
  it('accepts only a raw evidence URL pinned to a full lowercase commit', () => {
    assert.equal(
      assertImmutableManifestUrl(
        `https://raw.githubusercontent.com/restofworld/xihui-metadata-governance-evidence/${commit}/release/manifest.json`,
      ).pathname,
      `/restofworld/xihui-metadata-governance-evidence/${commit}/release/manifest.json`,
    )
  })

  it('rejects a mutable branch even when the query contains a commit-shaped value', () => {
    assert.throws(
      () => assertImmutableManifestUrl(
        `https://raw.githubusercontent.com/restofworld/xihui-metadata-governance-evidence/main/manifest.json?pin=/${commit}/`,
      ),
      /pinned to a full evidence commit/,
    )
  })

  it('rejects redirects, fragments, credentials, ports, and encoded paths at the input boundary', () => {
    for (const url of [
      `https://raw.githubusercontent.com/restofworld/xihui-metadata-governance-evidence/${commit}/manifest.json#fragment`,
      `https://user@raw.githubusercontent.com/restofworld/xihui-metadata-governance-evidence/${commit}/manifest.json`,
      `https://raw.githubusercontent.com:443/restofworld/xihui-metadata-governance-evidence/${commit}/manifest.json`,
      `https://raw.githubusercontent.com/restofworld/xihui-metadata-governance-evidence/${commit}/manifest%2Ejson`,
    ]) {
      assert.throws(() => assertImmutableManifestUrl(url), /pinned to a full evidence commit/)
    }
  })
})
