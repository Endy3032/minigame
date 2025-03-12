import { PageProps } from "$fresh/server.ts"

export default function Layout({ Component }: PageProps) {
	return (
		<main class="flex flex-col items-center min-h-screen w-full bg-[#2E3440] text-[#D8DEE9] gap-4 p-4">
			<Component />
		</main>
	)
}
