import { PayloadAction, createSlice } from '@reduxjs/toolkit'

const initialState: string[] = []

export const referenceTree = createSlice({
  name: 'referenceTree',
  initialState,
  reducers: {
    addToReferenceTree: (state, action: PayloadAction<string>) => {
      state.push(action.payload)
    },
    removeAfterInReferenceTree: (state, action: PayloadAction<string>) => {
      // Remove all items including and after the item to be removed.
      const index = state.indexOf(action.payload)

      return state.slice(0, index + 1)
    },
    clearReferenceTree: () => {
      return []
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  addToReferenceTree,
  removeAfterInReferenceTree,
  clearReferenceTree,
} = referenceTree.actions

export default referenceTree.reducer
