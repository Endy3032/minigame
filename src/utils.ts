import { dirname, fromFileUrl, join } from "@std/path"

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

export function readQuizJson<T>(quiz: string, filename: string): T | null {
	quiz = decodeURIComponent(quiz)
	try {
		return JSON.parse(
			Deno.readTextFileSync(fromFileUrl(join(dirname(import.meta.url), `./static/quizzes/${quiz}/${filename}`))),
		)
	} catch (e) {
		console.log(`Failed to read ${filename} for quiz ${quiz}: ${e}`)
		return null
	}
}

export function markify(text: string): string {
	text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
	text = text.replace(/&lt;br\s*\/?&gt;/gi, "<br/>").replace(/`([^`]+)`/g, "<code>$1</code>")
	return text
}

export type Question = {
	id: number
	question: string
	type: "Multiple Choice" | "Checkbox"
	choices: (string | number)[] | null
	answer: (string | number)[] | null
	image: string | null
	explanation: string | null
}

export type Flashcard = {
	id: number
	type: "Open-Ended"
	question: string
	image: string | null
	answer: string
	answerimage: string | null
}

export type Metadata = {
	name: string
	hasQuiz: boolean
	hasFlashcard: boolean
	timestamp: number
	questionCount: {
		total: number
		mc?: number
		tf?: number
		fc?: number
	}
}
