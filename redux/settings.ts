import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface SettingsState {
  translation: 'web' | 'nlt'
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  theme: 'dark' | 'light' | 'black'
}

const initialState: SettingsState = {
  translation: 'nlt',
  fontSize: 17,
  lineHeight: 36,
  paragraphSpacing: 18,
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
    setFontSize: (state, action: PayloadAction<SettingsState['fontSize']>) => {
      state.fontSize = action.payload
    },
    setLineHeight: (
      state,
      action: PayloadAction<SettingsState['lineHeight']>
    ) => {
      state.lineHeight = action.payload
    },
    setParagraphSpacing: (
      state,
      action: PayloadAction<SettingsState['paragraphSpacing']>
    ) => {
      state.paragraphSpacing = action.payload
    },
    setTheme: (state, action: PayloadAction<SettingsState['theme']>) => {
      state.theme = action.payload
    },
    resetTypographySettings: (state) => {
      state.fontSize = initialState.fontSize
      state.lineHeight = initialState.lineHeight
      state.paragraphSpacing = initialState.paragraphSpacing
    },
  },
})

export const {
  setFontSize,
  setTheme,
  setTranslation,
  setLineHeight,
  setParagraphSpacing,
  resetTypographySettings,
} = settings.actions

export default settings.reducer