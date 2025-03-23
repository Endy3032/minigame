import { PageProps } from "$fresh/server.ts"

export default function Layout({ Component }: PageProps) {
	return (
		<main class="flex min-h-svh w-full gap-4 p-4">
			<Component />
		</main>
	)
}
