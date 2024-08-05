import net from './net_chapters.json'
import { Chapters } from './types/chapters'

const tutorial: Chapters[number] = {
  chapterId: 'TUT.1',
  md: 'Inspired by the Hebrew word for "good," tov is a delightfully simple yet powerful Bible app designed to help you enjoy and study Scripture.\n\nHere\'s what you need to know:\n\n[1] Double tap anywhere to view the books of the Bible.\n\n[2] Swipe right to open your reading history and view your bookmarks.\n\n[3] Tap on an underlined verse number to view cross references.\n\n[4] Keep scrolling downwards to go to the next chapter.\n\n[5] Feel free to check out the advanced features!\n\nHappy reading!',
}

export const bibles: Record<string, Chapters> = {
  net: [tutorial, ...(net as Chapters)],
}

export default bibles
