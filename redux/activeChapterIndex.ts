import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface ActiveChapterState {
  transition: 'forward' | 'back' | 'fade'
  index: number
  verseIndex: number | undefined | 'bottom' | 'top'
  highlightVerse: boolean
  numVersesToHighlight: number | undefined
}

const initialState: ActiveChapterState = {
  transition: 'fade',
  index: 0,
  verseIndex: undefined,
  highlightVerse: false,
  numVersesToHighlight: undefined,
}

export const activeChapterIndex = createSlice({
  name: 'activeChapterIndex',
  initialState,
  reducers: {
    setActiveChapterIndex: (_, action: PayloadAction<ActiveChapterState>) => {
      return action.payload
    },
    updateVerseIndex(state, action: PayloadAction<number | undefined>) {
      state.verseIndex = action.payload
      state.highlightVerse = true
    },
    goToNextChapter: (state) => {
      return {
        transition: 'forward',
        index: state.index + 1,
        verseIndex: undefined,
        highlightVerse: false,
        numVersesToHighlight: undefined,
      }
    },
    goToPreviousChapter: (state) => {
      return {
        transition: 'back',
        index: state.index - 1,
        verseIndex: undefined,
        highlightVerse: false,
        numVersesToHighlight: undefined,
      }
    },
  },
})

export const {
  setActiveChapterIndex,
  goToNextChapter,
  goToPreviousChapter,
  updateVerseIndex,
} = activeChapterIndex.actions

export default activeChapterIndex.reducer
