import { Handlers } from "$fresh/server.ts"

export const handler: Handlers = {
	async POST(req: Request) {
		const data = await req.json()
		const kv = await Deno.openKv()
		const { id, score, name } = data
		await kv.set(["singlescores", id], { score, name })
		return new Response("OK", { status: 200 })
	},
}
