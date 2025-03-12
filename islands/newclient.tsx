import { useSignal } from "@preact/signals"
import { MutableRef, useEffect, useRef } from "preact/hooks"

type MultichoiceQuestion = {
	q: string
	a: string[]
}

type QuestionData = {
	type: "mc"
	question: MultichoiceQuestion
} | null

function Multichoice(props: { question: MultichoiceQuestion; ws: MutableRef<WebSocket | null> }) {
	const { question, ws } = props
	const chosen = useSignal<string | null>(null)

	return (
		<div class="flex flex-col gap-4 items-center">
			<h1 class="font-semibold text-2xl">{question.q}</h1>
			<div class="flex flex-col gap-6">
				{question.a.map(answer => (
					<button
						class={"relative flex items-center justify-center px-6 py-3 min-h-20 text-xl rounded-lg "
							+ (chosen.value === answer ? "bg-[#5e81ac]" : "bg-[#3B4252]")}
						key={answer}
						type="button"
						onClick={() => {
							ws.current?.send(answer)
							chosen.value = answer
						}}
					>
						{answer}
					</button>
				))}
			</div>
		</div>
	)
}

export function Client() {
	const clientId = useSignal<string>("")
	const name = useSignal<string>("")
	const message = useSignal<string>("")
	const question = useSignal<QuestionData>(null)
	const ws = useRef<WebSocket | null>(null)

	// Function to open WebSocket connection (Needed for iOS Safari)
	const connectWebSocket = () => {
		if (ws.current?.readyState === WebSocket.OPEN) return // Prevent duplicate connections

		ws.current = new WebSocket(`ws://${window.location.host}/api/ws?id=${clientId.value}&name=${name.value}`)

		ws.current.onopen = () => console.log("Connected to WebSocket server")

		ws.current.onmessage = event => {
			console.log("Received:", event.data)
			message.value = event.data
			const data = JSON.parse(event.data) as QuestionData
			question.value = data
		}

		ws.current.onclose = () => {
			console.log("Disconnected from WebSocket. Attempting to reconnect...")
			setTimeout(connectWebSocket, 3000) // Auto-reconnect after 3s
		}

		ws.current.onerror = err => {
			console.error("WebSocket error:", err)
			ws.current?.close() // Ensure a clean close before retrying
		}
	}

	useEffect(() => {
		let storedId = localStorage.getItem("clientId")
		if (!storedId) {
			storedId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
				const r = (Math.random() * 16) | 0
				const v = c === "x" ? r : (r & 0x3) | 0x8
				return v.toString(16)
			})
			localStorage.setItem("clientId", storedId)
		}

		let storedName = localStorage.getItem("name")
		if (!storedName) {
			storedName = prompt("Hãy nhập tên của bạn")
			while (!storedName) storedName = prompt("Tên không được để trống")
			localStorage.setItem("name", storedName)
		}

		clientId.value = storedId
		name.value = storedName

		// Only connect WebSocket after user interaction (Fix for iOS Safari)
		document.addEventListener("click", connectWebSocket, { once: true })

		// Reconnect WebSocket when the page regains focus (Fix for iOS Safari)
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				console.log("Reconnecting WebSocket...")
				connectWebSocket()
			}
		})

		return () => ws.current?.close()
	}, [])

	return (
		<div class="flex flex-col gap-4 items-center">
			<h1 class="text-lg font-semibold">{name}</h1>
			<button class="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={connectWebSocket}>
				Connect WebSocket
			</button>
			<div class="flex-1">
				<div class="justify-self-center self-center flex-1 w-full max-w-screen-2xl flex flex-col gap-24">
					{question.value?.type === "mc" ? <Multichoice question={question.value.question} ws={ws} /> : null}
				</div>
			</div>
		</div>
	)
}
