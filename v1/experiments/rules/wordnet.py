from nltk.corpus import wordnet

synonyms = wordnet.synsets("buy")
related_words = set(w.lemma_names()[0] for w in synonyms)

print(related_words)  # {"explosive", "dynamite", "detonator"}