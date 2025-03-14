import pandas as pd

FILE = "questions.xlsx"

df = pd.read_excel(FILE)
df = df[df["Rating"] == "Nhận"]
df = df.drop(columns=["Timestamp", "Email Address", "Rating", "Note"])
df.columns = df.columns.str.lower()

with open("./static/questions.json", "w", encoding="utf-8") as f:
    f.write(df.to_json(orient="records", force_ascii=False, indent=2))
