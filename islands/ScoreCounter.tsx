import type { Signal } from "@preact/signals"

type Props = {
	count: Signal<number>
	otherCount: Signal<number>
	name: string
	team: string
}

export default function ScoreCounter({ count, otherCount, name, team }: Props) {
	async function increment() {
		count.value++
		await fetch(`/api/counter/${team}@1`, { method: "POST" })
	}

	async function change(event: MouseEvent) {
		event.preventDefault()
		const change = prompt("Change the score by...")
		count.value += parseFloat(change ?? "0")
		await fetch(`/api/counter/${team}@${change}`, { method: "POST" })
	}

	return (
		<button
			type="button"
			class={"flex items-center justify-center rounded-lg px-6 py-3 gap-6"
				+ (count > otherCount ? " bg-[#5e81ac]" : " bg-[#3B4252]")}
			onClick={increment}
			onContextMenu={change}
		>
			<h2 class="font-semibold text-3xl">{name}</h2>
			<code class="text-5xl">{count.value.toFixed(1)}</code>
		</button>
	)
}
