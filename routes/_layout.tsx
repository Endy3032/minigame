import { PageProps } from "$fresh/server.ts"

export default function Layout({ Component }: PageProps) {
	return (
		<main class="flex flex-col items-center min-h-screen w-full bg-gray-50 text-gray-950 gap-4 p-4">
			<Component />
		</main>
	)
}
