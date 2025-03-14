import pandas as pd

# Timestamp	Email Address	Rating	Difficulty	Question	Image	A	B	C	D	Answer	Explanation	Note
FILE = "questions.xlsx"

df = pd.read_excel(FILE)
df["id"] = df.index + 1
df = df[df["Rating"] == "Nhận"]
df = df.drop(columns=["Timestamp", "Email Address", "Rating", "Note"])
df.columns = df.columns.str.lower()

with open("./src/static/questions.json", "w", encoding="utf-8") as f:
    f.write(df.to_json(orient="records", force_ascii=False, indent=2))
