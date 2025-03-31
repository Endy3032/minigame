import { Head } from "$fresh/runtime.ts"
import { Handlers, PageProps } from "$fresh/server.ts"
import { dirname, fromFileUrl, join } from "@std/path"
import { Quiz } from "../../islands/Quiz.tsx"
import { fisherYatesShuffle, Question } from "../../utils.ts"

export const handler: Handlers = {
	GET(req, ctx) {
		const { quiz } = ctx.params
		try {
			const questions = JSON.parse(
				Deno.readTextFileSync(fromFileUrl(join(dirname(import.meta.url), `../../static/quizzes/${quiz}/data.json`))),
			)
			return ctx.render({ questions, quiz, url: req.url })
		} catch {
			return ctx.renderNotFound()
		}
	},
}

export default function QuizPage(props: PageProps) {
	const questions = fisherYatesShuffle(props.data.questions as Question[])
	const mc = questions.filter(q => q.type === "Multiple Choice").length
	const tf = questions.filter(q => q.type === "Checkbox").length
	const currentUrl = props.data.url
	const title = `${decodeURIComponent(props.data.quiz) ?? "Quiz"} | Quizizz nhưng nhanh hơn`
	const description = `${mc} câu hỏi trắc nghiệm và ${tf} câu hỏi đúng/sai.`

	return (
		<>
			<Head>
				<title>{title}</title>
				<meta name="description" content={description} />
				<meta property="og:title" content={title} />
				<meta property="og:description" content={description} />
				<meta property="og:site_name" content="Quizizz nhưng nhanh hơn" />
				<meta property="og:url" content={currentUrl} />
				<meta property="og:type" content="website" />
				<link rel="canonical" href={currentUrl} />
			</Head>
			<Quiz questions={questions} name={props.data.quiz ?? "Quiz"} />
		</>
	)
}
