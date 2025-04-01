import { dirname, fromFileUrl, join } from "@std/path"
import { cn, Metadata, readQuizJson } from "../utils.ts"

export default function Home() {
	const quizzes = [...Deno.readDirSync(fromFileUrl(join(dirname(import.meta.url), "../static/quizzes")))]
		.filter(e => e.isDirectory).map(e => e.name)

	const metadatas = quizzes
		.map(quiz => readQuizJson<Metadata>(quiz, "metadata.json"))
		.filter(e => e !== null)
		.toSorted((a, b) => b.timestamp - a.timestamp)

	const buttonClass = cn(
		"flex-1 border-2 rounded-md text-center transition-all p-4",
		"shadow-[0_4px_0_0] hover:translate-y-1 hover:shadow-none border-zinc-400 shadow-zinc-400 active:bg-zinc-700 hover:bg-zinc-700/50",
	)

	return (
		<div class="w-full flex-1 flex flex-col gap-6 items-center px-4 py-8">
			<h1 class="text-3xl font-semibold">CTin2225's Quiz Hub</h1>
			<div class="w-full max-w-2xl flex flex-col items-center gap-4">
				{metadatas.map(m => (
					<div class="flex flex-col gap-3 w-full text-lg p-3 pb-5 border-2 border-zinc-700 bg-zinc-800 rounded-lg text-center transition-all">
						<span class="text-2xl font-medium">{m.name}</span>
						<span class="text-lg text-zinc-400">
							{m.questionCount.total} câu | {[
								m.questionCount.mc && `${m.questionCount.mc} TN`,
								m.questionCount.tf && `${m.questionCount.tf} ĐS`,
								m.questionCount.fc && `${m.questionCount.fc} TL`,
							].filter(Boolean).join(" - ")}
						</span>
						<div class="flex flex-col md:flex-row gap-x-2 gap-y-3">
							{m.hasQuiz && (
								<>
									<a class={buttonClass} href={`/quiz/${m.name}`}>Làm Quiz</a>
									<a class={buttonClass} href={`/browse/${m.name}`}>Xem đáp án</a>
								</>
							)}
							{m.hasFlashcard && <a class={buttonClass} href={`/flashcards/${m.name}`}>Flashcard tự luận</a>}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
