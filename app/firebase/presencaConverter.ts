import { type FirestoreDataConverter } from "firebase/firestore"
import { presencaSchema, type Presenca } from "@/schemas/presenca.schema"
import type { ZodError } from "zod";
type ParseResult<T> =
  | { valid: true; presenca: T }
  | { valid: false; raw: unknown; error: ZodError }
export const presencaConverter: FirestoreDataConverter<ParseResult<Presenca>> = {
  toFirestore(presenca) {
    return presenca
  },
  fromFirestore(snapshot, options) {
    let rawData = {
      id: snapshot.id,
      ...snapshot.data(options)
    }
    const resultado = presencaSchema.safeParse(rawData)
    if (resultado.success) {
      return { valid: true, presenca: resultado.data }
    } else {
      return { valid: false, raw: rawData, error: resultado.error }
    }
  }
}