import { Handlers } from "$fresh/server.ts"

const kv = await Deno.openKv("db.sqlite")

export const handler: Handlers = {
	async GET() {
		const dbt1 = (await kv.get(["t1scores"])).value as number | null
		const dbt2 = (await kv.get(["t2scores"])).value as number | null
		const dbphs = (await kv.get(["phase"])).value as number | null

		if (dbt1 === null) await kv.set(["t1scores"], 0)
		if (dbt2 === null) await kv.set(["t2scores"], 0)
		if (dbphs === null) await kv.set(["phase"], 0)

		return new Response(JSON.stringify({ dbt1, dbt2 }), {
			headers: { "Content-Type": "application/json" },
		})
	},
}
