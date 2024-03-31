import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface ActiveChapterIndex {
  going: 'forward' | 'back' | undefined
  index: number
  verseIndex: number | undefined
}

const initialState: ActiveChapterIndex = {
  going: undefined,
  index: 0,
  verseIndex: undefined,
}

export const activeChapterIndex = createSlice({
  name: 'activeChapterIndex',
  initialState,
  reducers: {
    setActiveChapterIndex: (
      state,
      action: PayloadAction<ActiveChapterIndex>
    ) => {
      return action.payload
    },
    goToNextChapter: (state) => {
      return {
        going: 'forward',
        index: state.index + 1,
        verseIndex: undefined,
      }
    },
    goToPreviousChapter: (state) => {
      return {
        going: 'back',
        index: state.index - 1,
        verseIndex: undefined,
      }
    },
  },
})

export const { setActiveChapterIndex, goToNextChapter, goToPreviousChapter } =
  activeChapterIndex.actions

export default activeChapterIndex.reducer
