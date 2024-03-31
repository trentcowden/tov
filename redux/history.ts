import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface HistoryItem {
  chapterId: string
  date: number
  verseIndex: number
}

const initialState: HistoryItem[] = []

export const history = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (state, action: PayloadAction<HistoryItem>) => {
      const currentItemIndex = state.findIndex(
        (historyItem) => historyItem.chapterId === action.payload.chapterId
      )

      return [
        action.payload,
        ...state.filter(
          (historyItem) => historyItem.chapterId !== action.payload.chapterId
        ),
      ]
    },
    removeFromHistory: (state, action: PayloadAction<string>) => {
      return state.filter(
        (historyItem) => historyItem.chapterId !== action.payload
      )
    },
    clearHistory: () => {
      return []
    },
  },
})

// Action creators are generated for each case reducer function
export const { addToHistory, clearHistory, removeFromHistory } = history.actions

export default history.reducer
