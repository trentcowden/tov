import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'
import ExpoFileSystemStorage from 'redux-persist-expo-filesystem'
import activeChapterIndex from './activeChapterIndex'
import currentReference from './currentReference'
import history from './history'
import referenceTree from './referenceTree'
import settings from './settings'

const rootPersistConfig = {
  key: 'root',
  storage: ExpoFileSystemStorage,
  blacklist: ['activeChapterIndex', 'referenceTree'],
}

const activeChapterPersistConfig = {
  key: 'activeChapterIndex',
  storage: ExpoFileSystemStorage,
  blacklist: ['transition', 'verseIndex'],
}

const rootReducer = combineReducers({
  history,
  settings,
  referenceTree,
  currentReference,
  activeChapterIndex: persistReducer(
    activeChapterPersistConfig,
    activeChapterIndex
  ),
})

const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
