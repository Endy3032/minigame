import { useSignal } from "@preact/signals"
import katex from "katex"
import { useEffect } from "preact/hooks"

interface Question {
	difficulty: number | null
	question: string
	image: string | null
	a: string | number | null
	b: string | number | null
	c: string | number | null
	d: string | number | null
	answer: string | number
	explanation: string | null
	id: number
}

type QuestionBrowserProps = {
	data: Question[]
}

export default function QuestionBrowser(props: QuestionBrowserProps) {
	const index = useSignal(0)

	useEffect(() => {
		const params = new URLSearchParams(globalThis.location.search)
		const idParam = params.keys().next().value
		const id = idParam ? Number(idParam) : 1
		index.value = Math.max(0, Math.min(id - 1, props.data.length - 1))
	}, [])

	const navigate = (next: number) => {
		const newIndex = Math.max(0, Math.min(index.value + next, props.data.length - 1))
		index.value = newIndex
		history.pushState(null, "", `/browser?${newIndex + 1}`)
	}

	const question: Question = props.data[index.value]

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
		<div class="flex-1 w-full text-lg flex flex-col gap-6 items-center">
			<div class="flex gap-4">
				<button type="button" onClick={() => navigate(-1)} disabled={index.value === 0}
					class="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
				>
					Previous
				</button>
				<button type="button" onClick={() => navigate(1)} disabled={index.value === props.data.length - 1}
					class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
				>
					Next
				</button>
			</div>
			<div key={index.value} class="flex flex-col gap-2 bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
				<h2 class="text-xl whitespace-pre-wrap font-semibold text-gray-800 leading-tight">{renderMathText(question.question)}</h2>
				{question.image && (
					<img src={question.image.startsWith("http") ? question.image : `/questions/${question.image}`} alt="Question Image"
						class="mt-2 rounded-md" />
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
					: <div className="p-2 rounded bg-blue-300">Answer: {renderMathText(question.answer?.toString())}</div>}
				{question.explanation?.split("\n").map((line, i) => (
					<p key={i} class="text-gray-600 whitespace-pre-wrap leading-tight">{renderMathText(line)}</p>
				))}
				<span className="text-sm text-gray-400">
					#{index.value + 1}/{question.id}
				</span>
			</div>
		</div>
	)
}
