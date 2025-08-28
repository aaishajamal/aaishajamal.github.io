from flask import Flask, jsonify
import requests, random

app = Flask(__name__)

PRONOUNS = ["i", "you", "he", "she", "we", "they"]
SUFFIXES = ["ing", "er", "s", "es"]

@app.route("/daily-tiles")
def daily_tiles():
    # fetch 40 random words from API
    response = requests.get("https://random-word-api.herokuapp.com/word?number=40&lang=en")
    words = response.json()

    # pick 3–5 pronouns
    chosen_pronouns = random.sample(PRONOUNS, random.randint(3, 5))

    # generate 10 suffixes
    chosen_suffixes = random.choices(SUFFIXES, k=10)

    # merge into one list (total 53–55 words/fragments)
    word_list = words + chosen_pronouns + chosen_suffixes
    random.shuffle(word_list)

    return jsonify(word_list)

if __name__ == "__main__":
    app.run(debug=True)
