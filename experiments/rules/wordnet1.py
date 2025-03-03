from nltk.corpus import wordnet

def get_relevant_synonyms(word, pos_tag="n"):
    synonyms = set()
    for syn in wordnet.synsets(word, pos=pos_tag):  # Only use nouns (n) or verbs (v)
        for lemma in syn.lemmas():
            synonyms.add(lemma.name())  # Extract synonym words
    return synonyms

print(get_relevant_synonyms("bomb", pos_tag="n"))  # Only get noun synonyms