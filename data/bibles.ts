import net from './net_chapters.json'
import { Chapters } from './types/chapters'
import web from './web_chapters.json'

const tutorial: Chapters[number] = {
  chapterId: 'TUT.1',
  md: '',
}

export const bibles: Record<string, Chapters> = {
  web: [tutorial, ...(web as Chapters)],
  net: [tutorial, ...(net as Chapters)],
}

export default bibles
