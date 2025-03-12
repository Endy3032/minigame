import { Signal } from "@preact/signals"
import { VNode } from "preact"

const words = [
	"Apple",
	"Banana",
	"Cherry",
	"Date",
	"Elderberry",
	"Fig",
	"Grape",
	"Honeydew",
	"Ice",
	"Jackfruit",
	"Kiwi",
	"Lemon",
	"Mango",
	"Nectarine",
	"Orange",
	"Papaya",
	"Quince",
	"Raspberry",
	"Strawberry",
	"Tomato",
	"Ugli",
	"Vanilla",
	"Watermelon",
	"Xigua",
	"Yam",
	"Zucchini",
	"Almond",
	"Blueberry",
]

const names = [
	"Agent 1",
	"Agent 2",
	"Agent 3",
	"Agent 4",
	"Agent 5",
	"Agent 6",
	"Agent 7",
	"Agent 8",
	"Agent 9",
	"Assassin",
	"Agent 10",
	"Agent 11",
	"Agent 12",
	"Agent 13",
	"Agent 14",
	"Assassin",
	"Agent 15",
	"Agent 16",
	"Agent 17",
	"Agent 18",
	"Agent 19",
	"Agent 20",
	"Agent 21",
	"Agent 22",
	"Agent 23",
	"Agent 24",
	"Assassin",
]

const layout = [5, 6, 5, 6, 5]
const board = words.slice(0, layout.reduce((a, b) => a + b))

export function Codename({ codename }: { codename: Signal<boolean[]> }) {
	const toggleWord = async (index: number) => {
		codename.value = codename.value.map((v, i) => i === index ? !v : v)
		await fetch(`/api/codename/${index}`, { method: "POST" })
	}

	return (
		<div class="p-4 flex-1 max-w-screen-2xl">
			<div class="flex flex-col gap-2">
				{layout.reduce((acc, rowSize, rowIndex) => {
					const rowStartIndex = acc.count
					const row = board.slice(rowStartIndex, rowStartIndex + rowSize)
					acc.count += rowSize
					acc.rows.push(
						<div key={rowIndex} class="flex gap-2 justify-center">
							{row.map((word, colIndex) => {
								const wordIndex = rowStartIndex + colIndex
								return (
									<button type="button" key={wordIndex} onClick={() => toggleWord(wordIndex)}
										class={"border-4 border-[#4c566a] p-4 rounded text-center text-4xl w-full max-w-64 aspect-[1.75] flex items-center justify-center"
											+ (codename.value[wordIndex]
												? names[wordIndex] === "Assassin" ? " bg-red-700" : " bg-[#434c5e]"
												: " bg-transparent")}
									>
										{codename.value[wordIndex] ? names[wordIndex] : word}
									</button>
								)
							})}
						</div>,
					)
					return acc
				}, { rows: [] as VNode[], count: 0 }).rows}
			</div>
		</div>
	)
}
