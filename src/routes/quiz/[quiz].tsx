import { Head } from "$fresh/runtime.ts"
import { Handlers, PageProps } from "$fresh/server.ts"
import { Quiz } from "../../islands/Quiz.tsx"
import { fisherYatesShuffle, Metadata, Question, readQuizJson } from "../../utils.ts"

export const handler: Handlers = {
	GET(req, ctx) {
		const { quiz } = ctx.params
		try {
			const questions = readQuizJson<Question[]>(quiz, "data.json")
			const metadata = readQuizJson<Metadata>(quiz, "metadata.json")
			return ctx.render({ questions, quiz, metadata, url: req.url })
		} catch (e) {
			console.error(e)
			return ctx.renderNotFound()
		}
	},
}

export default function QuizPage(props: PageProps) {
	const questions = fisherYatesShuffle(props.data.questions as Question[] | null || [])
	const metadata = props.data.metadata as Metadata | null

	const mc = metadata?.questionCount.mc ?? questions.filter(q => q.type === "Multiple Choice").length
	const tf = metadata?.questionCount.tf ?? questions.filter(q => q.type === "Checkbox").length
	const total = mc + tf

	const title = `${decodeURIComponent(metadata?.name ?? props.data.quiz ?? "Quiz")} | CTin2225 Quiz`
	const description = total
		? `${total} câu: ${[mc ? `${mc}x trắc nghiệm` : "", tf ? `${tf}x đúng sai` : ""].filter(Boolean).join(" và ")}`
		: null
	const currentUrl = props.data.url

	return (
		<>
			<Head>
				<title>{title}</title>
				{description && (
					<>
						<meta name="description" content={description} />
						<meta property="og:description" content={description} />
					</>
				)}
				<meta property="og:title" content={title} />
				<meta property="og:type" content="website" />
				<meta property="og:url" content={currentUrl} />
				<meta property="og:site_name" content="CTin2225 Quiz - Quizizz nhưng nhanh hơn :)" />
				<link rel="canonical" href={currentUrl} />
			</Head>
			<Quiz metadata={metadata} questions={questions} />
		</>
	)
}
