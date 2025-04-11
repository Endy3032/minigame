import { Signal, useSignal } from "@preact/signals"
import { useEffect, useRef } from "preact/hooks"
import { Kbd } from "../components/KeyboardButton.tsx"
import { cn, fisherYatesShuffle, Metadata, Question } from "../utils.ts"

const colorMap = [
	"bg-red-700 shadow-red-800 active:bg-red-800",
	"bg-blue-700 shadow-blue-800 active:bg-blue-800",
	"bg-yellow-700 shadow-yellow-800 active:bg-yellow-800",
	"bg-green-700 shadow-green-800 active:bg-green-800",
	"bg-purple-700 shadow-purple-800 active:bg-purple-800",
]

const Config = (
	props: { colorblind: Signal<boolean>; autoSubmit: Signal<boolean>; autoAdvance: Signal<boolean>; autoAdvanceFalse: Signal<boolean> },
) => {
	const { colorblind, autoSubmit, autoAdvance, autoAdvanceFalse } = props

	const btns = [
		{ label: "Mù màu", state: colorblind },
		{ label: "Tự gửi TN", state: autoSubmit },
		{ label: "Tự chuyển câu", state: autoAdvance },
		{ label: "Tự chuyển câu sai", state: autoAdvanceFalse },
	]

	return (
		<div class="flex gap-3 whitespace-nowrap h-full px-px">
			{btns.map(btn => (
				<button
					type="button"
					class={cn(
						"px-3 py-2 mb-[5px] mt-px transition-all rounded-md outline-none focus:brightness-125 focus:ring-1 ring-zinc-300",
						btn.state.value
							? cn(
								"translate-y-1 shadow-none",
								colorblind.value ? "bg-cyan-700 shadow-cyan-800" : "bg-emerald-700 shadow-emerald-800",
							)
							: "bg-rose-700 shadow-rose-800 shadow-[0_4px_0_0]",
					)}
					onClick={() => btn.state.value = !btn.state.value}
				>
					{btn.label} {btn.state.value ? "✓" : "✗"}
				</button>
			))}
		</div>
	)
}

