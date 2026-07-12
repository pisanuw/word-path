import json, csv, os, random
from collections import defaultdict, deque

RAW = "/home/claude/wordladder/raw"
OUT = "/home/claude/wordladder/build"
LENS = range(3, 8)
TR_CHARS = set("abcçdefgğhıijklmnoöprsştuüvyzxwq")
EN_CHARS = set("abcdefghijklmnopqrstuvwxyz")
CAP = 3000
random.seed(42)


def tr_lower(s):
    out = []
    for ch in s:
        if ch == 'İ':
            out.append('i')
        elif ch == 'I':
            out.append('ı')
        else:
            out.append(ch.lower())
    return ''.join(out)


def clean_pool(words, charset):
    pool = defaultdict(set)
    for w in words:
        w = w.strip()
        if not w or len(w) not in LENS or ' ' in w:
            continue
        if any(ch not in charset for ch in w):
            continue
        pool[len(w)].add(w)
    return pool


def build_adjacency(words):
    buckets = defaultdict(list)
    for w in words:
        for i in range(len(w)):
            buckets[w[:i] + "_" + w[i + 1:]].append(w)
    adj = defaultdict(set)
    for group in buckets.values():
        if len(group) > 1:
            for a in group:
                adj[a].update(x for x in group if x != a)
    return adj


def giant_component_capped(words, cap):
    words = list(words)
    adj = build_adjacency(words)
    seen = set()
    best_comp = []
    for w in words:
        if w in seen or not adj[w]:
            continue
        comp = [w]
        dq = deque([w])
        local_seen = {w}
        while dq:
            cur = dq.popleft()
            for nb in adj[cur]:
                if nb not in local_seen:
                    local_seen.add(nb)
                    comp.append(nb)
                    dq.append(nb)
        seen.update(local_seen)
        if len(comp) > len(best_comp):
            best_comp = comp
    if not best_comp:
        return []
    if len(best_comp) <= cap:
        return sorted(best_comp)
    # BFS-limited connected subset of size `cap`, starting from a stable seed node
    start = sorted(best_comp)[0]
    dq = deque([start])
    kept = {start}
    order = [start]
    while dq and len(kept) < cap:
        cur = dq.popleft()
        for nb in sorted(adj[cur]):
            if nb not in kept:
                kept.add(nb)
                order.append(nb)
                dq.append(nb)
                if len(kept) >= cap:
                    break
    return sorted(kept)


def save(name, pool):
    d = f"{OUT}/{name}"
    os.makedirs(d, exist_ok=True)
    stats = {}
    for L in LENS:
        words = giant_component_capped(pool.get(L, set()), CAP)
        with open(f"{d}/{L}.json", "w", encoding="utf-8") as f:
            json.dump(words, f, ensure_ascii=False, separators=(",", ":"))
        stats[L] = len(words)
    print(name, stats)


# ---- English words: merge common + full dwyl, minus profanity ----
with open(f"{RAW}/profanity.txt", encoding="utf-8") as f:
    profanity = set(w.strip().lower() for w in f if w.strip())
with open(f"{RAW}/en_common.txt", encoding="utf-8") as f:
    common = [w.strip().lower() for w in f if w.strip()]
with open(f"{RAW}/en_words.txt", encoding="utf-8") as f:
    dwyl = [w.strip().lower() for w in f if w.strip()]
en_pool_words = [w for w in (common + dwyl) if w not in profanity]
en_pool = clean_pool(en_pool_words, EN_CHARS)
save("en_words", en_pool)

# ---- Turkish words: merge both sources ----
def load_tr_list(path):
    out = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and ' ' not in line:
                out.append(tr_lower(line))
    return out

tr_pool_words = load_tr_list(f"{RAW}/tr_words_1.txt") + load_tr_list(f"{RAW}/tr_words_2.txt")
tr_pool = clean_pool(tr_pool_words, TR_CHARS)
save("tr_words", tr_pool)

# ---- English proper names ----
with open(f"{RAW}/en_names_1.txt", encoding="utf-8") as f:
    en_names_words = [w.strip().lower() for w in f if w.strip()]
en_names_pool = clean_pool(en_names_words, EN_CHARS)
save("en_names", en_names_pool)

# ---- Turkish proper names ----
tr_names_words = []
with open(f"{RAW}/tr_names.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        nm = row.get("name", "").strip()
        if nm:
            tr_names_words.append(tr_lower(nm))
tr_names_pool = clean_pool(tr_names_words, TR_CHARS)
save("tr_names", tr_names_pool)

print("DONE")
