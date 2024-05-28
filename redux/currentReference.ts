import { PayloadAction, createSlice } from '@reduxjs/toolkit'

const initialState: string = ''

export const currentReference = createSlice({
  name: 'currentReference',
  initialState,
  reducers: {
    setCurrentReference: (_, action: PayloadAction<string>) => {
      return action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setCurrentReference } = currentReference.actions

export default currentReference.reducer
