import { signal } from "@preact/signals"
import { Codename } from "../../islands/Codename.tsx"

export default async function Page() {
	const kv = await Deno.openKv("db.sqlite")
	const dbcodename = (await kv.get<boolean[]>(["codename"])).value
	if (dbcodename === null || dbcodename.length != 27) await kv.set(["codename"], Array(27).fill(false))
	const codename = signal(dbcodename || Array(27).fill(false))

	return <Codename codename={codename} />
}
