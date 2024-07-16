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
      // console.log('adding', action.payload, 'to history')
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
      return state.filter(
        (item) => item.chapterId === action.payload || item.isFavorite
      )
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const match = state.find((item) => item.chapterId === action.payload)

      if (match) match.isFavorite = !match.isFavorite
    },
    createFakeHistory: (state) => {
      const today = Date.now()
      const yesterday = today - 86400000
      const twoDaysAgo = yesterday - 86400000
      const threeDaysAgo = twoDaysAgo - 86400000
      const fourDaysAgo = threeDaysAgo - 86400000
      const fiveDaysAgo = fourDaysAgo - 86400000
      const sixDaysAgo = fiveDaysAgo - 86400000
      const sevenDaysAgo = sixDaysAgo - 86400000
      const eightDaysAgo = sevenDaysAgo - 86400000
      const twoWeeksAgo = eightDaysAgo - 1209600000
      const twoMonthsAgo = twoWeeksAgo - 5184000000
      return [
        {
          date: today,
          chapterId: 'JHN.3',
          isFavorite: true,
          verseIndex: 0,
        },
        {
          date: today - 1,
          chapterId: 'GEN.1',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: yesterday,
          chapterId: 'PSA.23',
          isFavorite: true,
          verseIndex: 0,
        },
        {
          date: yesterday - 1,
          chapterId: 'ROM.8',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: yesterday - 2,
          chapterId: 'EXO.20',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: threeDaysAgo,
          chapterId: 'MAT.5',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: threeDaysAgo - 1,
          chapterId: 'PRO.3',
          isFavorite: true,
          verseIndex: 0,
        },
        {
          date: threeDaysAgo - 2,
          chapterId: 'ISA.40',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: fourDaysAgo,
          chapterId: 'JAS.1',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: fourDaysAgo - 1,
          chapterId: 'REV.21',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: fourDaysAgo - 2,
          chapterId: '1CO.13',
          isFavorite: true,
          verseIndex: 0,
        },
        {
          date: fiveDaysAgo,
          chapterId: 'PSA.91',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: sevenDaysAgo,
          chapterId: 'LUK.2',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: sevenDaysAgo - 1,
          chapterId: 'ISA.53',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: sevenDaysAgo - 2,
          chapterId: 'MAT.28',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: sevenDaysAgo - 3,
          chapterId: 'ROM.12',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: sevenDaysAgo - 4,
          chapterId: 'HEB.11',
          isFavorite: true,
          verseIndex: 0,
        },
        {
          date: eightDaysAgo,
          chapterId: 'GEN.12',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: eightDaysAgo - 1,
          chapterId: 'EXO.3',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: eightDaysAgo - 2,
          chapterId: 'JHN.1',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: twoWeeksAgo,
          chapterId: 'ACT.2',
          isFavorite: true,
          verseIndex: 0,
        },
        {
          date: twoWeeksAgo - 1,
          chapterId: 'PSA.139',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: twoMonthsAgo,
          chapterId: 'REV.22',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: twoMonthsAgo - 1,
          chapterId: 'JAS.2',
          isFavorite: false,
          verseIndex: 0,
        },
        {
          date: twoMonthsAgo - 2,
          chapterId: 'PRO.31',
          isFavorite: false,
          verseIndex: 0,
        },
      ]
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  addToHistory,
  clearHistory,
  removeFromHistory,
  toggleFavorite,
  createFakeHistory,
} = history.actions

export default history.reducer
