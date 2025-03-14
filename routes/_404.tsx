import { Head } from "$fresh/runtime.ts"

export default function Error404() {
	return (
		<>
			<Head>
				<title>404 - Lạc rồi sao...</title>
			</Head>
			<div class="flex-1 flex flex-col gap-6 items-center justify-center px-4 py-8">
				<img src="/logo.svg" class="w-full max-w-lg" alt="Logo trường THPT Chuyên Trần Đại Nghĩa" />
				<h1 class="text-5xl font-bold">404</h1>
				<span class="text-lg">Bạn đi lạc rồi 👻</span>
				<a href="/" class="underline">Về trang chính &rarr;</a>
			</div>
		</>
	)
}
