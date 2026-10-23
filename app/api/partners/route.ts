/** Historical collaboration API; not the restaurant product. */
export async function GET(){return Response.json({error:'The collaboration prototype is retired. Use /api/scout or /api/explore for restaurant scouting.'},{status:410});}
export const POST=GET;
