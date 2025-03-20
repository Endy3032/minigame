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
