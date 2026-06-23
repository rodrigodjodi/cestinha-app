import type { FirestoreDataConverter } from 'firebase/firestore'
import type { ZodError } from 'zod'
import { jogadaSchema, type Jogada } from '@/schemas/jogada.schema'

type ParseResult<T> =
  | { valid: true; jogada: T }
  | { valid: false; raw: unknown; error: ZodError }

export const jogadaConverter: FirestoreDataConverter<ParseResult<Jogada>> = {
  toFirestore(jogada) {
    return jogada
  },
  fromFirestore(snapshot, options) {
    const rawData = {
      id: snapshot.id,
      ...snapshot.data(options),
    }
    const resultado = jogadaSchema.safeParse(rawData)

    if (resultado.success) {
      return { valid: true, jogada: resultado.data }
    }

    return {
      valid: false,
      raw: rawData,
      error: resultado.error,
    }
  },
}
