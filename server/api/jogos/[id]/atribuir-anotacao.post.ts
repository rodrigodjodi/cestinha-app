import { requireUser } from "#server/utils/require-user";
import { adminDb } from "#server/utils/firebase-admin";
export default defineEventHandler(async (event) => {
    const jogoId = getRouterParam(event, 'id')
    const user = await requireUser(event)
    const body = await readBody(event);
    // console.log(body)
    const jogoRef = adminDb.doc(`jogos/${jogoId}`)
    return jogoRef.update(body)
})