import { useSignal } from "@preact/signals"
import { useEffect, useRef } from "preact/hooks"
import { cn, Question } from "../utils.ts"

export function Quiz(props: { questions: Question[] }) {
	const autoAdvance = useSignal(true)
	const questions = props.questions
	const currentQuestion = useSignal(0)
	const answers = useSignal<number[][]>(Array(questions.length).fill([]))
	const answer = useSignal<number[]>([])
	const showAnswer = useSignal(false)
	const timeout = useRef<number>()
	const skipButton = useRef<HTMLButtonElement>(null)

	const qi = currentQuestion.value
	const q = questions[Math.min(qi, questions.length - 1)]

	const choose = (choice: number) => {
		if (q.type === "Multiple Choice") answer.value = showAnswer.value ? answer.value : [choice]
		else {
			const set = new Set(answer.value)
			if (set.has(choice)) set.delete(choice)
			else set.add(choice)
			answer.value = [...set]
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
				}, mode === "skip" ? 0 : 2000)
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
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Right" || e.key === "ArrowRight") skipButton.current?.click()
			if (e.key === "Enter" && q.type === "Checkbox" && answer.value.length) skipButton.current?.click()
			if (!["1", "2", "3", "4"].includes(e.key)) return
			choose(parseInt(e.key))
			proceed()
		}

		document.addEventListener("keyup", handler)
		return () => document.removeEventListener("keyup", handler)
	}, [qi])

	return (
		currentQuestion.value < questions.length
			? (
				<div class="relative flex flex-col w-full gap-4">
					<div className="grid grid-cols-[repeat(auto-fit,minmax(5px,1fr))] gap-1">
						{Array.from({ length: questions.length },
							(_, i) => (
								<div key={i} class={cn("w-full h-1 rounded-full transition-all", answers.value[i].length === 0
									? "bg-zinc-500"
									: answers.value[i].join(",") === questions[i].answer.toString().split(",").toSorted().join(",")
									? "bg-teal-500"
									: "bg-rose-500", currentQuestion.value === i ? "ring-1 ring-zinc-300" : "")} />
							))}
					</div>
					<div className="flex flex-1 gap-4">
						<div class="text-center flex flex-col flex-1 justify-center items-center gap-1 text-2xl md:text-3xl leading-tight whitespace-pre-wrap max-w-screen-xl mx-auto text-balance">
							{q.question.split("\n").map((line, i) => <p key={i}>{line}</p>)}
							{q.image && (
								<img src={q.image} alt="Question Image" class="mt-2 rounded-md max-w-[min(64rem,100%)] max-h-[32rem] mx-auto" />
							)}
						</div>
						{q.explanation?.split("\n").map((line, i) => (
							<div class="flex flex-col gap-2">
								<p key={i} class="text-zinc-600 whitespace-pre-wrap leading-tight">{line}</p>
							</div>
						))}
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4 text-xl md:text-2xl" id="choices">
						{q.a?.toString().length && (
							<button
								type="button"
								class={cn(
									"text-balance px-4 py-4 transition-all hover:translate-y-1 hover:shadow-none rounded-md shadow-[0_4px_0_0] outline-none min-h-16 md:min-h-24",
									check(1) ? "translate-y-1 shadow-none ring-4 ring-zinc-300" : "",
									showAnswer.value && answer.value.length
										? q.answer.toString().includes("1") ? "bg-emerald-700 shadow-teal-800" : "bg-rose-700 shadow-rose-800"
										: "bg-red-700 shadow-red-800 active:bg-red-800",
								)}
								onClick={() => {
									choose(1)
									proceed()
								}}
							>
								{q.a.toString()}
							</button>
						)}
						{q.b?.toString().length && (
							<button
								type="button"
								class={cn(
									"text-balance px-4 py-4 transition-all hover:translate-y-1 hover:shadow-none rounded-md shadow-[0_4px_0_0] outline-none min-h-16 md:min-h-24",
									check(2) ? "translate-y-1 shadow-none ring-4 ring-zinc-300" : "",
									showAnswer.value && answer.value.length
										? q.answer.toString().includes("2") ? "bg-emerald-700 shadow-teal-800" : "bg-rose-700 shadow-rose-800"
										: "bg-green-700 shadow-green-800 active:bg-green-800",
								)}
								onClick={() => {
									choose(2)
									proceed()
								}}
							>
								{q.b.toString()}
							</button>
						)}
						{q.c?.toString().length && (
							<button
								type="button"
								class={cn(
									"text-balance px-4 py-4 transition-all hover:translate-y-1 hover:shadow-none rounded-md shadow-[0_4px_0_0] outline-none min-h-16 md:min-h-24",
									check(3) ? "translate-y-1 shadow-none ring-4 ring-zinc-300" : "",
									showAnswer.value && answer.value.length
										? q.answer.toString().includes("3") ? "bg-emerald-700 shadow-teal-800" : "bg-rose-700 shadow-rose-800"
										: "bg-blue-700 shadow-blue-800 active:bg-blue-800",
								)}
								onClick={() => {
									choose(3)
									proceed()
								}}
							>
								{q.c.toString()}
							</button>
						)}
						{q.d?.toString().length && (
							<button
								type="button"
								class={cn(
									"text-balance px-4 py-4 transition-all hover:translate-y-1 hover:shadow-none rounded-md shadow-[0_4px_0_0] outline-none min-h-16 md:min-h-24",
									check(4) ? "translate-y-1 shadow-none ring-4 ring-zinc-300" : "",
									showAnswer.value && answer.value.length
										? q.answer.toString().includes("4") ? "bg-emerald-700 shadow-emerald-800" : "bg-rose-700 shadow-rose-800"
										: "bg-yellow-700 shadow-yellow-800 active:bg-yellow-800",
								)}
								onClick={() => {
									choose(4)
									proceed()
								}}
							>
								{q.d.toString()}
							</button>
						)}
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
								// disable skip button for 500ms after skipping
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
				<div className="flex flex-col gap-4 max-w-screen-xl mx-auto">
					{questions.map((question, i) => (
						<div key={i} class="flex flex-col gap-3 p-6 rounded-lg shadow-md w-full">
							<h2 class="text-xl whitespace-pre-wrap font-semibold leading-tight">
								{question.question}
							</h2>
							{question.image && (
								<img src={question.image} alt="Question Image" class="rounded-md max-w-[min(32rem,100%)] max-h-[32rem] mx-auto" />
							)}
							{question.a && question.b
								? (
									<ul class="flex flex-col gap-2 py-1">
										<li class={`p-2 rounded ${
											question.answer?.toString().includes("1")
												? "bg-emerald-700"
												: answers.value[i].includes(1)
												? "bg-rose-700"
												: "bg-zinc-500"
										}`}>
											{question.a?.toString()}
										</li>
										<li class={`p-2 rounded ${
											question.answer?.toString().includes("2")
												? "bg-emerald-700"
												: answers.value[i].includes(2)
												? "bg-rose-700"
												: "bg-zinc-500"
										}`}>
											{question.b?.toString()}
										</li>
										{question.c && (
											<li class={`p-2 rounded ${
												question.answer?.toString().includes("3")
													? "bg-emerald-700"
													: answers.value[i].includes(3)
													? "bg-rose-700"
													: "bg-zinc-500"
											}`}>
												{question.c?.toString()}
											</li>
										)}
										{question.d && (
											<li class={`p-2 rounded ${
												question.answer?.toString().includes("4")
													? "bg-emerald-700"
													: answers.value[i].includes(4)
													? "bg-rose-700"
													: "bg-zinc-500"
											}`}>
												{question.d?.toString()}
											</li>
										)}
									</ul>
								)
								: <div class="p-2 rounded bg-blue-300">Đáp án: {question.answer?.toString()}</div>}
							<div class="flex flex-col gap-2">
								{question.explanation?.split("\n").map((line, i) => (
									<p key={i} class="text-zinc-600 whitespace-pre-wrap leading-tight">{line}</p>
								))}
							</div>
							<span class="text-sm text-zinc-400">
								#{question.id}
							</span>
						</div>
					))}
				</div>
			)
	)
}
