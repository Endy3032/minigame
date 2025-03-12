import { Handler } from "$fresh/server.ts"

const kv = await Deno.openKv("db.sqlite")

export const handler: Handler = async req => {
	const data = await req.json()
	const timestamp = new Date().toISOString()
	await kv.set(["responses", timestamp], data)
	return new Response("Saved to database at " + timestamp)
}
