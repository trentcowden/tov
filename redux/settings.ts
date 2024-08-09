import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { fontSizes } from '../styles'

export interface TypographySettings {
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
}

export interface SettingsState extends TypographySettings {
  translation: 'net'
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  theme: 'dark' | 'light' | 'black'
}

const initialState: SettingsState = {
  translation: 'net',
  fontSize: 16,
  lineHeight: 32,
  paragraphSpacing: 11,
  theme: 'dark',
}

export const settings = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTranslation: (
      state,
      action: PayloadAction<SettingsState['translation']>
    ) => {
      state.translation = action.payload
    },
    setBibleTextSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload
      state.lineHeight = action.payload * 2
      state.paragraphSpacing = action.payload * 0.6875
    },
    increaseTextSize: (state) => {
      const currentIndex = fontSizes.findIndex(
        (size) => size === state.fontSize
      )
      if (currentIndex === fontSizes.length - 1) return
      const newValue =
        currentIndex === -1 ? fontSizes[2] : fontSizes[currentIndex + 1]

      state.fontSize = newValue
      state.lineHeight = newValue * 2
      state.paragraphSpacing = newValue * 0.6875
    },
    decreaseTextSize: (state) => {
      const currentIndex = fontSizes.findIndex(
        (size) => size === state.fontSize
      )
      if (currentIndex === 0) return
      const newValue =
        currentIndex === -1 ? fontSizes[2] : fontSizes[currentIndex - 1]

      state.fontSize = newValue
      state.lineHeight = newValue * 2
      state.paragraphSpacing = newValue * 0.6875
    },
    setTextSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload
      state.lineHeight = action.payload * 2
      state.paragraphSpacing = action.payload * 0.6875
    },
    setTheme: (state, action: PayloadAction<SettingsState['theme']>) => {
      state.theme = action.payload
    },
  },
})

export const {
  setTheme,
  setTranslation,
  setBibleTextSize,
  decreaseTextSize,
  increaseTextSize,
  setTextSize,
} = settings.actions

export default settings.reducer
