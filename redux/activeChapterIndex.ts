import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface ActiveChapterState {
  transition: 'forward' | 'back' | 'fade'
  index: number
  verseIndex: number | undefined
}

const initialState: ActiveChapterState = {
  transition: 'fade',
  index: 0,
  verseIndex: undefined,
}

export const activeChapterIndex = createSlice({
  name: 'activeChapterIndex',
  initialState,
  reducers: {
    setActiveChapterIndex: (
      state,
      action: PayloadAction<ActiveChapterState>
    ) => {
      return action.payload
    },
    goToNextChapter: (state) => {
      return {
        transition: 'forward',
        index: state.index + 1,
        verseIndex: undefined,
      }
    },
    goToPreviousChapter: (state) => {
      return {
        transition: 'back',
        index: state.index - 1,
        verseIndex: undefined,
      }
    },
  },
})

export const { setActiveChapterIndex, goToNextChapter, goToPreviousChapter } =
  activeChapterIndex.actions

export default activeChapterIndex.reducer
