import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "#server/utils/firebase-admin";
import { criacaoGrupoSchema } from "@/schemas/grupo.schema";
import { baseJogadorSchema } from '@/schemas/jogador.schema'
export default defineEventHandler(async (event) => {
  // 1. header
  const authoriation = getHeader(event, "authorization");
  if (!authoriation)
    throw createError({ statusCode: 401, statusMessage: "Não autenticado" });
  // 2.token
  const token = authoriation.replace('Bearer ', '')
  // 3. firebase auth
  const decodedToken = await adminAuth.verifyIdToken(token)
  // 4. body
  const body = await readBody(event)
  console.log(body)
  // 5. zod
  const payload = criacaoGrupoSchema.parse(body)
  // 6. transaction: se grupo ou usuário falhar, nada é criado
  const result = await adminDb.runTransaction(async (transaction)=>{
    const now = Timestamp.now()
    // 6.1 grupo
    const grupoRef = adminDb.collection('grupos').doc()
    const grupo = {
      nome: payload.nome,
      usuarios: [decodedToken.uid],
      criadoPor: decodedToken.uid,
      criadoEm: now
    }
    transaction.set(grupoRef, grupo)
    // 6.2 jogador
    const jogadorRef = adminDb.collection('jogadores').doc()
    const jogador = baseJogadorSchema.parse({
      nome: payload.apelido,
      grupoId: grupoRef.id,
      usuarioId: decodedToken.uid,
      atribuicao: 'admin'
    })
    transaction.set(jogadorRef, {...jogador, criadoEm: now})

    return {
      grupoId: grupoRef.id,
      jogadorId: jogadorRef.id,
    }
  })
  
  // 7. resposta
  return result

});
