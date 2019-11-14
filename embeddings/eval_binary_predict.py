import argparse
import numpy as np
import conllu
from collections import defaultdict
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from tqdm import tqdm
import sklearn


def read_vecs(filepath):
    with open(filepath, 'r') as f:
        lines = [x.strip() for x in f.readlines()]

    count, dim = lines[0].split(" ")
    vecs = [l.split(" ") for l in lines[1:]]
    vecs = {x[0]: np.array([float(y) for y in x[1:]]) for x in vecs}

    return vecs


def classify_by_imperative(sentences):
    def classify_sentence(sentence):
        for token in sentence:
            if token['feats'] is not None:
                feats = token['feats']
                if 'Mood' in feats and feats['Mood'] == "Imp":
                    return True
        return False

    ys = []
    for sentence in sentences:
        ys.append(classify_sentence(sentence))
    return ys


def classify_by_indicative(sentences):
    def classify_sentence(sentence):
        for token in sentence:
            if token['feats'] is not None:
                feats = token['feats']
                if 'Mood' in feats and feats['Mood'] == "Ind":
                    return True
        return False

    ys = []
    for sentence in sentences:
        ys.append(classify_sentence(sentence))
    return ys


def classify_by_particle_verb(sentences):
    def classify_sentence(sentence):
        for token in sentence:
            if token['deprel'] == 'compound:prt':
                return True
        return False

    ys = []
    for sentence in sentences:
        ys.append(classify_sentence(sentence))
    return ys


def classify(sentences, strategy):
    strategies = {
        "imperative": classify_by_imperative,
        "indicative": classify_by_indicative,
        "particle_verb": classify_by_particle_verb
    }
    if strategy in strategies:
        return np.array(strategies[strategy](sentences))
    else:
        raise Exception(f"Unknown strategy: {strategy}")


def vectorize(sentences, word_vecs):
    sentence_vectors = []
    unk_vector = np.mean(list(word_vecs.values()), axis=0)
    for sentence in tqdm(sentences):
        words = [word_vecs[token['form']] if token['form'] in word_vecs else unk_vector for token in sentence]
        avg_word_vec = np.mean(words, axis=0)
        sentence_vectors.append(avg_word_vec)
    return np.array(sentence_vectors)

# https://github.com/PrashantRanjan09/Improved-Word-Embeddings

def eval(args):
    print("loading sentences...", end=" ", flush=True)
    sentences = conllu.parse(open(args.conllu_file, 'r').read())
    print(f"loaded {len(sentences)} sentences from {args.conllu_file}.", flush=True)

    print("classifying sentences...", end=" ", flush=True)
    sentence_classes = classify(sentences, args.classify_by)
    print("done.", flush=True)

    print("reading vectors...", end=" ", flush=True)
    word_vecs = read_vecs(args.vecs)
    print("done.", flush=True)

    print("vectorizing sentences...", end=" ", flush=True)
    sentence_vectors = vectorize(sentences, word_vecs)
    print("done.", flush=True)

    X_train, X_test, y_train, y_test = sklearn.model_selection.train_test_split(sentence_vectors, sentence_classes, test_size=0.2)

    #m = LogisticRegression(solver='lbfgs')
    m = XGBClassifier()
    m.fit(X_train, y_train)
    y_pred = m.predict(X_test)
    print(f"Proportion:       {sum(sentence_classes)}/{len(sentence_classes)} ({sum(sentence_classes)/len(sentence_classes)})")
    print(f"Train proportion: {sum(y_train)}/{len(y_train)} ({1 - sum(y_train)/len(y_train)} lack the construction)")
    print(f"Test proportion:  {sum(y_test)}/{len(y_test)} ({1 - sum(y_test)/len(y_test)} lack the construction)")
    print("Accuracy:   ", sklearn.metrics.accuracy_score(y_test, y_pred))
    print("Recall:     ", sklearn.metrics.recall_score(y_test, y_pred))
    print("F1:         ", sklearn.metrics.f1_score(y_test, y_pred))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "vecs",
        help="A .vecs file, as produced by word2vecf",
    )
    parser.add_argument(
        "conllu_file",
        help="a .conllu file to test on"
    )
    parser.add_argument(
        "--classify-by",
        help="a strategy for how to decide the binary class of a sentence",
        default="imperative"
    )

    args = parser.parse_args()
    eval(args)
