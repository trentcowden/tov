import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface TypographySettings {
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
}

export interface SettingsState extends TypographySettings {
  translation: 'web' | 'net'
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  theme: 'dark' | 'light' | 'auto'
}

export const typographyOptions = {
  small: {
    fontSize: 15,
    lineHeight: 32,
    paragraphSpacing: 14,
  },
  default: {
    fontSize: 17,
    lineHeight: 38,
    paragraphSpacing: 18,
  },
  large: {
    fontSize: 19,
    lineHeight: 42,
    paragraphSpacing: 22,
  },
  xlarge: {
    fontSize: 21,
    lineHeight: 46,
    paragraphSpacing: 26,
  },
}

const initialState: SettingsState = {
  translation: 'web',
  ...typographyOptions.default,
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
      action: PayloadAction<keyof typeof typographyOptions>
    ) => {
      state.fontSize = typographyOptions[action.payload].fontSize
      state.lineHeight = typographyOptions[action.payload].lineHeight
      state.paragraphSpacing =
        typographyOptions[action.payload].paragraphSpacing
    },
    setTheme: (state, action: PayloadAction<SettingsState['theme']>) => {
      state.theme = action.payload
    },
  },
})

export const { setTheme, setTranslation, setTypography } = settings.actions

export default settings.reducer
