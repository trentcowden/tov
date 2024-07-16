import net from './net_chapters.json'
import { Chapters } from './types/chapters'

const tutorial: Chapters[number] = {
  chapterId: 'TUT.1',
  md: '',
}

export const bibles: Record<string, Chapters> = {
  net: [tutorial, ...(net as Chapters)],
}

export default bibles
