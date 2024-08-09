import { writeFileSync } from 'fs'
import index from '../data/index.json'
import lexicalIndex from '../data/lexicalIndex.json'
import wlc from '../data/wlc.json'

type WlcWord = [string, string, string]
const newObj = {}

const bookMap = {
  Genesis: 'GEN',
  Exodus: 'EXO',
  Leviticus: 'LEV',
  Numbers: 'NUM',
  Deuteronomy: 'DEU',
  Joshua: 'JOS',
  Judges: 'JDG',
  Ruth: 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  Ezra: 'EZR',
  Nehemiah: 'NEH',
  Esther: 'EST',
  Job: 'JOB',
  Psalms: 'PSA',
  Proverbs: 'PRO',
  Ecclesiastes: 'ECC',
  'Song of Songs': 'SNG',
  Isaiah: 'ISA',
  Jeremiah: 'JER',
  Lamentations: 'LAM',
  Ezekiel: 'EZK',
  Daniel: 'DAN',
  Hosea: 'HOS',
  Joel: 'JOL',
  Amos: 'AMO',
  Obadiah: 'OBA',
  Jonah: 'JON',
  Micah: 'MIC',
  Nahum: 'NAM',
  Habakkuk: 'HAB',
  Zephaniah: 'ZEP',
  Haggai: 'HAG',
  Zechariah: 'ZEC',
  Malachi: 'MAL',
  Matthew: 'MAT',
  Mark: 'MRK',
  Luke: 'LUK',
  John: 'JHN',
  Acts: 'ACT',
  Romans: 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  Galatians: 'GAL',
  Ephesians: 'EPH',
  Philippians: 'PHP',
  Colossians: 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  Titus: 'TIT',
  Philemon: 'PHM',
  Hebrews: 'HEB',
  James: 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  Jude: 'JUD',
  Revelation: 'REV',
}

const defMap = {}
const strongMap = {}
const bdbMap = {}
const twotMap = {}
const latinMap = {}
const idMap = {}

Object.keys(wlc).forEach((book) => {
  if (!(book in bookMap)) console.log(book)

  newObj[bookMap[book]] = wlc[book].map((chapter: WlcWord[][]) => {
    return chapter.map((verse) => {
      return verse.map((word) => {
        const wordObj = [word[0]]

        let augId = word[1]
        augId = augId.replace(/[a-z]\//g, '')
        augId = augId.replace(/ /g, '')
        augId = augId.replace(/\+/g, '')
        const match = index.find((entry) => entry['@aug'] === augId)

        if (!match) {
          console.log(
            'original id',
            word[1],
            'augmented id',
            augId,
            'not found in index'
          )
          return null
        }

        const lexId = match['#text']
        idMap[augId] = lexId
        wordObj.push(lexId)

        const lexicalIndexMatch = lexicalIndex.find(
          (entry) => entry['@id'] === lexId
        )
        if (!lexicalIndexMatch) {
          console.log(lexId, 'not found in lexical index')
          return wordObj
        }

        if ('w' in lexicalIndexMatch && '@xlit' in lexicalIndexMatch['w'])
          latinMap[lexId] = lexicalIndexMatch.w['@xlit']
        if ('def' in lexicalIndexMatch) defMap[lexId] = lexicalIndexMatch.def
        if ('@strong' in lexicalIndexMatch.xref)
          strongMap[lexId] = lexicalIndexMatch.xref['@strong']
        if ('@bdb' in lexicalIndexMatch.xref)
          bdbMap[lexId] = lexicalIndexMatch.xref['@bdb']
        if ('@twot' in lexicalIndexMatch.xref)
          twotMap[lexId] = lexicalIndexMatch.xref['@twot']

        return wordObj
      })
    })
  })
})

writeFileSync('./data/hebrew/hebrew.json', JSON.stringify(newObj))
writeFileSync('./data/hebrew/defMap.json', JSON.stringify(defMap))
writeFileSync('./data/hebrew/strongMap.json', JSON.stringify(strongMap))
writeFileSync('./data/hebrew/bdbMap.json', JSON.stringify(bdbMap))
writeFileSync('./data/hebrew/twotMap.json', JSON.stringify(twotMap))
writeFileSync('./data/hebrew/latinMap.json', JSON.stringify(latinMap))
writeFileSync('./data/hebrew/idMap.json', JSON.stringify(idMap))
