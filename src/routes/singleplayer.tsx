import Singleplayer from "../islands/Singleplayer.tsx"
import data from "../static/questions.json" with { type: "json" }
import { pickRandom } from "../utils.ts";

export default function BrowserPage() {
	const questions = pickRandom(data, 10)

	return <Singleplayer questions={questions} />
}
