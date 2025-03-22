import { dirname, fromFileUrl, join } from "@std/path"
export default function Home() {
	const quizzes = [...Deno.readDirSync(fromFileUrl(join(dirname(import.meta.url), "../static/quizzes")))]
		.filter(e => e.isDirectory).map(e => e.name)

	console.log(quizzes)

	return (
		<div class="w-full flex-1 flex flex-col gap-6 items-center px-4 py-8">
			<h1 class="text-2xl">CTin2225's Quiz Hub</h1>
			<div class="min-w-[min(100%,30rem)] flex flex-col items-center gap-4">
				{quizzes.map(quiz => (
					<a
						href={`/quiz/${quiz}`}
						class="w-full text-lg p-4 border-2 rounded-lg text-center transition-all px-4 py-4 hover:translate-y-1 hover:shadow-none shadow-[0_4px_0_0] border-zinc-400 shadow-zinc-400 active:bg-zinc-800"
					>
						{quiz}
					</a>
				))}
			</div>
		</div>
	)
}
