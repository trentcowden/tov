import net from './net_chapters.json'
import { Chapters } from './types/chapters'

const tutorialText = [
  'Inspired by the Hebrew word for "good", tov is a delightfully simple yet powerful Bible app designed to help you *enjoy* and *study* Scripture.',
  "Here's what you need to know:",
  '[1] Double tap anywhere to *view the books* of the Bible.',
  '[2] Swipe right to *open your reading history* and bookmarks.',
  '[3] Tap on an underlined verse number to *view cross references*.',
  '[4] Keep scrolling downwards to *go to the next chapter*.',
  // '[5] Check out the advanced features!',
  'Happy reading!',
]

const tutorial: Chapters[number] = {
  chapterId: 'TUT.1',
  md: tutorialText.join('\n\n'),
}

export const bibles: Record<string, Chapters> = {
  net: [tutorial, ...(net as Chapters)],
}

export default bibles
