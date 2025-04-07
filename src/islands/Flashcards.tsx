import { useSignal } from "@preact/signals"
import { useEffect, useRef } from "preact/hooks"
import { Kbd } from "../components/KeyboardButton.tsx"
import { cn, Flashcard, Metadata } from "../utils.ts"

enum Status {
	None,
	Done,
	Review,
}

export function Flashcards(props: { metadata: Metadata | null; flashcards: Flashcard[] }) {
	const { metadata, flashcards } = props
	const status = useSignal<Status[]>(Array(flashcards.length).fill(Status.None))
	const isFlipped = useSignal(false)

	const qi = useSignal(0)
	const q = flashcards[qi.value]

	const buttonClass = cn(
		"flex gap-2 items-center px-4 py-2 mb-1 transition-all rounded-md bg-zinc-600 shadow-[0_4px_0_0] shadow-zinc-700 ring-zinc-300 outline-none flex-shrink-0",
		"hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:translate-y-1 disabled:shadow-none focus:brightness-125 focus:ring-1",
	)

	useEffect(() => {
		isFlipped.value = false

		const handler = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowRight":
					isFlipped.value = false
					qi.value = Math.min(qi.value + 1, flashcards.length - 1)
					break
				case "ArrowLeft":
					isFlipped.value = false
					qi.value = Math.max(qi.value - 1, 0)
					break
				case " ":
					isFlipped.value = !isFlipped.value
					break
				case "Enter":
					status.value[qi.value] = status.value[qi.value] === Status.Done ? Status.None : Status.Done
					break
				case "m":
					status.value[qi.value] = status.value[qi.value] === Status.Review ? Status.None : Status.Review
					break
			}
			status.value = [...status.value]
		}
		document.addEventListener("keyup", handler)
		return () => document.removeEventListener("keyup", handler)
	}, [qi.value])

	return (
		<div class="relative flex flex-col w-full gap-4">
			{metadata && (
				<div className="flex items-center gap-4">
					<h2 class="text-center font-semibold text-balance">{metadata.name}</h2>
					<div class="inline-flex h-full items-center gap-4 overflow-x-auto whitespace-nowrap max-w-full">
						<a href="/" class="text-sm text-zinc-400 hover:text-zinc-200 transition-all">&larr; Hub</a>
						<a href={`/quiz/${metadata.name}`} class="text-sm text-zinc-400 hover:text-zinc-200 transition-all">
							Làm quiz &rarr;
						</a>
					</div>
				</div>
			)}
			<div class="grid grid-cols-[repeat(auto-fit,minmax(5px,1fr))] gap-1">
				{flashcards.map((_, i) => (
					<div key={i} class={cn(
						"w-full h-1 rounded-full transition-all",
						status.value[i] === Status.None
							? "bg-zinc-500"
							: status.value[i] === Status.Done
							? "bg-emerald-500"
							: "bg-amber-500",
						i === qi.value ? "ring-1 ring-zinc-300" : "",
					)} />
				))}
			</div>
			<div class="flex flex-1 gap-4">
				<div class={cn(
					"flex flex-col flex-1 justify-center items-center gap-2 max-w-screen-xl mx-auto",
					"text-center leading-snug whitespace-pre-wrap text-balance",
				)}>
					<div class="rounded-full bg-zinc-800 border border-zinc-600/50 py-1 px-2 text-sm">
						{qi.value + 1}/{flashcards.length}
					</div>
					<div class="w-full h-full max-w-screen-lg max-h-[40rem] flex flex-col items-center gap-4">
						<div
							class={cn(
								"relative w-full h-full rounded-lg bg-zinc-800 text-2xl md:text-3xl",
								"cursor-pointer transition-transform duration-700 ease-[cubic-bezier(.4,.6,.1,1)]",
							)}
							onClick={() => isFlipped.value = !isFlipped.value}
							style={{ transformStyle: "preserve-3d", transform: `rotateY(${isFlipped.value ? 180 : 0}deg)` }}
						>
							<div
								class="absolute w-full h-full flex flex-col gap-2 items-center p-4 text-center overflow-y-auto bg-rose-700/5 rounded-lg border border-rose-700/20 group"
								style={{ backfaceVisibility: "hidden", zIndex: isFlipped.value ? 0 : 1 }}
							>
								<Kbd class="fixed bottom-3 left-2 origin-bottom-left scale-150">␣</Kbd>
								<span class="w-7 h-7 bg-rose-700/25 border border-rose-600/15 rounded-full aspect-square text-lg">
									Q
								</span>
								{q.image && (
									<img src={q.image} alt="Question Image" class="mt-2 rounded-md max-w-[min(64rem,100%)] max-h-[32rem] mx-auto" />
								)}
								<p class="my-auto">
									{q.question}
								</p>
							</div>
							<div
								class="absolute w-full h-full flex flex-col gap-2 items-center p-4 text-center overflow-y-auto bg-emerald-700/5 rounded-lg border border-emerald-700/20 group"
								style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", opacity: isFlipped.value ? 1 : 0 }}
							>
								<Kbd class="fixed bottom-3 left-2 origin-bottom-left scale-150">␣</Kbd>
								<span class="w-7 h-7 bg-emerald-700/25 border border-emerald-600/15 rounded-full aspect-square text-lg">
									A
								</span>
								{q.answerimage && (
									<img src={q.answerimage} alt="Answer Image" class="mt-2 rounded-md max-w-[min(64rem,100%)] max-h-[32rem] mx-auto" />
								)}
								<p class="my-auto">{q.answer}</p>
							</div>
						</div>
						<div class="flex flex-col md:flex-row flex-wrap items-center gap-2">
							<div className="flex gap-2 md:contents">
								<button
									type="button"
									class={buttonClass}
									disabled={status.value[qi.value] === Status.Done}
									onClick={() => {
										status.value[qi.value] = Status.Done
										status.value = [...status.value]
									}}
								>
									Đã học
									<Kbd class="h-min">Enter</Kbd>
								</button>
								<button
									type="button"
									class={buttonClass}
									disabled={status.value[qi.value] === Status.Review}
									onClick={() => {
										status.value[qi.value] = Status.Review
										status.value = [...status.value]
									}}
								>
									Review
									<Kbd class="h-min">M</Kbd>
								</button>
							</div>
							<div className="flex gap-2 md:contents">
								<button
									type="button"
									class={cn(buttonClass, "md:order-first")}
									onClick={() => qi.value = qi.value === 0 ? flashcards.length - 1 : qi.value - 1}
								>
									<Kbd class="h-min">&larr;</Kbd>
									<span class="hidden showTouchscreen">&larr;</span>
									Trước
								</button>
								<button
									type="button"
									class={buttonClass}
									onClick={() => qi.value = qi.value === flashcards.length - 1 ? 0 : qi.value + 1}
								>
									Sau
									<span class="hidden showTouchscreen">&rarr;</span>
									<Kbd class="h-min">&rarr;</Kbd>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
