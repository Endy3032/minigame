export type Question = {
	difficulty: number
	question: string
	image: string | null
	a: string | number | null
	b: string | number | null
	c: string | number | null
	d: string | number | null
	answer: string | number
	explanation: string | null
	id: number
}
