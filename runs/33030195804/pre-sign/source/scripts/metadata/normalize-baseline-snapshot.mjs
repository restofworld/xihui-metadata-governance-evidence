import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const readArgument = name => {
  const prefix = `--${name}=`
  return process.argv.find(argument => argument.startsWith(prefix))?.slice(prefix.length)
}

const canonicalize = value => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value)
      .sort()
      .reduce((normalized, key) => ({ ...normalized, [key]: canonicalize(value[key]) }), {})
  }
  return value
}

const inputPath = readArgument('input')
if (!inputPath) throw new Error('--input=<snapshot.json> is required')

const resolvedInputPath = path.resolve(inputPath)
const input = fs.readFileSync(resolvedInputPath, 'utf8')
const parsed = JSON.parse(input)
const normalized = JSON.stringify(canonicalize(parsed))
process.stdout.write(`${JSON.stringify({
  normalizer: 'xihui/scripts/metadata/normalize-baseline-snapshot.mjs',
  inputSha256: createHash('sha256').update(input).digest('hex'),
  normalizedSha256: createHash('sha256').update(normalized).digest('hex'),
  normalized: JSON.parse(normalized),
})}\n`)
