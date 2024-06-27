import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface PopupsState {
  visible: string | undefined
  dismissed: string[]
}

const initialState: PopupsState = {
  visible: undefined,
  dismissed: [],
}

export const popups = createSlice({
  name: 'popups',
  initialState,
  reducers: {
    showPopup: (state, action: PayloadAction<string>) => {
      state.visible = action.payload
    },
    dismissPopup: (state, action: PayloadAction<string>) => {
      state.visible = undefined
      state.dismissed.unshift(action.payload)
    },
    resetPopups: () => {
      return initialState
    },
  },
})

// Action creators are generated for each case reducer function
export const { showPopup, dismissPopup, resetPopups } = popups.actions

export default popups.reducer
