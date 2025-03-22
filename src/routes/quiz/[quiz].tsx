import { Handlers, PageProps } from "$fresh/server.ts"
import { dirname, fromFileUrl, join } from "@std/path"
import { Quiz } from "../../islands/Quiz.tsx"
import { fisherYatesShuffle, Question } from "../../utils.ts"

export const handler: Handlers = {
	GET(_req, ctx) {
		const { quiz } = ctx.params
		try {
			const questions = JSON.parse(
				Deno.readTextFileSync(fromFileUrl(join(dirname(import.meta.url), `../../static/quizzes/${quiz}/data.json`))),
			)
			return ctx.render({ questions })
		} catch {
			return ctx.renderNotFound()
		}
	},
}

export default function QuizPage(props: PageProps) {
	const questions = fisherYatesShuffle(props.data.questions as Question[])

	return <Quiz questions={questions} />
}
