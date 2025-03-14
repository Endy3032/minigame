import { PageProps } from "$fresh/server.ts"

export default function Layout({ Component }: PageProps) {
	return (
		<main class="flex flex-col items-center min-h-screen w-full bg-gray-300/50 text-gray-950 gap-4 p-4">
			<div class="bg-[url('/bg.png')] opacity-20 blur-sm h-full w-full left-0 top-0 fixed -z-10 bg-cover" />
			<Component />
		</main>
	)
}
