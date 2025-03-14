import QuestionBrowser from "../islands/Browser.tsx"
import data from "../static/questions.json" with { type: "json" }

export default function BrowserPage() {
	return <QuestionBrowser data={data} />
}
