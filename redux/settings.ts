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
  ...fontSizes[1],
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
    setTypography: (
      state,
      action: PayloadAction<(typeof fontSizes)[number]>
    ) => {
      state.fontSize = action.payload.fontSize
      state.lineHeight = action.payload.lineHeight
      state.paragraphSpacing = action.payload.paragraphSpacing
    },
    setTheme: (state, action: PayloadAction<SettingsState['theme']>) => {
      state.theme = action.payload
    },
  },
})

export const { setTheme, setTranslation, setTypography } = settings.actions

export default settings.reducer
