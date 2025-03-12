import { Signal } from "@preact/signals"

export function Back({ phase }: { phase: Signal<number> }) {
	return (
		<button disabled={phase.value === 0} type="button" class="px-4 py-4 h-fit bg-[#3B4252] rounded-lg" onClick={() => phase.value--}>
			&lt;
		</button>
	)
}

export function Forward({ phase }: { phase: Signal<number> }) {
	return (
		<button disabled={phase.value === 3} type="button" class="px-4 py-4 h-fit bg-[#3B4252] rounded-lg" onClick={() => phase.value++}>
			&gt;
		</button>
	)
}

export function PhaseLabel({ phase }: { phase: number }) {
	const phaseNames = {
		0: "Chung Sức",
		1: "Trắc Nghiệm",
		2: "Đúng Sai",
		3: "Tự Luận",
	} as Record<number, string>

	return (
		<div className="flex flex-col items-center gap-2">
			<h1 class="font-bold text-2xl">Minigame tám tháng ba</h1>
			<h2 className="font-semibold text-4xl">{phase + 1}. {phaseNames[phase]}</h2>
		</div>
	)
}
