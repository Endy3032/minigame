import { Handler } from "$fresh/server.ts"

const clients = new Map<string, WebSocket>()
let host: WebSocket | undefined = undefined
let currentGame: string = ""

export const handler: Handler = (req, ctx) => {
	const name = ctx.url.searchParams.get("name") ?? "Host"
	const id = ctx.url.searchParams.get("id") ?? crypto.randomUUID()
	const { response, socket } = Deno.upgradeWebSocket(req)

	socket.onopen = () => {
		console.log(`WebSocket connection opened from ${name} with ID ${id} | Now ${clients.size} clients connected`)

		if (id !== "host") {
			clients.set(id, socket)
			socket.send(currentGame)
		} else host = host ?? socket

		host?.send(JSON.stringify({ event: "join", data: { name, id, count: clients.size } }))
	}

	socket.onmessage = event => {
		console.log(`Received ${event.data} from ${name} (${id})`)

		if (id === "host") {
			const data = JSON.parse(event.data)

			if (data.event === "gameplayupdate") currentGame = event.data
			for (const [, client] of clients) client.send(currentGame)
		} else {
			host?.send(JSON.stringify({ event: "answer", data: { id, name, choice: event.data } }))
		}
	}

	socket.onclose = () => {
		console.log(`WS closed by ${name} (${id}) | Now ${clients.size} clients connected`)
		id === "host" ? host = undefined : clients.delete(id)

		host?.send(JSON.stringify({ event: "join", data: { name, id, count: clients.size } }))
	}

	socket.onerror = err => {
		console.error(`WS error ${err} from ${name} (${id})`)
	}

	return response
}
