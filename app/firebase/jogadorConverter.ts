import { type FirestoreDataConverter } from "firebase/firestore"
import { jogadorSchema, type Jogador } from "@/schemas/jogador.schema"
import type { ZodError } from "zod";
type ParseResult<T> =
  | { valid: true; jogador: T }
  | { valid: false; raw: unknown; error: ZodError }
export const jogadorConverter: FirestoreDataConverter<ParseResult<Jogador>> = {
  toFirestore(jogador) {
    return jogador
  },
  fromFirestore(snapshot, options) {
    let rawData = {
      id: snapshot.id,
      ...snapshot.data(options)
    }
    const resultado = jogadorSchema.safeParse(rawData)
    if (resultado.success) {
      return { valid: true, jogador: resultado.data }
    } else {
      return { valid: false, raw: rawData, error: resultado.error }
    }
  }
}