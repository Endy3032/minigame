import { PageProps } from "$fresh/server.ts"

export default function Layout({ Component }: PageProps) {
	return (
		<main class="flex min-h-screen w-full bg-zinc-900 text-zinc-100 gap-4 p-4">
			<Component />
		</main>
	)
}
