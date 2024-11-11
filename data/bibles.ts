import net from './net_chapters.json'
import { Chapters } from './types/chapters'

const tutorialText = [
  'tov is a Bible app that brings focus and depth to your reading experience with its minimalist design and insightful cross-references.',
  // "Here's what you need to know:",
  '[1] Tap the current chapter on the bottom of the screen to view the books of the Bible.',
  '[2] Swipe right to open your reading history and bookmarks.',
  '[3] Tapping on underlined verse number will bring up its cross references.',
  // '[5] Check out the advanced features!',
  'Keep scrolling down and happy reading!',
]

const tutorial: Chapters[number] = {
  chapterId: 'TUT.1',
  md: tutorialText.join('\n\n'),
}

export const bibles: Record<string, Chapters> = {
  net: [tutorial, ...(net as Chapters)],
}

export default bibles
