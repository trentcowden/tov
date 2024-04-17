import nlt from './nlt_chapters.json'
import { Chapters } from './types/chapters'
import web from './web_chapters.json'

export const bibles: Record<string, Chapters> = {
  web: web as Chapters,
  nlt: nlt as Chapters,
}

export default bibles
