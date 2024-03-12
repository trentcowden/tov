import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface HistoryItem {
  chapterId: string
  date: number
}

const initialState: HistoryItem[] = []

export const history = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (state, action: PayloadAction<HistoryItem>) => {
      state.unshift(action.payload)
    },
  },
})

// Action creators are generated for each case reducer function
export const { addToHistory } = history.actions

export default history.reducer
