import { FreshContext, Handlers, RouteConfig } from "$fresh/server.ts"

const kv = await Deno.openKv("db.sqlite")

export const handler: Handlers = {
	async GET() {
		const codename = (await kv.get<boolean[]>(["codename"])).value ?? Array(27).fill(false)

		return new Response(JSON.stringify({ codename }), {
			headers: { "Content-Type": "application/json" },
		})
	},

	async POST(_, ctx: FreshContext) {
		const index = parseInt(ctx.params.index)
		const codename = (await kv.get<boolean[]>(["codename"])).value ?? Array(27).fill(false)

		codename[index] = !codename[index]
		await kv.set(["codename"], codename)

		console.log(codename)

		return new Response(JSON.stringify({ success: true }), {
			headers: { "Content-Type": "application/json" },
		})
	},
}

export const config: RouteConfig = {
	routeOverride: "/api/codename/:index",
}
