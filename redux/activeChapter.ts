import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface ActiveChapterIndex {
  going: 'forward' | 'back' | undefined
  index: number
}

const initialState: ActiveChapterIndex = {
  going: undefined,
  index: 0,
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
      }
    },
    goToPreviousChapter: (state) => {
      return {
        going: 'back',
        index: state.index - 1,
      }
    },
  },
})

export const { setActiveChapterIndex, goToNextChapter, goToPreviousChapter } =
  activeChapterIndex.actions

export default activeChapterIndex.reducer
