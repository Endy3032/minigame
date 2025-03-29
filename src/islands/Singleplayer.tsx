import { useSignal } from "@preact/signals"
import katex from "katex"
import { Fragment } from "preact"
import { useEffect, useRef } from "preact/hooks"
import { Question } from "../types.ts"
import { cn } from "../utils.ts"

const diffBgMap = [
	"bg-gray-200",
	"bg-purple-300",
	"bg-blue-300",
	"bg-green-300",
	"bg-yellow-300",
	"bg-red-300",
]

const diffBorderMap = [
	"border-purple-500",
	"border-blue-500",
	"border-green-500",
	"border-yellow-500",
	"border-red-500",
]

const timerLengthMap = [
	20,
	25,
	30,
	35,
	40,
]

export default function Singleplayer(props: { questions: Question[] }) {
	const autoAdvance = useSignal(true)
	const score = useSignal(0)
	const timerProgress = useSignal(0)

	const currentQuestion = useSignal(0)
	const answered = useSignal(Array(props.questions.length).fill(false))

	const answer = useSignal<string | number>(-1)
	const showAnswer = useSignal(false)
	const timeout = useRef<number>()

	const qi = currentQuestion.value
	const q = props.questions[Math.min(qi, props.questions.length - 1)]

	const renderMathText = (text: string | null) => {
		if (!text) return null

		const regex = /\$(.*?)\$/g
		const parts = text.split(regex)

		return parts.map((part, i) =>
			// deno-lint-ignore react-no-danger
			i % 2 === 1 ? <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part, { throwOnError: false }) }} /> : part
		)
	}

	const proceed = (mode: "skip" | "submit" | "choose" = "choose") => {
		clearTimeout(timeout.current)

		if (answer.value.toString().toLowerCase() === q.answer.toString().toLowerCase()
			&& (mode === "submit" || (autoAdvance.value && mode === "choose")))
		{
			score.value = parseFloat((score.value + timerProgress.value).toFixed(2))
		}

		if (autoAdvance.value) {
			if (mode !== "skip") showAnswer.value = true
			if (answer.value !== -1) answered.value[qi] = true
			answered.value = [...answered.value]

			timeout.current = setTimeout(() => {
				currentQuestion.value = Math.min(qi + 1, props.questions.length)
				answer.value = -1
				showAnswer.value = false
			}, mode === "skip" ? 0 : 5000)
		} else {
			if (mode === "skip") {
				currentQuestion.value = Math.min(qi + 1, props.questions.length)
				showAnswer.value = false
				answer.value = -1
			} else if (mode === "submit") {
				showAnswer.value = true
				answered.value[qi] = true
				answered.value = [...answered.value]
			}
		}
	}

	useEffect(() => {
		if (currentQuestion.value === props.questions.length) {
			timerProgress.value = 0
			clearTimeout(timeout.current)

			const id = localStorage.getItem("id")
				|| Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

			let name: string | null = ""
			while (!name?.trim().length && name !== null) name = prompt("Nhập tên của bạn để lưu điểm số, hoặc hủy để quay về trang chính")

			if (name === null) {
				location.href = "/"
				return
			}

			fetch("/api/score", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ score: score.value, name, id }),
			})
		}
		const timeLimit = timerLengthMap[q.difficulty - 1] * 1000
		const startTime = performance.now()
		let animationFrameId: number

		const animate = () => {
			if (showAnswer.value) return

			const currentTime = performance.now()
			const elapsed = currentTime - startTime
			const remaining = Math.max(0, timeLimit - elapsed)
			const progress = (remaining / timeLimit) * 100
			timerProgress.value = progress

			if (remaining > 0) {
				animationFrameId = requestAnimationFrame(animate)
			} else {
				proceed(answer.value !== -1 ? "submit" : "skip")
			}
		}

		animationFrameId = requestAnimationFrame(animate)

		return () => {
			cancelAnimationFrame(animationFrameId)
		}
	}, [currentQuestion.value])

	return (
		<div class="flex flex-1 flex-col w-full max-w-screen-lg gap-4">
			<div class="sticky top-4 z-10 flex gap-4 justify-center items-center bg-gray-100/50 backdrop-blur-lg border border-gray-300/60 rounded-xl px-2 py-1 w-max mx-auto shadow-lg">
				<span>Điểm</span>
				<span class="text-2xl font-bold">{score.value}</span>
			</div>
			<div class="grid grid-cols-10 gap-1">
				{[...Array(10)].map((_, i) => (
					<div key={i} class={cn(
						"flex-1 rounded-full h-2 transition-all",
						diffBorderMap[props.questions[i].difficulty - 1],
						answered.value[i] ? "bg-blue-200" : "bg-gray-200",
						i === qi ? "animate-pulse shadow-[0_0_2px_0_black] border-2" : "border",
					)}>
					</div>
				))}
			</div>

			{currentQuestion.value < props.questions.length
				? (
					<div class="relative flex flex-col w-full bg-gray-100 rounded-xl overflow-hidden shadow-lg px-4 py-4 pb-8 gap-4">
						<div class="flex gap-3">
							<span>Độ khó {q.difficulty}</span>
							<div class="flex flex-1 gap-1 items-center">
								{[...Array(5)].map((_, i) => (
									<div key={i} class={cn(
										"flex-1 h-2 rounded-full",
										q.difficulty && i < q.difficulty ? diffBgMap[i + 1] : "bg-gray-200",
									)} />
								))}
							</div>
						</div>
						<div class="flex flex-col gap-1 text-2xl leading-tight whitespace-pre-wrap">
							{q.question.split("\n").map((line, i) => <p key={i}>{i === 0 ? `Câu ${qi + 1}. ` : ""}{renderMathText(line)}</p>)}
						</div>
						{q.image && (
							<img src={q.image.startsWith("http") ? q.image : `/questions/${q.image}`} alt="Question Image"
								class="rounded-md max-w-[min(32rem,100%)] max-h-[32rem] mx-auto" />
						)}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-3 text-white text-xl" id="choices">
							{q.a?.toString().length && (
								<button
									type="button"
									class={cn(
										"px-4 py-4 transition-all hover:translate-y-1 hover:shadow-none rounded-md shadow-[0_4px_0_0]",
										answer.value === "A" ? "animate-pulse translate-y-1 shadow-none" : "",
										showAnswer.value && answer.value !== -1
											? q.answer === "A" ? "bg-green-500 shadow-green-600" : "bg-red-500 shadow-red-600"
											: "bg-red-500 shadow-red-600 active:bg-red-600",
									)}
									onClick={() => {
										answer.value = "A"
										proceed()
									}}
								>
									{renderMathText(q.a.toString())}
								</button>
							)}
							{q.b?.toString().length && (
								<button
									type="button"
									class={cn(
										"px-4 py-4 transition-all hover:translate-y-1 hover:shadow-none rounded-md shadow-[0_4px_0_0]",
										answer.value === "B" ? "animate-pulse translate-y-1 shadow-none" : "",
										showAnswer.value && answer.value !== -1
											? q.answer === "B" ? "bg-green-500 shadow-green-600" : "bg-red-500 shadow-red-600"
											: "bg-green-500 shadow-green-600 active:bg-green-600",
									)}
									onClick={() => {
										answer.value = "B"
										proceed()
									}}
								>
									{renderMathText(q.b.toString())}
								</button>
							)}
							{q.c?.toString().length && (
								<button
									type="button"
									class={cn(
										"px-4 py-4 transition-all hover:translate-y-1 hover:shadow-none rounded-md shadow-[0_4px_0_0]",
										answer.value === "C" ? "animate-pulse translate-y-1 shadow-none" : "",
										showAnswer.value && answer.value !== -1
											? q.answer === "C" ? "bg-green-500 shadow-green-600" : "bg-red-500 shadow-red-600"
											: "bg-blue-500 shadow-blue-600 active:bg-blue-600",
									)}
									onClick={() => {
										answer.value = "C"
										proceed()
									}}
								>
									{renderMathText(q.c.toString())}
								</button>
							)}
							{q.d?.toString().length && (
								<button
									type="button"
									class={cn(
										"px-4 py-4 transition-all hover:translate-y-1 hover:shadow-none rounded-md shadow-[0_4px_0_0]",
										answer.value === "D" ? "animate-pulse translate-y-1 shadow-none" : "",
										showAnswer.value && answer.value !== -1
											? q.answer === "D" ? "bg-green-500 shadow-green-600" : "bg-red-500 shadow-red-600"
											: "bg-yellow-500 shadow-yellow-600 active:bg-yellow-600",
									)}
									onClick={() => {
										answer.value = "D"
										proceed()
									}}
								>
									{renderMathText(q.d.toString())}
								</button>
							)}
							{[q.a, q.b, q.c, q.d].filter(Boolean).length === 0 && (
								<input
									type="text"
									class="px-4 py-4 col-span-2 transition-all hover:translate-y-1 hover:shadow-[0_0_0_0] rounded-md bg-gray-500 shadow-[0_4px_0_0] shadow-gray-600"
									pattern="[0-9]\.,-"
									onInput={e => answer.value = (e.target as HTMLInputElement).value || -1}
								/>
							)}
							{showAnswer.value && (
								<div class="flex flex-col gap-2 col-span-2">
									<div class="p-2 rounded bg-blue-400">Đáp án: {renderMathText(q.answer?.toString())}</div>
									<div class="flex flex-col gap-2">
										{q.explanation?.split("\n").map((line, i) => (
											<p key={i} class="text-gray-600 whitespace-pre-wrap leading-tight">{renderMathText(line)}</p>
										))}
									</div>
								</div>
							)}
						</div>
						<div className="grid grid-cols-3 gap-2 text-white max-w-lg self-center">
							<button
								type="button"
								class="px-4 py-2 transition-all hover:translate-y-1 hover:shadow-[0_0_0_0] rounded-md bg-gray-600 shadow-[0_4px_0_0] shadow-gray-700"
								onClick={() => proceed("skip")}
							>
								{showAnswer.value ? "Tiếp" : "Bỏ qua"}
							</button>
							<button
								disabled={answer.value === -1 || showAnswer.value}
								type="button"
								class="px-4 py-2 transition-all hover:translate-y-1 hover:shadow-[0_0_0_0] rounded-md bg-blue-500 shadow-[0_4px_0_0] shadow-blue-600 disabled:opacity-25"
								onClick={() => proceed("submit")}
							>
								Xác nhận
							</button>
							<button
								type="button"
								class={cn("px-4 py-2 transition-all rounded-md", autoAdvance.value
									? "bg-green-500 shadow-green-600 translate-y-1 shadow-none"
									: "bg-red-500 shadow-red-600 shadow-[0_4px_0_0]")}
								onClick={() => autoAdvance.value = !autoAdvance.value}
							>
								Tự chuyển câu {autoAdvance.value ? "✓" : "✗"}
							</button>
						</div>
						<div class="fixed bottom-0 left-0 h-4 bg-blue-600" style={{ width: `${timerProgress.value}%` }}></div>
					</div>
				)
				: props.questions.map((question, i) => (
					<div key={i} class="flex flex-col gap-3 bg-white p-6 rounded-lg shadow-md w-full">
						<div class="flex flex-col gap-1 mb-2">
							<span>Độ khó {question.difficulty}</span>
							<div class="flex gap-1">
								{/* difficulty color bars */}
								{[...Array(5)].map((_, i) => (
									<div key={i}
										class={`w-full h-2 rounded-full ${
											question.difficulty && i < question.difficulty ? diffBgMap[i + 1] : "bg-gray-200"
										}`} />
								))}
							</div>
						</div>
						<h2 class="text-xl whitespace-pre-wrap font-semibold text-gray-800 leading-tight">
							{renderMathText(question.question)}
						</h2>
						{question.image && (
							<img src={question.image.startsWith("http") ? question.image : `/questions/${question.image}`} alt="Question Image"
								class="rounded-md max-w-[min(32rem,100%)] max-h-[32rem] mx-auto" />
						)}
						{question.a && question.b
							? (
								<ul class="flex flex-col gap-2 py-1">
									<li class={`p-2 rounded ${question.answer?.toString().toLowerCase() === "a" ? "bg-green-400" : "bg-blue-100"}`}>
										A: {renderMathText(question.a?.toString())}
									</li>
									<li class={`p-2 rounded ${question.answer?.toString().toLowerCase() === "b" ? "bg-green-400" : "bg-blue-100"}`}>
										B: {renderMathText(question.b?.toString())}
									</li>
									{question.c && (
										<li class={`p-2 rounded ${question.answer?.toString().toLowerCase() === "c" ? "bg-green-400" : "bg-blue-100"}`}>
											C: {renderMathText(question.c?.toString())}
										</li>
									)}
									{question.d && (
										<li class={`p-2 rounded ${question.answer?.toString().toLowerCase() === "d" ? "bg-green-400" : "bg-blue-100"}`}>
											D: {renderMathText(question.d?.toString())}
										</li>
									)}
								</ul>
							)
							: <div class="p-2 rounded bg-blue-300">Đáp án: {renderMathText(question.answer?.toString())}</div>}
						<div class="flex flex-col gap-2">
							{question.explanation?.split("\n").map((line, i) => (
								<p key={i} class="text-gray-600 whitespace-pre-wrap leading-tight">{renderMathText(line)}</p>
							))}
						</div>
						<span class="text-sm text-gray-400">
							#{question.id}
						</span>
					</div>
				))}
		</div>
	)
}
