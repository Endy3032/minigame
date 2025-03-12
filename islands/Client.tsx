import { useSignal } from "@preact/signals"
import { MutableRef, useEffect, useRef } from "preact/hooks"

type MultichoiceQuestion = {
	q: string
	a: string[]
}

type TruefalseQuestion = {
	q: string
	a: string[]
	o: [string, string]
}

type WrittenQuestion = {
	q: string
	a: string[]
	o: string[]
}

type QuestionData = {
	type: "mc"
	question: MultichoiceQuestion
} | {
	type: "tf"
	question: TruefalseQuestion
} | {
	type: "wt"
	question: WrittenQuestion
} | null

type EventName = "join" | "answer" | "gameplayupdate"

type WSEvent = {
	event: EventName
	data: QuestionData
}

function Multichoice(props: { question: MultichoiceQuestion; ws: MutableRef<WebSocket | null> }) {
	const { question, ws } = props
	const chosen = useSignal<string | null>(null)

	return (
		<div class="flex flex-col gap-4 items-center text-center">
			<h1 class="font-semibold text-2xl">{question.q}</h1>
			<div class="w-full flex flex-col gap-6">
				{question.a.map(answer => (
					<button
						class={"w-full relative flex items-center justify-center px-6 py-3 min-h-20 text-xl rounded-lg "
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

function Truefalse(props: { question: TruefalseQuestion; ws: MutableRef<WebSocket | null> }) {
	const { question, ws } = props
	const chosens = useSignal<number[]>([2, 2, 2, 2, 2])

	return (
		<div className="flex flex-1 w-full flex-col gap-4 items-center text-center">
			<h1 class="font-semibold text-2xl">{question.q}</h1>
			<div className="w-full flex flex-1 flex-col gap-6">
				{question.a.map((answer, index) => {
					return (
						<div className="w-full text-xl rounded-lg items-center justify-center bg-[#3B4252]">
							<div className="py-4 bg-[#434c5e] rounded-lg">
								{answer}
							</div>
							<div className="grid grid-cols-2 items-center p-2 gap-2">
								<button
									class={"rounded-lg py-2 " + (chosens.value[index] === 0 ? "bg-[#5e81ac]" : "bg-[#3B4252]")}
									type="button"
									onClick={() => {
										chosens.value[index] = 0
										chosens.value = [...chosens.value]
										ws.current?.send(chosens.value.join(""))
									}}
								>
									{question.o[0]}
								</button>
								<button
									class={"rounded-lg py-2 " + (chosens.value[index] === 1 ? "bg-[#5e81ac]" : "bg-[#3B4252]")}
									type="button"
									onClick={() => {
										chosens.value[index] = 1
										chosens.value = [...chosens.value]
										ws.current?.send(chosens.value.map(e => e.toString()[0]).join(""))
									}}
								>
									{question.o[1]}
								</button>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

function Select(props: { question: WrittenQuestion; ws: MutableRef<WebSocket | null> }) {
	const { question, ws } = props
	const chosens = useSignal<number[]>(Array(question.a.length).fill(-1))

	useEffect(() => {
		chosens.value = Array(question.a.length).fill(-1)
	}, [question])

	return (
		<div className="flex flex-1 w-full flex-col gap-4 items-center text-center">
			<h1 class="font-semibold text-2xl">{question.q}</h1>
			<div className="w-full flex flex-1 flex-col gap-6">
				{question.a.map((answer, index) => {
					return (
						<div className="w-full text-xl rounded-lg items-center justify-center bg-[#3B4252]">
							<div className="py-4 px-2 bg-[#434c5e] rounded-lg">
								{answer}
							</div>
							<div className="grid grid-cols-2 items-center p-2 gap-2">
								{question.o.map((option, optionIndex) => (
									<button
										class={"rounded-lg py-2 " + (chosens.value[index] === optionIndex ? "bg-[#5e81ac]" : "bg-[#3B4252]")}
										type="button"
										onClick={() => {
											chosens.value[index] = optionIndex
											chosens.value = [...chosens.value]
											ws.current?.send(chosens.value.map(e => e.toString()[0]).join(""))
										}}
									>
										{option}
									</button>
								))}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export function Client() {
	const clientId = useSignal<string>("")
	const name = useSignal<string>("")
	const question = useSignal<QuestionData>(null)
	const ws = useRef<WebSocket | null>(null)

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

		ws.current = new WebSocket(`ws://${window.location.host}/api/ws?id=${clientId.value}&name=${name.value}`)

		ws.current.onopen = () => console.log("Connected to WebSocket server")

		ws.current.onmessage = event => {
			console.log("Received:", event.data)
			const data = JSON.parse(event.data) as WSEvent

			if (data.event === "gameplayupdate") {
				question.value = data.data
			}
		}

		ws.current.onclose = () => console.log("Disconnected from WebSocket")

		return () => ws.current?.close()
	}, [])

	return (
		<div class="flex flex-1 w-full max-w-screen-md flex-col gap-4 items-center">
			<h1 class="text-lg font-semibold">{name}</h1>
			<div class="flex-1 w-full">
				<div class="justify-self-center self-center flex-1 w-full max-w-screen-2xl flex flex-col gap-24">
					{question.value?.type === "mc"
						? <Multichoice question={question.value.question} ws={ws} />
						: question.value?.type === "tf"
						? <Truefalse question={question.value.question} ws={ws} />
						: question.value?.type === "wt"
						? <Select question={question.value.question} ws={ws} />
						: null}
				</div>
			</div>
		</div>
	)
}
