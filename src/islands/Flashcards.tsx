import { useSignal } from "@preact/signals"
import { useRef } from "preact/hooks"
import { cn, Flashcard } from "../utils.ts"

enum Status {
	None,
	Done,
	Review,
}

export function Flashcards(props: { flashcards: Flashcard[] }) {
	const { flashcards } = props
	const status = useSignal<Status[]>(Array(flashcards.length).fill(Status.None))
	const isFlipped = useSignal(false)
	const hideAnswer = useSignal(false)
	const timeout = useRef<number | null>(null)

	const qi = useSignal(0)
	const q = flashcards[qi.value]

	const buttonClass = cn(
		"px-4 py-2 mb-1 transition-all rounded-md bg-zinc-600 shadow-[0_4px_0_0] shadow-zinc-700 ring-zinc-300 outline-none flex-shrink-0",
		"hover:translate-y-1 hover:shadow-[0_0_0_0] disabled:opacity-50 disabled:translate-y-1 disabled:shadow-none focus:brightness-125 focus:ring-1",
	)

	return (
		<div class="relative flex flex-col w-full gap-4">
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
								class="absolute w-full h-full flex flex-col gap-2 items-center p-4 text-center overflow-y-auto bg-rose-700/5 rounded-lg border border-rose-700/20"
								style={{ backfaceVisibility: "hidden", zIndex: isFlipped.value ? 0 : 1 }}
							>
								<span class="w-7 h-7 bg-rose-700/25 border border-rose-600/15 rounded-full aspect-square text-lg">
									Q
								</span>
								<p class="my-auto">
									{q.question}
								</p>
							</div>
							<div
								class="absolute w-full h-full flex flex-col gap-2 items-center p-4 text-center overflow-y-auto bg-emerald-700/5 rounded-lg border border-emerald-700/20"
								style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", opacity: hideAnswer.value ? 0 : 1 }}
							>
								<span class="w-7 h-7 bg-emerald-700/25 border border-emerald-600/15 rounded-full aspect-square text-lg">
									A
								</span>
								<p class="my-auto">{q.answer}</p>
							</div>
						</div>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
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
							</button>
							<button
								type="button"
								class={cn(buttonClass, "md:order-first")}
								disabled={qi.value === 0}
								onClick={() => {
									clearTimeout(timeout.current ?? 0)
									hideAnswer.value = true
									isFlipped.value = false
									qi.value--
									timeout.current = setTimeout(() => hideAnswer.value = false, 700)
								}}
							>
								&larr; Trước
							</button>
							<button
								type="button"
								class={buttonClass}
								disabled={qi.value === flashcards.length - 1}
								onClick={() => {
									clearTimeout(timeout.current ?? 0)
									hideAnswer.value = true
									isFlipped.value = false
									qi.value++
									timeout.current = setTimeout(() => hideAnswer.value = false, 700)
								}}
							>
								Sau &rarr;
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
