import { z } from 'zod'
import { Timestamp } from 'firebase/firestore'

// 🔹 timestamp → Date
export const zTimestampToDate = z
  .instanceof(Timestamp)
  .transform((ts) => ts.toDate())

// 🔹 id padrão