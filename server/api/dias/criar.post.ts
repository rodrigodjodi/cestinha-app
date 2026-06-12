import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "#server/utils/firebase-admin";
import { baseDiaSchema } from "@/schemas/dia.schema";
export default defineEventHandler(async (event) => {
  // 1. header
  const authorization = getHeader(event, "authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, statusMessage: "Não autenticado" });
  }
  // 2.token
  const token = authorization.replace("Bearer ", "");
  // 3. firebase auth
  const decodedToken = await adminAuth.verifyIdToken(token);
  // 4. body
  const body = await readBody(event);
  console.log(body);
  // 5. zod
  const validacao = baseDiaSchema.safeParse(body);
  if (!validacao.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'dados-invalidos',
      message: "Os dados forncedios não passaram pela validação."
    });
  const payload = validacao.data;
  // 6. gravacao
  const diaRef = adminDb.collection("dias").doc();
  try{
    await diaRef.set(payload)
  } catch (error) {
    throw error
  } finally {
    return diaRef.id
  }
});
