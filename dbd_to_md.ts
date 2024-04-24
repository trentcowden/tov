import { writeFileSync } from 'fs'
import TurndownService from 'turndown'
import dbd from './data/DictBDB.json'
const defs = {}

dbd.forEach((word, index) => {
  const turndown = new TurndownService()
  const markdown = turndown.turndown(word.def)
  defs[word.top] = markdown
})

writeFileSync('./data/bdbMd.json', JSON.stringify(defs))
