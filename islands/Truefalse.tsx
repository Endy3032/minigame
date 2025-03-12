import { useSignal } from "@preact/signals"
import { useEffect, useRef } from "preact/hooks"
import { team1Score, team2Score } from "../scores.ts"
import { team1Name, team2Name, tfTimer } from "./_settings.ts"

export const questions = [
	{
		q: "Welcome to đúng sai (dạng dạng vậy)",
		a: [],
		o: [],
		c: [],
	},
	{
		q: "Một bên đường ray là năm Minh Đức, một bên là một Khang Thịnh đang hoảng horse. Bạn sẽ hướng xe lửa về đâu?",
		a: [
			"Huy",
			"Trí",
			"Vinh",
			"Gia Phúc",
			"Bảo",
		],
		o: [
			"5 mduc",
			"1 kthinh",
		],
		c: [0, 1, 1, 0, 1],
	},
	{
		q: "Giáo viên yêu thích nhất",
		a: [
			"Khoa: Thầy Phi (lớp 12)",
			"Minh : Thầy Phi (lớp 12)",
			"Khôi: Cô nhi (dưới lớp 5)",
			"Hoàng Long: Thầy Quang Anh (lớp 11)",
			"Hoàng: Cô Quỳnh (lớp 12)",
		],
		o: [
			"Đúng",
			"Sai",
		],
		c: [1, 0, 0, 0, 1],
	},
]

