import { configureStore } from '@reduxjs/toolkit';
import userAuthReducer from './slices/userAuthSlice'
import adminAuthReducer from './slices/adminAuthSlice'; // Import the adminAuthSlice reducer
import { apiSlice } from './slices/api_slices/apiSlice';
import themeReducer from './slices/themeSlice'
import fallbackImageReducer from './slices/fallbackImageSlice'
import notificationCountReducer from './slices/notificationCountSlice';
import messageCountReducer from './slices/messageCountSlice'
import logoImageReducer from './slices/logoSlice'
const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    adminAuth: adminAuthReducer,
    theme : themeReducer,
    fallbackImage: fallbackImageReducer,
    logoImage : logoImageReducer,
    notificationsCount: notificationCountReducer,
    messageCount : messageCountReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;
