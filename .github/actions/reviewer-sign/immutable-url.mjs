export const assertImmutableManifestUrl = (value) => {
  if (
    !/^https:\/\/raw\.githubusercontent\.com\/restofworld\/xihui-metadata-governance-evidence\/[a-f0-9]{40}\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/.test(value)
  ) {
    throw new Error('Manifest URL must be a query-free raw GitHub URL pinned to a full evidence commit')
  }
  const url = new URL(value)
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'raw.githubusercontent.com' ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error('Manifest URL must be a query-free raw GitHub URL pinned to a full evidence commit')
  }
  return url
}
