import { useSignal } from "@preact/signals"
import { useEffect, useRef } from "preact/hooks"
import { team1Score, team2Score } from "../scores.ts"
import { slTimer, team1Name, team2Name } from "./_settings.ts"

export const questions = [
	{
		q: 'Welcome to "tự luận"',
		a: [],
		o: [],
		c: [],
	},
	{
		q: "Câu nói tâm đắc",
		a: [
			"Phó chat, Chức đó, Chính thọ",
			"Điều gì tệ hơn 1 người bị LGBT - 5 người bị LGBT",
			"Sáng mê em là thơ, tối mơ em làm thê",
			"real",
		],
		o: [
			"Truyền",
			"Khôi",
			"Đức",
			"Tiến",
		],
		c: [3, 0, 1, 2],
	},
	{
		q: "Câu nói tâm đắc (tiếp theo)",
		a: [
			"Nếu thế giới này có ma quỷ, thì tại sao lại không có được thiên thần?",
			"Lòng chó thì khó nhai còn lòng người thì khó đoán",
			"Nay trời nắng quá, ko biết do ai, có khi là your eyes",
			"Luôn làm người tử tế",
		],
		o: [
			"Khải",
			"Phúc",
			"Đạt",
			"Thịnh",
		],
		c: [3, 0, 1, 2],
	},
	{
		q: "Một điều xấu hổ 🫣",
		a: [
			"Body trước ngon, giờ bel",
			"Năm lớp 3 vẫn dấm đài",
			"Mặc đồ bần hèn chơi trên sàn ướt lúc bão rồi ngã vào vũng nước",
			"Enjoy việc làm Michelin Boi",
			"Cầm đĩa vấp té làm vỡ đĩa và bắn đồ ăn tung toé lúc đi ăn với lớp",
		],
		o: [
			"Bảo",
			"Huy",
			"Đạt",
			"Truyền",
			"Trọng",
		],
		c: [1, 3, 2, 4, 0],
	},
	{
		q: "Cò quay Nga",
		a: [
			"Trí",
			"Phát",
			"Huy",
			"Minh",
			"Hoàng",
			"Tuấn Sơn",
		],
		o: [
			"0 Viên",
			"1 Viên",
			"2 Viên",
			"3 Viên",
			"4 Viên",
			"5 Viên",
		],
		c: [5, 1, 0, 2, 3, 4],
	},
	{
		q: "Có tin vào ma 👻",
		a: [
			"Bảo",
			"Khoa",
			"Thịnh",
			"Nam",
			"Tuấn Sơn",
			"Dương",
			"Khôi",
			"Gia Phúc",
			"Minh Phúc",
			"Khải",
			"Hoàng Long",
			"Hoàng",
		],
		o: ["Có", "Không"],
		c: [1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0],
	},
]

