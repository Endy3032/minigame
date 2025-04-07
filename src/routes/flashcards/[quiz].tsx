import { Head } from "$fresh/runtime.ts"
import { Handlers, PageProps } from "$fresh/server.ts"
import { Flashcards } from "../../islands/Flashcards.tsx"
import { fisherYatesShuffle, Flashcard, Metadata, readQuizJson } from "../../utils.ts"

export const handler: Handlers = {
	GET(req, ctx) {
		const { quiz } = ctx.params
		try {
			const flashcards = readQuizJson<Flashcard[]>(quiz, "flashcards.json")
			const metadata = readQuizJson<Metadata>(quiz, "metadata.json")
			return ctx.render({ flashcards, quiz, metadata, url: req.url })
		} catch (e) {
			console.error(e)
			return ctx.renderNotFound()
		}
	},
}

export default function QuizPage(props: PageProps) {
	const flashcards = fisherYatesShuffle(props.data.flashcards as Flashcard[] | null || [])
	const metadata = props.data.metadata as Metadata | null

	const title = `${decodeURIComponent(metadata?.name ?? props.data.quiz ?? "Flashcards")} | CTin2225 Quiz`
	const description = `${flashcards.length} flashcards`
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
			<Flashcards metadata={metadata} flashcards={flashcards} />
		</>
	)
}
