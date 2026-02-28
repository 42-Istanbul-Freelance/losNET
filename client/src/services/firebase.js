// Firebase Auth - VUE_APP_FIREBASE_* yoksa demo mod
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword as fbSignIn, createUserWithEmailAndPassword as fbCreate, onAuthStateChanged as fbOnAuth, sendPasswordResetEmail as fbSendPasswordReset } from 'firebase/auth'

const config = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID
}

const app = config.apiKey ? initializeApp(config) : null
const auth = app ? getAuth(app) : { onAuthStateChanged: (cb) => { cb(null); return () => {} }, currentUser: null }
export const signInWithEmailAndPassword = config.apiKey ? fbSignIn : null
export const createUserWithEmailAndPassword = config.apiKey ? fbCreate : null
export const onAuthStateChanged = config.apiKey ? fbOnAuth : (auth, cb) => { cb(null); return () => {} }
export const sendPasswordResetEmail = config.apiKey ? fbSendPasswordReset : null
export { app, auth }
