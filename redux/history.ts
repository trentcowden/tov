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
    clearHistory: () => {
      return []
    },
  },
})

// Action creators are generated for each case reducer function
export const { addToHistory, clearHistory } = history.actions

export default history.reducer
