import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const distDirectory = resolve('dist')
const indexPath = resolve(distDirectory, 'index.html')
const index = await readFile(indexPath, 'utf8')
const robotsMeta = '    <meta name="robots" content="noindex, nofollow" />\n'

if (!index.includes('name="robots"')) {
  await writeFile(indexPath, index.replace(/  <head>\r?\n/, `  <head>\n${robotsMeta}`))
}

await writeFile(resolve(distDirectory, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
