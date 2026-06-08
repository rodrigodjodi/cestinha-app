import { type FirestoreDataConverter } from "firebase/firestore"
import { grupoSchema, type Grupo } from "@/schemas/grupo.schema"
import type { ZodError } from "zod";
type ParseResult<T> =
  | { valid: true; grupo: T }
  | { valid: false; raw: unknown; error: ZodError }
export const grupoConverter: FirestoreDataConverter<ParseResult<Grupo>> = {
  toFirestore(grupo) {
    return grupo
  },
  fromFirestore(snapshot, options) {
    let rawData = {
      id: snapshot.id,
      ...snapshot.data(options)
    }
    const resultado = grupoSchema.safeParse(rawData)
    if (resultado.success) {
      return { valid: true, grupo: resultado.data }
    } else {
      return { valid: false, raw: rawData, error: resultado.error }
    }
  }
}