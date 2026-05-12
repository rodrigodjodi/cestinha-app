import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const runtimeConfig = useRuntimeConfig()

const app = getApps()[0] ?? initializeApp({
  credential: cert({
    projectId: runtimeConfig.firebase.projectId,
    clientEmail: runtimeConfig.firebase.clientEmail,
    privateKey: runtimeConfig.firebase.privateKey.replace(/\\n/g, '\n')
  })
})

export const adminDb = getFirestore(app)
export const adminAuth = getAuth(app)