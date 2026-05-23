import { Timestamp } from "firebase-admin/firestore"
import { adminAuth, adminDb } from "#server/utils/firebase-admin"
import { baseJogoSchema } from "@/schemas/jogo.schema"
export default defineEventHandler(async (event) => {
  // 1. header
  const authorization = getHeader(event, "authorization");
  if (!authorization?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: "nao-autenticado",
      message: "Houve um problema de autenticação."
    });
  }
  // 2.token
  const token = authorization.replace("Bearer ", "");
  // 3. firebase auth
  const decodedToken = await adminAuth.verifyIdToken(token);
  // 4. body
  const body = await readBody(event);
  console.log(body);
  // 5. zod
  const validacao = baseJogoSchema.safeParse(body);
  console.log(validacao.error)
  if (!validacao.success) throw createError({
    statusCode: 400,
    statusMessage: 'dados-invalidos',
    message: "Os dados forncedios não passaram pela validação."
  })
  const payload = validacao.data
  console.log(payload)

  // 8: transaction: pega o numero de jogos do dia, cria o nome do jogo com esse valor e incrementa o numero de jogos do dia
  const result = await adminDb.runTransaction(async (transaction) => {
    // 8.1 doc dia
    const diaRef = adminDb.doc(`dias/${payload.diaId}`)
    const diaSnapshot = await transaction.get(diaRef)
    if (!diaSnapshot.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'dia-nao-encontrado',
        message: "O dia especificado não foi encontrado."
      })
    }
    const dia = diaSnapshot.data()!
    // 8.2 dados derivaods de dia
    const numJogos = dia.numJogos || 0
    const data = dia.data.split('-').reverse().join('/')
    const templateNome = `${data} - Jogo ${numJogos + 1}`
    // 8.3 gravacao jogo
    const jogoRef = adminDb.collection('jogos').doc()
    transaction.set(jogoRef,{
      ...payload,
      criadoEm: Timestamp.now(),
      criadoPor: decodedToken.uid,
      nome: templateNome
    })
    // 8.4 incrementa numero de jogos do dia
    transaction.update(diaRef, {
      numJogos: numJogos + 1
    })
    return jogoRef.id
  })

  return {
    jogoId: result,
  }; 
});
