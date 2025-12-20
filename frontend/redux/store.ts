import { configureStore } from "@reduxjs/toolkit";
import toastSlice from "./slices/toastSlice";
import userSlice from "./slices/userSlice";
import authSlice from "./slices/authSlice";
import footerLinkSlice from "./slices/footerLinksSlice";
import invoicesSlice from "./slices/invoices";
import accessTokenSlice from "./slices/accessTokenSlice";
import notificationsSlice from "./slices/notificationsSlice"; 

export const store = configureStore({
  reducer: {
    toastState: toastSlice,
    user: userSlice,
    authState: authSlice,
    setFooterLink: footerLinkSlice,
    setBills: invoicesSlice,
    accessTokenState: accessTokenSlice,
    notificationsState: notificationsSlice
  },
   devTools: process.env.NODE_ENV !== "production",
});

// Use async function to handle SecureStorage properly
store.subscribe(() =>  {
  const notifications = store.getState().notificationsState.items;
  const notifications_archived = store.getState().notificationsState.items_archived;
  const notifications_settings = store.getState().notificationsState.activeSettings;
  
  // Use SecureStorage instead of localStorage to support both web and Capacitor
   localStorage.setItem("notifications", JSON.stringify(notifications));
   localStorage.setItem("notifications_archived", JSON.stringify(notifications_archived));
   localStorage.setItem("notifications_settings", JSON.stringify(notifications_settings));
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