export function Select() {
	const choices = useSignal<Map<string, string>>(new Map())
	const showResults = useSignal(false)
	const currentQuestion = useSignal(0)
	const scores = useSignal<number[]>([])
	const ws = useRef<WebSocket | null>(null)
	const timer = useSignal(0)
	const timeout = useRef<number | null>(null)
	const playerCount = useRef(0)

	useEffect(() => {
		// deno-lint-ignore no-window
		ws.current = new WebSocket(`ws://${window.location.host}/api/ws?id=host`)

		ws.current.onopen = () => {
			console.log("Connected to WebSocket server")
			ws.current?.send(JSON.stringify({ event: "gameplayupdate", data: { type: "wt", question: questions[currentQuestion.value] } }))
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
				type: "wt",
				question: questions[currentQuestion.value],
				choices: [...choices.value.entries()],
			}

			// for each question, coefficient = (wrongAnswers) / (totalPlayers) * 2
			const t1coefficients = questions[currentQuestion.value].c.map((correct, index) => {
				const wrongAnswers = [...choices.value.entries()].filter(choice =>
					choice[0] !== team1Name && parseInt(choice[1][index]) !== correct
				).length
				return wrongAnswers / ((playerCount.current ?? 27) - 1) * 2
			})

			const t2coefficients = questions[currentQuestion.value].c.map((correct, index) => {
				const wrongAnswers =
					[...choices.value.entries()].filter(choice => choice[0] !== team2Name && parseInt(choice[1][index]) !== correct).length
				return wrongAnswers / ((playerCount.current ?? 27) - 1) * 2
			})

			console.log(t1coefficients, t2coefficients)

			// calculate score for each team, if player gets choice[i] right then score += coefficient[i]
			const t1Score = choices.value.get(team1Name)?.split("").reduce((acc, c, i) => {
				return acc + (parseInt(c) === questions[currentQuestion.value].c[i] ? t1coefficients[i] : 0)
			}, 0) ?? 0

			const t2Score = choices.value.get(team2Name)?.split("").reduce((acc, c, i) => {
				return acc + (parseInt(c) === questions[currentQuestion.value].c[i] ? t2coefficients[i] : 0)
			}, 0) ?? 0

			console.log(t1Score, t2Score)

			team1Score.value += parseFloat(t1Score.toFixed(1))
			await fetch(`/api/counter/1@${t1Score.toFixed(1)}`, { method: "POST" })
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
			<div class="justify-self-center self-center flex-1 w-full max-w-screen-2xl flex flex-col gap-6">
				<p class="text-6xl leading-tight w-full text-center font-medium">{questions[currentQuestion.value].q}</p>
				<div class="flex-col text-3xl">
					{currentQuestion.value !== 0 && (
						<div class="grid grid-flow-col bg-[#3B4252] border-2 border-[#4c566a] rounded-lg mt-4">
							<div class="border-r-2 border-[#4c566a] flex-1">
								<div class="px-6 py-3 h-14 items-center justify-center border-b-2 border-[#4c566a]">
								</div>
								{questions[currentQuestion.value].a.map((answer, index) => (
									<div key={index}
										class={`items-center justify-center px-6 py-3 h-14 ${
											index !== questions[currentQuestion.value].a.length - 1 ? "border-b-2 border-[#4c566a]" : ""
										}`}
									>
										{answer}
									</div>
								))}
							</div>
							{questions[currentQuestion.value].o.map((_, oIndex) => {
								return (
									<div key={oIndex} class="text-center border-r-2 border-[#4c566a]">
										<div class="px-6 py-3 h-14 items-center justify-center border-b-2 border-[#4c566a]">
											{questions[currentQuestion.value].o[oIndex]}
										</div>
										{questions[currentQuestion.value].a.map((_, iIndex) => {
											const matches = [...choices.value.values()].filter(choice => parseInt(choice[iIndex]) === oIndex).length
											const rand = Math.floor(Math.random() * ((playerCount.current ?? 27) + 1))
											const shown = showResults.value ? matches : choices.value.size === 0 && timer.value === 0 ? 0 : rand

											return (
												<div key={iIndex}
													class={`relative items-center justify-center px-6 py-3 h-14 ${
														iIndex !== questions[currentQuestion.value].a.length - 1 ? "border-b-2 border-[#4c566a] " : ""
													} ${showResults.value && questions[currentQuestion.value].c[iIndex] === oIndex ? "bg-[#4c566a]" : ""}`}
												>
													{shown}
													<div className="transition-all absolute bottom-0 left-0 h-3 w-[var(--prog)] bg-[#5e81ac]"
														style={{ "--prog": `${shown / (playerCount.current ?? 27) * 100}%` }}
													>
													</div>
												</div>
											)
										})}
									</div>
								)
							})}
						</div>
					)}
				</div>
			</div>
			<div className="grid grid-cols-4 max-w-2xl gap-6 text-xl">
				<button class="text-center bg-[#3B4252] rounded-lg" type="button" onClick={() => {
					currentQuestion.value = Math.max(currentQuestion.value - 1, 0)
					ws.current?.send(
						JSON.stringify({ event: "gameplayupdate", data: { type: "wt", question: questions[currentQuestion.value] } }),
					)
					showResults.value = false
					choices.value = new Map()
				}}>
					👈
				</button>
				<button class="px-6 py-3 bg-[#3B4252] rounded-lg" type="button" onClick={() => runTimer(100, slTimer)} onContextMenu={e => {
					e.preventDefault()
					timer.value = 0
					showResults.value = false
					clearTimeout(timeout.current ?? 0)
				}}>
					▶️
				</button>
				<button class="px-6 py-3 bg-[#3B4252] rounded-lg" type="button" onClick={() => {
					let pts = prompt("Input lựa chọn team chị")
					while (!pts || isNaN(parseInt(pts))) pts = prompt("Input lựa chọn team chị")

					const scor = pts.split("").reduce((acc, c, i) => {
						if (questions[currentQuestion.value].c[i] === parseInt(c)) acc += scores.value[i] * 2
						return acc
					}, 0) / (playerCount.current ?? 27)

					alert(`Điểm của team chị: ${scor}`)
					setTimeout(() => navigator.clipboard.writeText(`${scor}`), 1000)
				}}>
					🔢
				</button>
				<button class="px-6 py-3 bg-[#3B4252] rounded-lg" type="button" onClick={() => {
					currentQuestion.value = Math.min(currentQuestion.value + 1, questions.length - 1)
					ws.current?.send(
						JSON.stringify({ event: "gameplayupdate", data: { type: "wt", question: questions[currentQuestion.value] } }),
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