export function Quiz(props: { metadata: Metadata | null; questions: Question[] }) {
	const { metadata, questions } = props
	const remainingQuestions = useSignal<number[]>(Array.from({ length: questions.length }, (_, i) => i))

	const colorblind = useSignal(false)
	const autoSubmit = useSignal(true)
	const autoAdvance = useSignal(true)
	const autoAdvanceFalse = useSignal(false)

	const answer = useSignal<number[]>([])
	const answers = useSignal<number[][]>(Array(questions.length).fill([]))
	const optionCounts = useSignal<number[][]>(questions.map(q => Array(q.choices?.length ?? 0).fill(0)))

	const showAnswer = useSignal(false)
	const timeout = useRef<number>()
	const skipButton = useRef<HTMLButtonElement>(null)
	const shuffledChoices = useSignal<{ text: string | number; index: number }[]>([])

	const qi = remainingQuestions.value[0]
	const q = questions[Math.min(qi, questions.length - 1)]

	const isCorrect = (qi: number, ans: number[]) => {
		const q = questions[qi]
		if (!q.answer) return false
		return ans.sort().join(",") === q.answer.sort().join(",")
	}

	const nextQuestion = () => {
		if (remainingQuestions.value.length === 0) return
		const currentQi = remainingQuestions.value[0]
		const correct = isCorrect(currentQi, answers.value[currentQi])
		const newRemaining = remainingQuestions.value.slice(1)
		if (!correct) {
			if (newRemaining.length >= 10) newRemaining.splice(10, 0, currentQi)
			else newRemaining.push(currentQi)
		}
		remainingQuestions.value = newRemaining
		answer.value = []
		showAnswer.value = false
	}

	const choose = (choice: number) => {
		if (q.type === "Multiple Choice") answer.value = showAnswer.value ? answer.value : [choice]
		else {
			const set = new Set(answer.value)
			if (set.has(choice)) set.delete(choice)
			else set.add(choice)
			answer.value = [...set].sort()
		}
	}

	const check = (choice: number) => answer.value.includes(choice)

	const proceed = (mode: "skip" | "submit" | "choose" = "choose") => {
		clearTimeout(timeout.current)
		const { current } = skipButton

		if (mode === "skip") {
			nextQuestion()
			if (!current) return
			current.disabled = true
			setTimeout(() => current.disabled = false, 1000)
			return
		}

		if ((autoSubmit.value && q.type === "Multiple Choice" && mode === "choose") || mode === "submit") {
			showAnswer.value = true
			if (answer.value.length) {
				answers.value[qi] = answer.value
				for (const selected of answer.value) optionCounts.value[qi][selected - 1]++
				optionCounts.value = [...optionCounts.value]
			}
			answers.value = [...answers.value]

			if (autoAdvance.value && autoAdvanceFalse.value || autoAdvance.value && !autoAdvanceFalse.value && isCorrect(qi, answer.value)) {
				timeout.current = setTimeout(() => {
					nextQuestion()
					if (!current) return
					current.disabled = true
					setTimeout(() => current.disabled = false, 1000)
				}, (q.type === "Checkbox" ? 4000 : 2500) * (q.explanation ? 2 : 1))
			}
		}
	}

	useEffect(() => {
		shuffledChoices.value = fisherYatesShuffle(q?.choices?.map((text, index) => ({ text, index: index + 1 })) ?? [])

		const handler = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") skipButton.current?.click()
			if (e.key === "Enter" && q.type === "Checkbox" && answer.value.length) skipButton.current?.click()
			if (["1", "2", "3", "4", "5"].includes(e.key)) {
				const index = parseInt(e.key) - 1
				if (index < shuffledChoices.value.length) {
					choose(shuffledChoices.value[index].index)
					proceed()
				}
			}
		}
		document.addEventListener("keyup", handler)
		return () => document.removeEventListener("keyup", handler)
	}, [q, remainingQuestions.value])

	return remainingQuestions.value.length
		? (
			<div class="relative flex flex-col w-full gap-4">
				{metadata && (
					<div className="inline-flex overflow-x-auto max-w-full items-center gap-4 whitespace-nowrap">
						<a href="/" class="w-max text-sm text-zinc-400 hover:text-zinc-200 transition-all">&larr; Hub</a>
						<h2 class="w-max text-center font-semibold">{metadata.name}</h2>
						{metadata.hasFlashcard && (
							<a href={`/flashcards/${metadata.name}`} class="w-max text-sm text-zinc-400 hover:text-zinc-200 transition-all">
								Flashcards &rarr;
							</a>
						)}
						<a href={`/browse/${metadata.name}`} class="w-max text-sm text-zinc-400 hover:text-zinc-200 transition-all">
							Xem đáp án &rarr;
						</a>
					</div>
				)}
				<div class="grid grid-cols-[repeat(auto-fit,minmax(5px,1fr))] gap-1">
					{questions.map((_, i) => (
						<div key={i} class={cn(
							"w-full h-1 rounded-full transition-all",
							answers.value[i].length === 0
								? "bg-zinc-500"
								: isCorrect(i, answers.value[i])
								? colorblind.value ? "bg-cyan-500" : "bg-emerald-500"
								: "bg-rose-500",
							i === qi ? "ring-1 ring-zinc-300" : "",
						)} />
					))}
				</div>
				<div class="flex flex-1 gap-4">
					<div class="text-center flex flex-col flex-1 justify-center items-center gap-2 text-2xl md:text-3xl leading-snug whitespace-pre-wrap max-w-screen-xl mx-auto text-balance">
						<div class="rounded-full bg-zinc-800 border border-zinc-600/50 py-1 px-2 text-sm">
							{qi + 1}/{questions.length}
						</div>
						{q.question.split("\n").map((line, i) => <p key={i}>{line}</p>)}
						{q.image && (
							<img src={q.image!} alt="Question Image" class="mt-2 rounded-md max-w-[min(64rem,100%)] max-h-[32rem] mx-auto" />
						)}
					</div>
				</div>
				{q.explanation && (
					<div
						class={cn(
							"fixed w-full px-6 z-10 left-1/2 -translate-x-1/2 bottom-20 flex flex-col gap-1 text-md md:text-lg items-center",
							showAnswer.value ? "opacity-100 visible transition-all" : "translate-y-4 opacity-0 invisible",
						)}
					>
						<div
							class={cn(
								"w-full max-w-screen-sm bg-zinc-800/70 backdrop-blur-xl border border-zinc-600/50 py-2 px-3 rounded-xl",
								showAnswer.value && "animate-flash",
							)}
						>
							{q.explanation.split("\n").map((line, i) => <p key={i} class="text-zinc-30 whitespace-pre-wrap leading-snug">{line}</p>)}
						</div>
					</div>
				)}
				<div class="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(18%,1fr))] gap-x-3 gap-y-4 text-xl md:text-2xl">
					{shuffledChoices.value.map((choice, i) => (
						<button
							type="button"
							class={cn(
								"px-4 py-2 md:py-4 transition-all rounded-md shadow-[0_4px_0_0] outline-none min-h-12 md:min-h-24 lg:min-h-48 ring-zinc-300",
								"relative text-balance break-words focus:brightness-125 focus:ring-1 hover:translate-y-1 hover:shadow-none",
								check(choice.index) ? "translate-y-1 shadow-none ring-4 ring-zinc-300" : "",
								showAnswer.value && answer.value.length
									? questions[remainingQuestions.value[0]].answer?.includes(choice.index)
										? colorblind.value ? "bg-cyan-700 shadow-cyan-800" : "bg-emerald-700 shadow-emerald-800"
										: "bg-rose-700 shadow-rose-800"
									: colorMap[i],
							)}
							onClick={e => {
								choose(choice.index)
								proceed()
								e.currentTarget.blur()
							}}
							onKeyDown={e => {
								if (e.key === "Enter") e.preventDefault()
							}}
						>
							<Kbd class="absolute top-2 left-2">{i + 1}</Kbd>
							{q.type === "Checkbox" && (
								<span class={cn(
									"absolute p-1.5 top-2 right-2 w-5 h-5 text-white flex items-center justify-center text-base rounded transition-all",
									check(choice.index) ? "bg-inherit brightness-125 text-zinc-200" : "bg-zinc-800/50 text-zinc-300/50",
								)}>
									{check(choice.index) ? "✓" : "✗"}
								</span>
							)}
							{choice.text}
						</button>
					))}
				</div>
				<div class="flex gap-3 w-full h-min justify-end bg-zinc-900/60 backdrop-blur-xl rounded-t-xl p-2 sticky bottom-0 md:p-0 md:bg-transparent">
					<div class="inline-flex gap-3 overflow-x-auto whitespace-nowrap max-w-full">
						<Config colorblind={colorblind} autoSubmit={autoSubmit} autoAdvance={autoAdvance} autoAdvanceFalse={autoAdvanceFalse} />
					</div>
					<button
						type="button"
						ref={skipButton}
						class={cn(
							"px-4 py-2 mb-1 rounded-md bg-zinc-600 shadow-[0_4px_0_0] shadow-zinc-700 ring-zinc-300 outline-none flex-shrink-0 flex gap-2 items-center",
							"transition-all hover:translate-y-1 hover:shadow-none disabled:opacity-50 focus:brightness-125 focus:ring-1",
						)}
						onClick={() => {
							proceed(answer.value.length && !showAnswer.value ? "submit" : "skip")
							const { current } = skipButton
							if (!current) return
							if (q.type === "Checkbox" && answer.value.length && showAnswer.value) {
								current.disabled = true
								return setTimeout(() => current.disabled = false, 500)
							}
							if ((!autoAdvance.value || !autoSubmit.value) && showAnswer.value) return
							current.disabled = true
							setTimeout(() => current.disabled = false, 1000)
						}}
					>
						{showAnswer.value ? "Tiếp" : answer.value.length ? "Gửi" : "Bỏ qua"}
						<Kbd class="origin-left h-min mb-0.5">&rarr;</Kbd>
					</button>
				</div>
			</div>
		)
		: (
			<div class="flex flex-col gap-4 max-w-screen-lg mx-auto">
				{questions
					.map((q, i) => (
						<div key={i} class="flex flex-col gap-3 p-4 rounded-lg border border-zinc-700 shadow-md w-full">
							<p class="text-xl whitespace-pre-wrap font-semibold leading-snug">
								<span class="float-right ms-2 mb-2 text-sm text-zinc-400">#{q.id}</span>
								<span>{q.question}</span>
							</p>
							{q.image && <img src={q.image} alt="Question Image" class="rounded-md max-w-[min(32rem,100%)] max-h-[32rem] mx-auto" />}
							<ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
								{q.choices?.map((choice, ci) => (
									<li key={ci} class={cn(
										"p-2 rounded",
										q.answer?.includes(ci + 1)
											? colorblind.value ? "bg-cyan-700" : "bg-emerald-700"
											: optionCounts.value[i][ci]
											? "bg-yellow-700"
											: "bg-zinc-700",
									)}>
										<span>{choice}</span>
										<span class="float-right text-zinc-400 font-medium">x{optionCounts.value[i][ci]}</span>
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
					))
					.sort((a, b) => {
						const aCorrect = optionCounts.value[a.key].reduce((acc, cur) => acc + cur, 0) === questions[a.key].answer?.length
						const bCorrect = optionCounts.value[b.key].reduce((acc, cur) => acc + cur, 0) === questions[b.key].answer?.length
						return aCorrect && !bCorrect ? 1 : !aCorrect && bCorrect ? -1 : 0
					})}
			</div>
		)
}
