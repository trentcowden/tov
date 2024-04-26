import { Chapters } from './types/chapters'
import web from './web_chapters.json'

const tutorialMd = [
  'Welcome to Tov!',
  '[1] Double tap anywhere to open the Bible navigator.',
  '[2] Swipe right to open your reading history.',
  '[3] Tap on a verse number to view its cross references.',
  '[4] Keep scrolling to go to the next chapter. Happy reading!',
]

const tutorial: Chapters[number] = {
  chapterId: 'tutorial',
  md: tutorialMd.join('\n\n'),
}

export const bibles: Record<string, Chapters> = {
  web: [
    // tutorial,
    ...(web as Chapters),
  ],
}

export default bibles
