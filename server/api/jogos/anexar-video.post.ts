import { requireUser } from "#server/utils/require-user";
import { adminAuth, adminDb } from "#server/utils/firebase-admin";
export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const body = await readBody(event);
    console.log(body)
    const jogoRef = adminDb.doc(`jogos/${body.jogoId}`)
    jogoRef.update({videoId: body.videoUrl})
})