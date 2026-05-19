import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "#server/utils/firebase-admin";
import { basePresencaSchema, presencaSchema } from "@/schemas/presenca.schema";
import normalizarTexto from "~/utils/normalizarTexto";
export default defineEventHandler(async (event) => {
  console.log('rota cricao presenca chamada')
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
  // 5. jogador com esa id Existe?
  const jogadorSnapshot = await adminDb
    .collection('jogadores')
    .doc(body.jogadorId)
    .get()
  if(!jogadorSnapshot.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'jogador-nao-encontrado',
      message: "O jogador informado não foi encontrado."
    });
  }
  // 6. é do grupo?
  const jogador = jogadorSnapshot.data()!
  if(jogador.grupoId !== body.grupoId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'nao-membro',
      message: "O jogador não é membro do grupo."
    });
  }
  // 7. Se não for o próprio jogador gravando a presença, verifica se é admin
  let criadoPor
  console.log('jogador.usuarioId: ', jogador.usuarioId, 'decodedToken.uid: ', decodedToken.uid)
  if(jogador.usuarioId !== decodedToken.uid) {
    // verificar se é admin
    const criadorSnapshot = await adminDb
    .collection('jogadores')
    .where('grupoId', '==', body.grupoId)
    .where('usuarioId', '==', decodedToken.uid)
    .limit(1)
    .get() 
    if (criadorSnapshot.empty) {
      throw createError({
        statusCode: 403,
        statusMessage: 'nao-membro',
        message: "O jogador criando não é membro do grupo"
      })
    }
    criadoPor = criadorSnapshot.docs[0]!.id
    const criador = criadorSnapshot.docs[0]!.data()
    if(criador.atribuicao !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'nao-autorizado',
        message: "Somente admin pode confirmar presença de outros jogadores."
      })
    }
  } else {
    criadoPor = body.jogadorId
  }
  console.log('criadoPor: ', criadoPor)
// 8. zod
  const validacao = presencaSchema.safeParse({
    ...body,
    criadoPor: criadoPor,
    situacao: jogador.atribuicao === 'avulso' ? '1.espera' : '0.confirmado'
  })
  console.log(validacao)
  if (!validacao.success) throw createError({
    statusCode: 400,
    statusMessage: 'dados-invalidos',
    message: "Os dados forncedios não passaram pela validação."
  })
  const payload = validacao.data 
   console.log(payload)
  // p. gravação
  const payloadEnvio = {
    ...payload,
    criadoEm: Timestamp.now()
  }
  const docId =  `presencas/${payloadEnvio.diaId}_${payloadEnvio.jogadorId}`
  const presencaRef = adminDb.doc(docId)
  await presencaRef.set({
    ...payloadEnvio,
    criadoEm: Timestamp.now(),
    criadoPor: criadoPor
  }, { merge: true })

  return {
    presencaId: presencaRef.id,
  };
});
