import { Chapters } from './types/chapters'
import web from './web_chapters.json'

const tutorialMd = [
  '[1] Inspired by the Hebrew word for "good," **tov** is a delightfully simple yet powerful Bible app designed to help you enjoy and study Scripture.',
  "[2] Here's what you need to know:",
  '[3] ➡️ **Swipe right** to open your reading history.',
  '[4] ✴️✴️ **Double tap** anywhere to view the books of the Bible and find a specific chapter.',
  '[5] 👈 **Tap on an underlined verse number** to view its cross references.',
  '[6] ⬇️ **Keep scrolling** downwards to go to the next chapter. Happy reading!',
]

const tutorial: Chapters[number] = {
  chapterId: 'tutorial',
  md: tutorialMd.join('\n\n'),
}

export const bibles: Record<string, Chapters> = {
  web: [tutorial, ...(web as Chapters)],
}

export default bibles
