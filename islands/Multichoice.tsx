import { useSignal } from "@preact/signals"
import { useEffect, useRef } from "preact/hooks"
import { team1Score, team2Score } from "../scores.ts"
import { mcTimer, team1Name, team2Name } from "./_settings.ts"

export const questions = [
	{
		q: "Welcome to trắc nghiệm",
		a: [],
	},
	{
		q: "Khi rảnh, Phát làm gì nhiều nhất (sắp xếp)",
		a: [
			"Chơi game > Lướt MXH, xem phim > Đọc sách",
			"Lướt MXH, xem phim > Chơi game > Đọc sách",
			"Lướt MXH, xem phim > Đọc sách > Chơi game",
			"Đọc sách > lướt MXH, xem phim > Chơi game",
		],
		c: "Lướt MXH, xem phim > Đọc sách > Chơi game",
	},
	{
		q: "Người nào sau đây nếu được chọn giới tính sẽ chọn nữ",
		a: [
			"Đức",
			"Dương",
			"Hoàng",
			"Trọng",
		],
		c: "Trọng",
	},
	{
		q: "Điều khiến Thái Dương xấu hổ",
		a: [
			"Sờ má, nắm tay Gia Truyền",
			"Nhìn thấy Ngô Heo",
			"Ngồi cạnh Phương Uyên",
			"Được Khải sờ vào người",
		],
		c: "Nhìn thấy Ngô Heo",
	},
	{
		q: "Sự thật thú vị về Khôi là",
		a: [
			"Tỉ lệ đậu thấp nhưng “củ đậu” to",
			"Đẹp trai nhất lớp",
			"Uocjbk",
			"Phở lấy Ch** Ch*** làm vại",
		],
		c: "Tỉ lệ đậu thấp nhưng “củ đậu” to",
	},
	{
		q: "Sự thật thú vị về Tiến là",
		a: [
			"Buồn ngủ vào mỗi tiết văn",
			"Toxic nhất lớp",
			"Trước h chỉ có một vk",
			"Lớp 11 bị mental breakdown",
		],
		c: "Buồn ngủ vào mỗi tiết văn",
	},
]

export function Multichoice() {
	const choices = useSignal<Map<string, string>>(new Map())
	const showResults = useSignal(false)
	const currentQuestion = useSignal(0)
	const ws = useRef<WebSocket | null>(null)
	const timer = useSignal(0)
	const timeout = useRef<number | null>(null)
	const playerCount = useRef(0)

	useEffect(() => {
		ws.current = new WebSocket(`ws://${window.location.host}/api/ws?id=host`)

		ws.current.onopen = () => {
			console.log("Connected to WebSocket server")
			ws.current?.send(JSON.stringify({ event: "gameplayupdate", data: { type: "mc", question: questions[currentQuestion.value] } }))
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
				type: "mc",
				question: questions[currentQuestion.value],
				choices: [...choices.value.entries()],
			}

			const pts = parseFloat(
				((playerCount.current - [...choices.value.values()].filter(choice => choice === questions[currentQuestion.value].c).length)
					/ playerCount.current * 10).toFixed(1),
			)
			console.log(pts)

			alert(`+${pts}`)
			await navigator.clipboard.writeText(pts.toString())

			console.log(choices.value.get(team1Name), choices.value.get(team2Name), choices.value)

			if (choices.value.get(team1Name) === questions[currentQuestion.value].c) {
				console.log("HI")
				team1Score.value += pts
				await fetch(`/api/counter/1@${pts}`, { method: "POST" })
			}
			if (choices.value.get(team2Name) === questions[currentQuestion.value].c) {
				console.log("HII")
				team2Score.value += pts
				await fetch(`/api/counter/2@${pts}`, { method: "POST" })
			}

			await fetch("/api/savedb", {
				method: "POST",
				body: JSON.stringify(data),
			})
		}
	}

	return (
		<div class="relative flex flex-1 flex-col gap-12 items-center">
			<div class="justify-self-center self-center flex-1 w-full max-w-screen-2xl flex flex-col gap-24">
				<p class="text-6xl leading-tight w-full text-center font-medium">{questions[currentQuestion.value].q}</p>
				<div className="grid grid-cols-2 grid-rows-2 gap-6">
					{questions[currentQuestion.value].a.map(answer => {
						const perc = ([...choices.value.values()].filter(choice => choice === answer).length / choices.value.size * 100) || 0
						const rand = Math.floor(Math.random() * 101)
						const shown = showResults.value ? perc : choices.value.size === 0 && timer.value === 0 ? 0 : rand
						return (
							<div
								class={"relative flex text-center items-center justify-center px-6 py-3 min-h-48 text-4xl bg-[#3B4252] rounded-lg"
									+ (showResults.value && answer === questions[currentQuestion.value].c ? " bg-[#4c566a]" : "")}
								key={answer}
							>
								{answer}
								<div className="absolute bottom-0 h-5 w-full flex items-center gap-2 font-mono text-sm p-1 pr-2">
									<div class="h-3 w-[var(--prog)] text-sm bg-[#d8dee9] transition-all rounded-lg" style={{ "--prog": `${shown}%` }}>
									</div>
									<span class={"top-0" + (shown === 0 ? " hidden" : "")}>{shown.toFixed(1)}%</span>
								</div>
							</div>
						)
					})}
				</div>
			</div>
			<div className="grid grid-cols-3 max-w-2xl gap-6 text-xl">
				<button class="text-center bg-[#3B4252] rounded-lg" type="button" onClick={() => {
					currentQuestion.value = Math.max(currentQuestion.value - 1, 0)
					ws.current?.send(
						JSON.stringify({ event: "gameplayupdate", data: { type: "mc", question: questions[currentQuestion.value] } }),
					)
					showResults.value = false
					choices.value = new Map()
				}}>
					👈
				</button>
				<button class="px-6 py-3 bg-[#3B4252] rounded-lg" type="button" onClick={() => runTimer(100, mcTimer)} onContextMenu={e => {
					e.preventDefault()
					timer.value = 0
					showResults.value = false
					clearTimeout(timeout.current ?? 0)
				}}>
					▶️
				</button>
				<button class="px-6 py-3 bg-[#3B4252] rounded-lg" type="button" onClick={() => {
					currentQuestion.value = Math.min(currentQuestion.value + 1, questions.length - 1)
					ws.current?.send(
						JSON.stringify({ event: "gameplayupdate", data: { type: "mc", question: questions[currentQuestion.value] } }),
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
