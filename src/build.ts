import { buildSync, transformSync } from 'esbuild'
export const buildModule = (fullPath: string, isTs = true) => {
  const result = buildSync({
    entryPoints: [fullPath],
    outfile: 'out.js',
    write: false,
    platform: 'browser',
    bundle: false,
    format: isTs ? 'esm' : 'cjs',
  })
  const { text } = result.outputFiles[0]
  return text
}

export const transformModule = (text: string) => {
  return transformSync(text)
}
