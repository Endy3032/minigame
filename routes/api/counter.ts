import { FreshContext, RouteConfig } from "$fresh/server.ts"
import { Handlers } from "$fresh/server.ts"

const kv = await Deno.openKv("db.sqlite")

export const handler: Handlers = {
	async POST(_, ctx: FreshContext) {
		const team = ctx.params.team
		if (team !== "1" && team !== "2") return new Response("Invalid team", { status: 400 })

		const key = `t${team}scores`
		const count = (await kv.get<number>([key]))?.value ?? 0
		const change = parseFloat(ctx.params.change) || 0
		await kv.set([key], parseFloat((count + change).toFixed(1)))

		console.log(`Changed ${key} to ${count + change}`)

		return new Response(JSON.stringify({ success: true, count: count + change }), {
			headers: { "Content-Type": "application/json" },
		})
	},
}

export const config: RouteConfig = {
	routeOverride: "/api/counter/:team(1|2)@:change",
}
