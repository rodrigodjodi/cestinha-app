import { type FirestoreDataConverter } from "firebase/firestore"
import { diaSchema, type Dia } from "@/schemas/dia.schema"
import type { ZodError } from "zod";
type ParseResult<T> =
  | { valid: true; dia: T }
  | { valid: false; raw: unknown; error: ZodError }
export const diaConverter: FirestoreDataConverter<ParseResult<Dia>> = {
  toFirestore(dia) { return dia },
  fromFirestore(snapshot, options) {
    let rawData = {
      id: snapshot.id,
      ...snapshot.data(options)
    }
    const resultado = diaSchema.safeParse(rawData)
    if (resultado.success) {
      return { valid: true, dia: resultado.data }
    } else {
      return { valid: false, raw: rawData, error: resultado.error }
    }
  }
}