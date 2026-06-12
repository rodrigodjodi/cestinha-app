import { type FirestoreDataConverter } from "firebase/firestore"
import { jogoSchema, type Jogo } from "@/schemas/jogo.schema"
import type { ZodError } from "zod";
type ParseResult<T> =
  | { valid: true; jogo: T }
  | { valid: false; raw: unknown; error: ZodError }
export const jogoConverter: FirestoreDataConverter<ParseResult<Jogo>> = {
  toFirestore(jogo) {
    return jogo
  },
  fromFirestore(snapshot, options) {
    let rawData = {
      id: snapshot.id,
      ...snapshot.data(options)
    }
    const resultado = jogoSchema.safeParse(rawData)
    if (resultado.success) {
      return { valid: true, jogo: resultado.data }
    } else {
      return { valid: false, raw: rawData, error: resultado.error }
    }
  }
}