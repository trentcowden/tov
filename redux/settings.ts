import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface SettingsState {
  translation: 'web' | 'nlt'
  fontSize: number
  theme: 'dark' | 'light' | 'black'
}

const initialState: SettingsState = {
  translation: 'web',
  fontSize: 17,
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
    setTheme: (state, action: PayloadAction<SettingsState['theme']>) => {
      state.theme = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setFontSize, setTheme, setTranslation } = settings.actions

export default settings.reducer
