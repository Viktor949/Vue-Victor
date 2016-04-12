import { parse } from './html-parser'
import { generate } from './codegen/index'

const cache = Object.create(null)

export function compile (html, preserveWhiteSpace) {
  html = html.trim()
  const hit = cache[html]
  return hit || (cache[html] = generate(parse(html, preserveWhiteSpace)))
}