export function Truefalse() {
	const choices = useSignal<Map<string, string>>(new Map())
	const showResults = useSignal(false)
	const currentQuestion = useSignal(0)
	const maxScore = useSignal(0)
	const ws = useRef<WebSocket | null>(null)
	const timer = useSignal(0)
	const timeout = useRef<number | null>(null)
	const playerCount = useRef(0)

	useEffect(() => {
		// deno-lint-ignore no-window
		ws.current = new WebSocket(`ws://${window.location.host}/api/ws?id=host`)

		ws.current.onopen = () => {
			console.log("Connected to WebSocket server")
			ws.current?.send(JSON.stringify({ event: "gameplayupdate", data: { type: "tf", question: questions[currentQuestion.value] } }))
		}

		ws.current.onmessage = event => {
			const data = JSON.parse(event.data)

			if (data.event === "answer" && showResults.value === false) {
				const map = choices.value
				map.set(`${data.data.name} ${data.data.id}`, data.data.choice)
				choices.value = new Map(map)
			} else if (data.event === "join") {
				playerCount.current = data.data.count
			}
		}

		ws.current.onclose = () => console.log("Disconnected from WebSocket")

		return () => {
			ws.current?.close()
		}
	}, [])

	const runTimer = async (progress: number, duration: number) => {
		timer.value = progress
		showResults.value = false
		if (progress > 0) timeout.current = setTimeout(() => runTimer(Math.max(progress - 5, 0), duration), duration / 20)
		else {
			showResults.value = true

			const data = {
				type: "tf",
				question: questions[currentQuestion.value],
				choices: [...choices.value.entries()],
			}

			const max = [...choices.value.values()].reduce((acc, choice) => {
				return acc
					+ Math.pow(2, choice.split("").reduce((acc, cur, i) =>
						acc + (parseInt(cur) === questions[currentQuestion.value].c[i] ? 1 : 0), 0) - 4)
			}, 0)
			maxScore.value = max

			console.log(choices.value)

			alert(`${maxScore.value} điểm max`)

			const t1Score = [0, 0.0625, 0.125, 0.25, 0.5, 1][
				choices.value.get(team1Name)?.split("").reduce((acc, c, i) => {
					if (questions[currentQuestion.value].c[i] === parseInt(c)) acc++
					return acc
				}, 0) ?? 0
			] * maxScore.value
			team1Score.value += parseFloat(t1Score.toFixed(1))
			await fetch(`/api/counter/1@${t1Score.toFixed(1)}`, { method: "POST" })

			const t2Score = [0, 0.0625, 0.125, 0.25, 0.5, 1][
				choices.value.get(team2Name)?.split("").reduce((acc, c, i) => {
					if (questions[currentQuestion.value].c[i] === parseInt(c)) acc++
					return acc
				}, 0) ?? 0
			] * maxScore.value
			team2Score.value += parseFloat(t2Score.toFixed(1))
			await fetch(`/api/counter/2@${t2Score.toFixed(1)}`, { method: "POST" })

			await fetch("/api/savedb", {
				method: "POST",
				body: JSON.stringify(data),
			})
		}
	}

	return (
		<div class="relative flex flex-1 flex-col gap-12 items-center">
			<div class="justify-self-center self-center flex-1 w-full max-w-screen-2xl flex flex-col gap-16">
				<p class="text-6xl leading-tight w-full text-center font-medium">{questions[currentQuestion.value].q}</p>
				<div class="flex-col text-3xl">
					{currentQuestion.value !== 0 && (
						<div class="grid grid-cols-10 bg-[#3B4252] border-2 border-[#4c566a] rounded-lg mt-4">
							<div class="col-span-6 border-r-2 border-[#4c566a]">
								<div class="px-6 py-3 h-16 items-center justify-center border-b-2 border-[#4c566a]">
									Câu hỏi
								</div>
								{questions[currentQuestion.value].a.map((answer, index) => (
									<div key={index}
										class={`items-center justify-center px-6 py-3 h-16 ${
											index !== questions[currentQuestion.value].a.length - 1 ? "border-b-2 border-[#4c566a]" : ""
										}`}
									>
										{answer}
									</div>
								))}
							</div>
							<div class="col-span-2 text-center border-r-2 border-[#4c566a]">
								<div class="px-6 py-3 h-16 items-center justify-center border-b-2 border-[#4c566a]">
									{questions[currentQuestion.value].o ? questions[currentQuestion.value].o[0] : ""}
								</div>
								{questions[currentQuestion.value].a.map((_, index) => {
									const matches = [...choices.value.values()].filter(choice => parseInt(choice[index]) === 0).length
									const rand = Math.floor(Math.random() * ((playerCount.current ?? 27) + 1))
									const shown = showResults.value ? matches : choices.value.size === 0 && timer.value === 0 ? 0 : rand

									return (
										<div key={index}
											class={`relative items-center justify-center px-6 py-3 h-16 ${
												index !== questions[currentQuestion.value].a.length - 1 ? "border-b-2 border-[#4c566a] " : ""
											} ${showResults.value && questions[currentQuestion.value].c[index] === 0 ? "bg-[#4c566a]" : ""}`}
										>
											{shown}
											<div className="transition-all absolute bottom-0 right-0 h-3 w-[var(--prog)] bg-[#5e81ac]"
												style={{ "--prog": `${shown / (playerCount.current ?? 27) * 100}%` }}
											>
											</div>
										</div>
									)
								})}
							</div>
							<div class="col-span-2 text-center">
								<div class="px-6 py-3 h-16 items-center justify-center border-b-2 border-[#4c566a]">
									{questions[currentQuestion.value].o ? questions[currentQuestion.value].o[1] : ""}
								</div>
								{questions[currentQuestion.value].a.map((_, index) => {
									const matches = [...choices.value.values()].filter(choice => parseInt(choice[index]) === 1).length
									const rand = Math.floor(Math.random() * ((playerCount.current ?? 27) + 1))
									const shown = showResults.value ? matches : choices.value.size === 0 && timer.value === 0 ? 0 : rand

									return (
										<div key={index}
											class={`relative items-center justify-center px-6 py-3 h-16 ${
												index !== questions[currentQuestion.value].a.length - 1 ? "border-b-2 border-[#4c566a] " : ""
											} ${showResults.value && questions[currentQuestion.value].c[index] === 1 ? "bg-[#4c566a]" : ""}`}
										>
											{shown}
											<div className="transition-all absolute bottom-0 left-0 h-3 w-[var(--prog)] bg-[#bf616a]"
												style={{ "--prog": `${shown / (playerCount.current ?? 27) * 100}%` }}
											>
											</div>
										</div>
									)
								})}
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="grid grid-cols-4 max-w-2xl gap-6 text-xl">
				<button class="text-center bg-[#3B4252] rounded-lg" type="button" onClick={() => {
					currentQuestion.value = Math.max(currentQuestion.value - 1, 0)
					ws.current?.send(
						JSON.stringify({ event: "gameplayupdate", data: { type: "tf", question: questions[currentQuestion.value] } }),
					)
					showResults.value = false
					choices.value = new Map()
				}}>
					👈
				</button>
				<button class="px-6 py-3 bg-[#3B4252] rounded-lg" type="button" onClick={() => runTimer(100, tfTimer)} onContextMenu={e => {
					e.preventDefault()
					timer.value = 0
					showResults.value = false
					clearTimeout(timeout.current ?? 0)
				}}>
					▶️
				</button>
				<button class="px-6 py-3 bg-[#3B4252] rounded-lg" type="button" onClick={() => {
					let pts = prompt("Input ans team chị")
					while (!pts || isNaN(parseInt(pts))) pts = prompt("Input ans team chị")
					const weightedPts = [0, 0.0625, 0.125, 0.25, 0.5, 1][
						pts.split("").reduce((acc, c, i) => {
							if (questions[currentQuestion.value].c[i] === parseInt(c)) acc++
							return acc
						}, 0)
					]

					setTimeout(async () => await navigator.clipboard.writeText((weightedPts * maxScore.value).toFixed(1)), 500)
				}}>
					🔢
				</button>
				<button class="px-6 py-3 bg-[#3B4252] rounded-lg" type="button" onClick={() => {
					currentQuestion.value = Math.min(currentQuestion.value + 1, questions.length - 1)
					ws.current?.send(
						JSON.stringify({ event: "gameplayupdate", data: { type: "tf", question: questions[currentQuestion.value] } }),
					)
					showResults.value = false
					choices.value = new Map()
				}}>
					👉
				</button>
			</div>
			<div className="fixed bottom-6 rounded-lg h-6 w-[calc(var(--prog)-3rem)] bg-[#81a1c1] transition-all"
				style={{ "--prog": timer.value + "%" }}
			>
			</div>
		</div>
	)
}
