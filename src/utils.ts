export const randrange = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min) + min)
}

export const pickRandom = <T>(arr: T[], count: number = 10) => {
	const set: Set<T> = new Set()

	while (set.size < count) {
		const randomIndex = randrange(0, arr.length)
		const randomElement = arr[randomIndex]
		set.add(randomElement)
	}

	return [...set.values()]
}

export const cn = (...classes: (string | boolean | undefined)[]) => {
	return classes.filter(Boolean).join(" ")
}

export const fisherYatesShuffle = <T>(arr: T[]) => {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[arr[i], arr[j]] = [arr[j], arr[i]]
	}
	return arr
}

export type Question = {
	id: number
	question: string
	type: "Multiple Choice" | "Checkbox"
	choices: (string | number)[] | null
	answer: (string | number)[] | null
	time: number | null
	image: string | null
	explanation: string | null
}
