import os
import re
import pandas as pd

# Question Text	Question Type	Option 1	Option 2	Option 3	Option 4	Option 5	Correct Answer	Time in seconds	Image Link	Answer explanation

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
			columns = filter(lambda x: x in df.columns, ["a", "b", "c", "d", "e"])
			df["choices"] = df[columns].apply(lambda x: [i for i in x if pd.notnull(i)], axis=1)
			df = df.drop(columns=columns, errors="ignore")
			df["answer"] = df["answer"].apply(lambda x: sorted([int(i) for i in re.split(r"[,.;]", str(x))]) if pd.notnull(x) else None)

			output_path = os.path.join(root, "data.json")

			with open(output_path, "w", encoding="utf-8") as f:
				f.write(df.to_json(orient="records", force_ascii=False, indent=2))

			print(f"Successfully converted {xlsx_path} to {output_path}")

		except Exception as e:
			print(f"Error processing {xlsx_path}: {str(e)}")
			continue
