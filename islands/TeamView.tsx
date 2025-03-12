import { team1Score, team2Score } from "../scores.ts"
import { PhaseLabel } from "./Phase.tsx"
import ScoreCounter from "./ScoreCounter.tsx"

export function TeamView(props: { curRoute: number }) {
	return (
		<>
			<ScoreCounter count={team1Score} otherCount={team2Score} team="1" name="Như X Thảo" />
			<PhaseLabel phase={props.curRoute} />
			<ScoreCounter count={team2Score} otherCount={team1Score} team="2" name="Mai X Uyên" />
		</>
	)
}
