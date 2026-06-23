import type { FirestoreDataConverter } from 'firebase/firestore'
import type { ZodError } from 'zod'
import { conviteSchema, type Convite } from '~/schemas/convite.schema'

type ParseResult<T> =
  | { valid: true; convite: T }
  | { valid: false; raw: unknown; error: ZodError }

export const conviteConverter: FirestoreDataConverter<ParseResult<Convite>> = {
  toFirestore(convite) {
    return convite
  },
  fromFirestore(snapshot, options) {
    const rawData = {
      id: snapshot.id,
      ...snapshot.data(options),
    }
    const resultado = conviteSchema.safeParse(rawData)

    if (resultado.success) {
      return { valid: true, convite: resultado.data }
    }

    return { valid: false, raw: rawData, error: resultado.error }
  },
}
