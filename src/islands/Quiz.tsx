import { useSignal } from "@preact/signals"
import { useEffect, useRef } from "preact/hooks"
import { cn, fisherYatesShuffle, Question } from "../utils.ts"

const colorMap = [
	"bg-red-700 shadow-red-800 active:bg-red-800",
	"bg-green-700 shadow-green-800 active:bg-green-800",
	"bg-blue-700 shadow-blue-800 active:bg-blue-800",
	"bg-yellow-700 shadow-yellow-800 active:bg-yellow-800",
]

export function Quiz(props: { questions: Question[] }) {
	const autoAdvance = useSignal(true)
	const questions = props.questions
	const currentQuestion = useSignal(0)
	const answers = useSignal<number[][]>(Array(questions.length).fill([]))
	const answer = useSignal<number[]>([])
	const showAnswer = useSignal(false)
	const timeout = useRef<number>()
	const skipButton = useRef<HTMLButtonElement>(null)
	const shuffledChoices = useSignal<{ text: string | number; index: number }[]>([])

	const qi = currentQuestion.value
	const q = questions[Math.min(qi, questions.length - 1)]

	const choose = (choice: number) => {
		if (q.type === "Multiple Choice") answer.value = showAnswer.value ? answer.value : [choice]
		else {
			const set = new Set(answer.value)
			if (set.has(choice)) set.delete(choice)
			else set.add(choice)
			answer.value = [...set].toSorted()
		}
	}

	const check = (choice: number) => answer.value.includes(choice)

	const proceed = (mode: "skip" | "submit" | "choose" = "choose") => {
		clearTimeout(timeout.current)

		if (autoAdvance.value) {
			if (q.type === "Multiple Choice" || mode !== "choose") {
				if (mode !== "skip") showAnswer.value = true
				if (answer.value.length) answers.value[qi] = answer.value
				answers.value = [...answers.value]

				timeout.current = setTimeout(() => {
					currentQuestion.value = Math.min(qi + 1, questions.length)
					answer.value = []
					showAnswer.value = false

					if (!skipButton.current) return
					skipButton.current.disabled = true
					setTimeout(() => {
						if (!skipButton.current) return
						skipButton.current.disabled = false
					}, 1000)
				}, mode === "skip" ? 0 : q.type === "Checkbox" ? 3000 : 1500)
			}
		} else {
			if (mode === "submit") {
				if (q.type === "Multiple Choice" || answer.value.length) {
					showAnswer.value = true
					if (answer.value.length) answers.value[qi] = answer.value
					answers.value = [...answers.value]
				}
			} else if (mode === "skip") {
				currentQuestion.value = Math.min(qi + 1, questions.length)
				answer.value = []
				showAnswer.value = false
			}
		}
	}

	useEffect(() => {
		shuffledChoices.value = fisherYatesShuffle(q.choices?.map((text, index) => ({ text, index: index + 1 })) ?? [])
	}, [q])

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Right" || e.key === "ArrowRight") skipButton.current?.click()
			if (e.key === "Enter" && q.type === "Checkbox" && answer.value.length) skipButton.current?.click()
			if (["1", "2", "3", "4"].includes(e.key)) {
				const index = parseInt(e.key) - 1
				if (index < shuffledChoices.value.length) {
					choose(shuffledChoices.value[index].index)
					proceed()
				}
			}
		}

		document.addEventListener("keyup", handler)
		return () => document.removeEventListener("keyup", handler)
	}, [q])

	return (
		currentQuestion.value < questions.length
			? (
				<div class="relative flex flex-col w-full gap-4">
					<div className="grid grid-cols-[repeat(auto-fit,minmax(5px,1fr))] gap-1">
						{Array.from({ length: questions.length },
							(_, i) => (
								<div key={i} class={cn("w-full h-1 rounded-full transition-all", answers.value[i].length === 0
									? "bg-zinc-500"
									: answers.value[i].toSorted().join(",") === questions[i].answer?.toSorted().join(",")
									? "bg-teal-500"
									: "bg-rose-500", currentQuestion.value === i ? "ring-1 ring-zinc-300" : "")} />
							))}
					</div>
					<div className="flex flex-1 gap-4">
						<div class="text-center flex flex-col flex-1 justify-center items-center gap-1 text-2xl md:text-3xl leading-snug whitespace-pre-wrap max-w-screen-xl mx-auto text-balance">
							{q.question.split("\n").map((line, i) => <p key={i}>{line}</p>)}
							{q.image && (
								<img src={q.image} alt="Question Image" class="mt-2 rounded-md max-w-[min(64rem,100%)] max-h-[32rem] mx-auto" />
							)}
						</div>
						{q.explanation?.split("\n").map((line, i) => (
							<div class="flex flex-col gap-2">
								<p key={i} class="text-zinc-600 whitespace-pre-wrap leading-snug">{line}</p>
							</div>
						))}
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-4 text-xl md:text-2xl" id="choices">
						{shuffledChoices.value.map((choice, i) => (
							<button
								type="button"
								class={cn(
									"text-balance px-4 py-2 md:py-4 transition-all hover:translate-y-1 hover:shadow-none rounded-md shadow-[0_4px_0_0] outline-none min-h-12 md:min-h-24 lg:min-h-48",
									check(choice.index) ? "translate-y-1 shadow-none ring-4 ring-zinc-300" : "",
									showAnswer.value && answer.value.length
										? q.answer?.includes(choice.index)
											? "bg-emerald-700 shadow-teal-800"
											: "bg-rose-700 shadow-rose-800"
										: colorMap[i],
								)}
								onClick={() => {
									choose(choice.index)
									proceed()
								}}
							>
								{choice.text}
							</button>
						))}
					</div>
					<div className="flex gap-3 w-full justify-end">
						<button
							type="button"
							class={cn("px-4 py-2 transition-all rounded-md outline-none", autoAdvance.value
								? "bg-emerald-700 shadow-emerald-800 translate-y-1 shadow-none"
								: "bg-rose-700 shadow-rose-800 shadow-[0_4px_0_0]")}
							onClick={() => autoAdvance.value = !autoAdvance.value}
						>
							Tự chuyển câu {autoAdvance.value ? "✓" : "✗"}
						</button>
						<button
							type="button"
							ref={skipButton}
							class="px-4 py-2 transition-all hover:translate-y-1 hover:shadow-[0_0_0_0] rounded-md bg-zinc-600 shadow-[0_4px_0_0] shadow-zinc-700 disabled:opacity-50"
							onClick={() => {
								proceed(answer.value.length && !showAnswer.value ? "submit" : "skip")
								if (!skipButton.current) return
								if (!autoAdvance.value && showAnswer.value) return
								skipButton.current.disabled = true
								setTimeout(() => {
									if (!skipButton.current) return
									skipButton.current.disabled = false
								}, 1000)
							}}
						>
							{showAnswer.value ? "Tiếp" : answer.value.length ? "Gửi" : "Bỏ qua"}
						</button>
					</div>
				</div>
			)
			: (
				<div className="flex flex-col gap-4 max-w-screen-lg mx-auto">
					{questions.map((q, i) => (
						<div key={i} class="flex flex-col gap-3 p-4 rounded-lg border border-zinc-700 shadow-md w-full">
							<h2 class="text-xl whitespace-pre-wrap font-semibold leading-snug">
								<span class="float-right ms-2 mb-2 text-sm text-zinc-400">#{q.id}</span>
								<span>{q.question}</span>
							</h2>
							{q.image && <img src={q.image} alt="Question Image" class="rounded-md max-w-[min(32rem,100%)] max-h-[32rem] mx-auto" />}
							<ul className="flex flex-col gap-2">
								{q.choices?.map((choice, ci) => (
									<li key={ci} class={cn(
										"p-2 rounded",
										questions[i].type === "Checkbox" && !answers.value[i].includes(ci + 1) && q.answer?.includes(ci + 1)
											? "bg-yellow-700"
											: q.answer?.includes(ci + 1)
											? "bg-emerald-700"
											: answers.value[i].includes(ci + 1)
											? "bg-rose-700"
											: "bg-zinc-700",
									)}>
										{choice}
									</li>
								))}
							</ul>
							{q.explanation && (
								<div class="flex flex-col gap-2">
									{q.explanation.split("\n").map((line, i) => (
										<p key={i} class="text-zinc-400 whitespace-pre-wrap leading-snug">{line}</p>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			)
	)
}
