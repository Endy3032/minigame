import { dirname, fromFileUrl, join } from "@std/path"
export default function Home() {
	const quizzes = [...Deno.readDirSync(fromFileUrl(join(dirname(import.meta.url), "../static/quizzes")))]
		.filter(e => e.isDirectory).map(e => e.name)

	console.log(quizzes)

	return (
		<div class="w-full flex-1 flex flex-col gap-6 items-center px-4 py-8">
			<h1 class="text-3xl font-semibold">CTin2225's Quiz Hub</h1>
			<div class="min-w-[min(100%,30rem)] flex flex-col items-center gap-4">
				{quizzes.map(quiz => (
					<div class="flex flex-col gap-3 w-full text-lg p-3 pb-5 border-2 border-zinc-700 bg-zinc-800 rounded-lg text-center transition-all">
						<span class="text-2xl font-medium">{quiz}</span>
						<div className="grid grid-cols-2 gap-2">
							<a
								class="border-2 rounded-md text-center transition-all p-4 hover:translate-y-1 hover:shadow-none shadow-[0_4px_0_0] border-zinc-400 shadow-zinc-400 active:bg-zinc-700 hover:bg-zinc-700/50"
								href={`/quiz/${quiz}`}
							>
								Làm Quiz
							</a>
							<a
								class="border-2 rounded-md text-center transition-all p-4 hover:translate-y-1 hover:shadow-none shadow-[0_4px_0_0] border-zinc-400 shadow-zinc-400 active:bg-zinc-700 hover:bg-zinc-700/50"
								href={`/browse/${quiz}`}
							>
								Xem trước Quiz
							</a>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
