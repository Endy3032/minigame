import os
import re
import pandas as pd

keymap = {
	"Question Text": "question",
	"Question Type": "type",
	"Option 1": "a",
	"Option 2": "b",
	"Option 3": "c",
	"Option 4": "d",
	"Option 5": "e",
	"Correct Answer": "answer",
	"Time in seconds": "time",
	"Image Link": "image",
	"Answer explanation": "explanation",
}

base_dir = os.path.dirname(os.path.abspath(__file__))

for root, dirs, files in os.walk(base_dir):
	rel_path = re.split(r'[\\\\/]', root)[-1]

	for file in files:
		if not file.endswith('.xlsx'):
			continue

		xlsx_path = os.path.join(root, file)

		try:
			df = pd.read_excel(xlsx_path)
			df = df.rename(columns=keymap)

			df["id"] = df.index + 1
			df["image"] = df["image"].apply(lambda x: f"/quizzes/{rel_path}/{x}" if pd.notnull(x) else None)

			columns = list(filter(lambda x: x in df.columns, ["a", "b", "c", "d", "e"]))
			df["choices"] = df[columns].apply(lambda x: [i for i in x if pd.notnull(i)], axis=1)
			df = df.drop(columns=["time", *columns])

			metadata = {
				"name": rel_path,
				"type": "quiz",
				"timestamp": int(pd.Timestamp.now().timestamp()),
				"questionCount": {
					"total": len(df),
				}
			}

			if "Multiple Choice" in df["type"].values:
				metadata["questionCount"]["mc"] = len(df[df["type"] == "Multiple Choice"])

			if "Checkbox" in df["type"].values:
				metadata["questionCount"]["tf"] = len(df[df["type"] == "Checkbox"])

			if "Fill-in-the-Blank" in df["type"].values:
				metadata["questionCount"]["wt"] = len(df[df["type"] == "Fill-in-the-Blank"])

			if "Open-Ended" in df["type"].values:
				fcdf = df[df["type"] == "Open-Ended"].copy()
				df = df[df["type"] != "Open-Ended"]
				metadata["questionCount"]["fc"] = len(fcdf)
				fcdf["answer"] = fcdf["choices"].apply(lambda x: x[0])
				fcdf["answerimage"] = fcdf["choices"].apply(lambda x: x[1] if len(x) > 1 else None)
				fcdf = fcdf.drop(columns=["choices", "explanation"])

				flashcards_path = os.path.join(root, "flashcards.json")
				with open(flashcards_path, "w", encoding="utf-8") as f:
					f.write(fcdf.to_json(orient="records", force_ascii=False, indent=2))

			df["answer"] = df["answer"].apply(
				lambda x: sorted(filter(lambda x: x != 0, [int(i) for i in re.split(r"[,.;]", str(x))])) if pd.notnull(x) else None
			)
			df = df.dropna(subset=["answer"])

			output_path = os.path.join(root, "data.json")
			with open(output_path, "w", encoding="utf-8") as f:
				f.write(df.to_json(orient="records", force_ascii=False, indent=2))

			metadata_path = os.path.join(root, "metadata.json")
			with open(metadata_path, "w", encoding="utf-8") as f:
				f.write(pd.Series(metadata).to_json(indent=2, force_ascii=False))

			print(f"Successfully converted {file}")

		except Exception as e:
			print(f"Error processing {xlsx_path}: {str(e)}")
			continue
