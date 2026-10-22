export async function GET(){return Response.json({error:'This historical endpoint is retired. Use /api/scout or /api/explore.'},{status:410});}
export const POST=GET;
