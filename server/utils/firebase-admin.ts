import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

const runtimeConfig = useRuntimeConfig()

const app = getApps()[0] ?? initializeApp({
  credential: cert({
    projectId: runtimeConfig.firebase.projectId,
    clientEmail: runtimeConfig.firebase.clientEmail,
    privateKey: runtimeConfig.firebase.privateKey.replace(/\\n/g, '\n')
  }),
  storageBucket: runtimeConfig.firebase.storageBucket,
})

export const adminDb = getFirestore(app)
export const adminAuth = getAuth(app)
export const adminStorage = getStorage(app)
