import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface HistoryItem {
  chapterId: string
  date: number
  verseIndex: number | 'bottom' | 'top'
  isFavorite: boolean
}

const initialState: HistoryItem[] = []

export const history = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (
      state,
      action: PayloadAction<Omit<HistoryItem, 'isFavorite' | 'date'>>
    ) => {
      console.log('adding', action.payload, 'to history')
      const match = state.find(
        (item) => item.chapterId === action.payload.chapterId
      )

      if (match) {
        match.date = Date.now()
        match.verseIndex = action.payload.verseIndex
      } else {
        state.unshift({
          ...action.payload,
          date: Date.now(),
          isFavorite: false,
        })
      }
    },
    removeFromHistory: (state, action: PayloadAction<string>) => {
      return state.filter(
        (historyItem) => historyItem.chapterId !== action.payload
      )
    },
    clearHistory: (state, action: PayloadAction<string>) => {
      return state.filter((item) => item.chapterId === action.payload)
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const match = state.find((item) => item.chapterId === action.payload)

      if (match) match.isFavorite = !match.isFavorite
    },
  },
})

// Action creators are generated for each case reducer function
export const { addToHistory, clearHistory, removeFromHistory, toggleFavorite } =
  history.actions

export default history.reducer
