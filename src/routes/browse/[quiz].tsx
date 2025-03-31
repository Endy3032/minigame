import { Handlers, PageProps } from "$fresh/server.ts"
import { cn, Question, readQuizJson } from "../../utils.ts"

export const handler: Handlers = {
	GET(_req, ctx) {
		const { quiz } = ctx.params
		try {
			const questions = readQuizJson<Question[]>(quiz, "data.json")
			return ctx.render({ questions })
		} catch {
			return ctx.renderNotFound()
		}
	},
}

export default function QuizPage(props: PageProps) {
	const questions = props.data.questions as Question[]

	return (
		<div className="flex flex-col gap-4 max-w-screen-lg mx-auto">
			{questions.map((q, i) => (
				<div key={i} class="flex flex-col gap-3 p-4 rounded-lg border border-zinc-700 shadow-md w-full">
					<h2 class="text-xl whitespace-pre-wrap font-semibold leading-snug">
						<span class="float-right ms-2 mb-2 text-sm text-zinc-400">#{q.id}</span>
						<span>{q.question}</span>
					</h2>
					{q.image && <img src={q.image} alt="Question Image" class="rounded-md max-w-[min(32rem,100%)] max-h-[32rem] mx-auto" />}
					<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
						{q.choices?.map((choice, ci) => (
							<li key={ci} class={cn(
								"p-2 rounded",
								q.answer?.includes(ci + 1)
									? "bg-emerald-700"
									: "bg-zinc-700/50",
							)}>
								<span>{choice}</span>
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
}
