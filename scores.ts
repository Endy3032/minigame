import { signal } from "@preact/signals"

export const team1Score = signal(0)
export const team2Score = signal(0)
;(async () => {
	const data = await fetch("http://localhost:8000/api/score")
	const { dbt1, dbt2 } = await data.json()
	team1Score.value = dbt1
	team2Score.value = dbt2
	console.log(`Team 1: ${team1Score.value}, Team 2: ${team2Score.value}`)
})()
