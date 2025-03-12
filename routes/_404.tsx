import { Head } from "$fresh/runtime.ts"

export default function Error404() {
	return (
		<>
			<Head>
				<title>404 - Lạc rồi sao...</title>
			</Head>
			<div class="flex-1 flex items-center justify-center px-4 py-8 mx-auto">
				<div class="max-w-screen-md mx-auto flex flex-col items-center gap-6">
					<img src="/logo.svg" class="w-full max-w-lg" alt="Logo trường THPT Chuyên Trần Đại Nghĩa" />
					<h1 class="text-5xl font-bold">404</h1>
					<p class="text-lg">
						Bạn đi lạc rồi 👻
					</p>
					<a href="/" class="underline">Về trang chính &rarr;</a>
				</div>
			</div>
		</>
	)
}
