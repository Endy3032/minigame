import { useSignal } from "@preact/signals"
import katex from "katex"
import { Question } from "../types.ts"

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

export default function Singleplayer(props: { questions: Question[] }) {
	const currentQuestion = useSignal(0)
	const answers = useSignal(Array<string>(10).fill(""))
	const score = useSignal(0)
	const timer = useSignal(Array<number>(10).fill(0))

	const q = props.questions[currentQuestion.value]
	const i = currentQuestion.value

	const renderMathText = (text: string | null) => {
		if (!text) return null

		const regex = /\$(.*?)\$/g
		const parts = text.split(regex)

		return parts.map((part, i) =>
			// deno-lint-ignore react-no-danger
			i % 2 === 1 ? <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part, { throwOnError: false }) }} /> : part
		)
	}

	return (
		<div class="flex flex-1 flex-col w-full max-w-screen-lg gap-4">
			<div className="flex flex-col gap-1 justify-center items-center bg-gray-100 rounded-xl px-4 py-2 w-max mx-auto shadow-lg">
				<span>Điểm của bạn</span>
				<span class="text-2xl font-bold">{score.value}</span>
			</div>
			<div className="grid grid-cols-5 md:grid-cols-10 gap-2">
				{[...Array(10)].map((_, i) => (
					<div key={i}
						class={`flex-1 border rounded-full h-2 px-4 transition-all ${diffBorderMap[props.questions[i].difficulty - 1]} ${
							answers.value[i].length ? "bg-blue-200" : "bg-gray-200"
						} ${i === currentQuestion.value ? "animate-pulse" : ""}`}
					>
					</div>
				))}
			</div>
			<div key={q.id} class="relative flex flex-col w-full bg-gray-100 rounded-xl overflow-hidden shadow-lg px-4 py-4 pb-8 gap-4">
				<div className="flex gap-3">
					<span>Độ khó {q.difficulty}</span>
					<div className="flex flex-1 gap-1 items-center">
						{[...Array(5)].map((_, i) => (
							<div key={i}
								className={`flex-1 h-2 rounded-full ${q.difficulty && i < q.difficulty ? diffBgMap[i + 1] : "bg-gray-200"}`} />
						))}
					</div>
				</div>
				<div className="flex flex-col gap-1 text-2xl leading-tight whitespace-pre-wrap">
					{q.question.split("\n").map((line, i) => (
						<p key={i}>{i === 0 ? `Câu ${currentQuestion.value + 1}. ` : ""}{renderMathText(line)}</p>
					))}
				</div>
				{q.image && (
					<img src={q.image.startsWith("http") ? q.image : `/questions/${q.image}`} alt="Question Image"
						class="rounded-md max-w-[32rem] max-h-[32rem] mx-auto" />
				)}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-3 text-white text-xl" id="choices">
					{q.a?.toString().length && (
						<button
							type="button"
							class={`px-4 py-4 transition-all hover:translate-y-1 hover:shadow-[0_0_0_0] rounded-md bg-red-500 shadow-[0_4px_0_0] shadow-red-600 ${
								answers.value[i] === "a" ? "animate-pulse" : ""
							}`}
							onClick={() => {
								answers.value[i] = "a"
								answers.value = [...answers.value]
								currentQuestion.value = Math.min(currentQuestion.value + 1, props.questions.length - 1)
							}}
						>
							{renderMathText(q.a.toString())}
						</button>
					)}
					{q.b?.toString().length && (
						<button
							type="button"
							class={`px-4 py-4 transition-all hover:translate-y-1 hover:shadow-[0_0_0_0] rounded-md bg-green-500 shadow-[0_4px_0_0] shadow-green-600 ${
								answers.value[i] === "b" ? "animate-pulse" : ""
							}`}
							onClick={() => {
								answers.value[i] = "b"
								answers.value = [...answers.value]
								currentQuestion.value = Math.min(currentQuestion.value + 1, props.questions.length - 1)
							}}
						>
							{renderMathText(q.b.toString())}
						</button>
					)}
					{q.c?.toString().length && (
						<button
							type="button"
							class={`px-4 py-4 transition-all hover:translate-y-1 hover:shadow-[0_0_0_0] rounded-md bg-blue-500 shadow-[0_4px_0_0] shadow-blue-600 ${
								answers.value[i] === "c" ? "animate-pulse" : ""
							}`}
							onClick={() => {
								answers.value[i] = "c"
								answers.value = [...answers.value]
								currentQuestion.value = Math.min(currentQuestion.value + 1, props.questions.length - 1)
							}}
						>
							{renderMathText(q.c.toString())}
						</button>
					)}
					{q.d?.toString().length && (
						<button
							type="button"
							class={`px-4 py-4 transition-all hover:translate-y-1 hover:shadow-[0_0_0_0] rounded-md bg-yellow-500 shadow-[0_4px_0_0] shadow-yellow-600 ${
								answers.value[i] === "d" ? "animate-pulse" : ""
							}`}
							onClick={() => {
								answers.value[i] = "d"
								answers.value = [...answers.value]
								currentQuestion.value = Math.min(currentQuestion.value + 1, props.questions.length - 1)
							}}
						>
							{renderMathText(q.d.toString())}
						</button>
					)}
					{[q.a, q.b, q.c, q.d].filter(Boolean).length === 0 && (
						// input
						<input
							type="text"
							class="px-4 py-4 col-span-2 transition-all hover:translate-y-1 hover:shadow-[0_0_0_0] rounded-md bg-gray-500 shadow-[0_4px_0_0] shadow-gray-600"
							pattern="[0-9]\.,-"
							onInput={e => {
								answers.value[currentQuestion.value] = (e.target as HTMLInputElement).value
								answers.value = [...answers.value]
							}}
						/>
					)}
				</div>
				<div className="absolute bottom-0 left-0 h-3 w-full bg-blue-400"></div>
			</div>
			<div className="flex gap-2">
				<button type="button" onClick={() => currentQuestion.value = Math.max(currentQuestion.value - 1, 0)}
					class="flex-1 px-4 py-6 bg-blue-400 text-white rounded disabled:opacity-50"
				>
					&larr; Trước
				</button>
				<button type="button" onClick={() => currentQuestion.value = Math.min(currentQuestion.value + 1, props.questions.length - 1)}
					class="flex-1 px-4 py-6 bg-blue-400 text-white rounded disabled:opacity-50"
				>
					Sau &rarr;
				</button>
			</div>
		</div>
	)
}
