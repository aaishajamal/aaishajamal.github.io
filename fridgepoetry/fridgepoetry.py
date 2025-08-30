# fridgepoetry.py
from flask import Flask, jsonify, send_from_directory, request
import os, datetime, random, requests

app = Flask(__name__, static_folder='.')

# Simple in-memory cache keyed by YYYY-MM-DD
_cache = {}

# Fallback common words (>= 100 so we can sample)
FALLBACK_WORDS = [
    "time","person","year","way","day","thing","man","world","life","hand","part","child",
    "eye","woman","place","work","week","case","point","government","company","number",
    "group","problem","fact","be","have","do","say","get","make","go","know","take","see",
    "come","think","look","want","give","use","find","tell","ask","work","seem","feel","try",
    "leave","call","good","new","first","last","long","great","little","own","other","old",
    "right","big","high","different","small","large","next","early","young","important",
    "few","public","bad","same","able","to","of","in","for","on","with","at","by","from",
    "up","about","into","over","after","beneath","under","above","between","during","before",
    "around","through","since","without","within","along","across","toward","against"
]

# Parts lists
SUFFIX_CANDIDATES = ["-s","-es","-ing","-ed","-er","-est","-ly","-able","-less"]
PRONOUN_CANDIDATES = ["I","you","he","she","it","we","they","me","them","us","him","her"]
PREPOSITION_CANDIDATES = ["in","on","at","by","with","about","against","between","through","during","before","after","around","without","within"]
CONJUNCTION_CANDIDATES = ["and","or","but","so","for","nor","yet","because","although","if"]

def fetch_words_wordnik(count=50):
    key = os.environ.get("WORDNIK_API_KEY")
    if not key:
        raise RuntimeError("No WORDNIK_API_KEY")
    words = []
    # Wordnik has an endpoint /words.json/randomWords but may require paging; use simple multiple calls fallback
    url = "https://api.wordnik.com/v4/words.json/randomWords"
    params = {"limit": count, "api_key": key, "minCorpusCount": 50000, "maxLength": 12}
    r = requests.get(url, params=params, timeout=6)
    if r.status_code == 200:
        data = r.json()
        for item in data:
            w = item.get("word")
            if w and w.isalpha():
                words.append(w.lower())
    return words

def build_daily_tiles(for_date: str):
    """Return dict with date and tiles list for the given date (YYYY-MM-DD)."""
    # Words: try Wordnik, otherwise fallback
    words = []
    try:
        words = fetch_words_wordnik(50)
    except Exception:
        # fallback to sampling from built-in list, ensure common readable words
        words = random.sample(FALLBACK_WORDS, 50) if len(FALLBACK_WORDS) >= 50 else (FALLBACK_WORDS * 2)[:50]

    # Ensure lower-case unique words; if duplicates, fill from fallback
    words = [w.lower() for w in words]
    if len(set(words)) < 50:
        # fill missing from fallback
        pool = [w for w in FALLBACK_WORDS if w not in words]
        while len(words) < 50:
            if pool:
                words.append(pool.pop(0))
            else:
                words.append("word"+str(len(words)+1))

    # Create tiles
    tiles = []
    # 50 word tiles
    for i, w in enumerate(words, start=1):
        tiles.append({"id": f"word_{i}", "type": "word", "text": w})

    # Parts of speech tiles with allowed repeats (we'll choose randomly with replacement where allowed)
    # 7 suffixes
    for i in range(1, 8):
        tiles.append({"id": f"suffix_{i}", "type": "suffix", "text": random.choice(SUFFIX_CANDIDATES)})
    # 5 pronouns
    for i in range(1, 6):
        tiles.append({"id": f"pronoun_{i}", "type": "pronoun", "text": random.choice(PRONOUN_CANDIDATES)})
    # 7 prepositions
    for i in range(1, 8):
        tiles.append({"id": f"preposition_{i}", "type": "preposition", "text": random.choice(PREPOSITION_CANDIDATES)})
    # 5 conjunctions
    for i in range(1, 6):
        tiles.append({"id": f"conjunction_{i}", "type": "conjunction", "text": random.choice(CONJUNCTION_CANDIDATES)})

    # Shuffle tiles order before returning (keeps Word Bank varied)
    random.shuffle(tiles)
    return {"date": for_date, "tiles": tiles}

@app.route('/api/session')
def api_session():
    today = datetime.date.today().isoformat()  # YYYY-MM-DD
    if today not in _cache:
        _cache[today] = build_daily_tiles(today)
    return jsonify(_cache[today])

# Serve static files (html, js, css) from same directory
@app.route('/')
def index():
    return send_from_directory('.', 'fridgepoetry.html')

@app.route('/<path:filename>')
def static_files(filename):
    allowed = {'fridgepoetry.css','fridgepoetry.js','fridgepoetry.html'}
    if filename in allowed:
        return send_from_directory('.', filename)
    return ('', 404)

if __name__ == '__main__':
    # For Replit you might want host='0.0.0.0', port=int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)), debug=True)
