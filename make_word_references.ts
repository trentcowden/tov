import { writeFileSync } from 'fs'
import wordIdMap from './data/hebrew/idMap.json'
import wordList from './data/word_list.json'

const dictionary = {}

const idMap = {
  Gen: 'GEN',
  Exod: 'EXO',
  Lev: 'LEV',
  Num: 'NUM',
  Deut: 'DEU',
  Josh: 'JOS',
  Judg: 'JDG',
  Ruth: 'RUT',
  '1Sam': '1SA',
  '2Sam': '2SA',
  '1Kgs': '1KI',
  '2Kgs': '2KI',
  '1Chr': '1CH',
  '2Chr': '2CH',
  Ezra: 'EZR',
  Neh: 'NEH',
  Esth: 'EST',
  Job: 'JOB',
  Ps: 'PSA',
  Prov: 'PRO',
  Eccl: 'ECC',
  Song: 'SNG',
  Isa: 'ISA',
  Jer: 'JER',
  Lam: 'LAM',
  Ezek: 'EZK',
  Dan: 'DAN',
  Hos: 'HOS',
  Joel: 'JOL',
  Amos: 'AMO',
  Obad: 'OBA',
  Jonah: 'JON',
  Mic: 'MIC',
  Nah: 'NAH',
  Hab: 'HAB',
  Zeph: 'ZEP',
  Hag: 'HAG',
  Zech: 'ZEC',
  Mal: 'MAL',
}

function convertToUsfm(reference: string) {
  if (typeof reference !== 'string') {
    console.log('Reference is not a string', reference)
  }
  const book = reference.split('.')[0]
  if (book in idMap) {
    return reference.replace(book, idMap[book])
  } else {
    console.log('No abbreviation found for', book)
    return reference
  }
}

wordList.forEach((word) => {
  const num = wordIdMap[word['@a']]

  if (!(num in dictionary)) {
    dictionary[num] = []
  }

  if (typeof word.r === 'string') {
    dictionary[num].push(convertToUsfm(word.r))
  } else if (Array.isArray(word.r)) {
    word.r.forEach((reference) => {
      if (typeof reference === 'string') {
        dictionary[num].push(convertToUsfm(reference))
      } else if (typeof reference === 'object' && '#text' in reference) {
        dictionary[num].push(convertToUsfm(reference['#text']))
      }
    })
  } else {
    dictionary[num].push(convertToUsfm(word.r['#text']))
  }
})

const bookOrder = {
  GEN: 1,
  EXO: 2,
  LEV: 3,
  NUM: 4,
  DEU: 5,
  JOS: 6,
  JDG: 7,
  RUT: 8,
  '1SA': 9,
  '2SA': 10,
  '1KI': 11,
  '2KI': 12,
  '1CH': 13,
  '2CH': 14,
  EZR: 15,
  NEH: 16,
  EST: 17,
  JOB: 18,
  PSA: 19,
  PRO: 20,
  ECC: 21,
  SNG: 22,
  ISA: 23,
  JER: 24,
  LAM: 25,
  EZK: 26,
  DAN: 27,
  HOS: 28,
  JOL: 29,
  AMO: 30,
  OBA: 31,
  JON: 32,
  MIC: 33,
  NAH: 34,
  HAB: 35,
  ZEP: 36,
  HAG: 37,
  ZEC: 38,
  MAL: 39,
}

Object.keys(dictionary).forEach((key) => {
  dictionary[key] = sortBibleReferences(dictionary[key])
})

writeFileSync('./data/word_references.json', JSON.stringify(dictionary))

function sortBibleReferences(refs: string[]): string[] {
  return refs.sort((a, b) => {
    const [bookA, chapterA, verseA] = a.split('.')
    const [bookB, chapterB, verseB] = b.split('.')

    if (bookOrder[bookA] !== bookOrder[bookB]) {
      return bookOrder[bookA] - bookOrder[bookB]
    } else if (chapterA !== chapterB) {
      return parseInt(chapterA) - parseInt(chapterB)
    } else {
      return parseInt(verseA) - parseInt(verseB)
    }
  })
}
