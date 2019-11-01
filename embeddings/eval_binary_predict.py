import argparse
import numpy as np
import conllu
from collections import defaultdict
from sklearn.linear_model import LogisticRegression
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


def classify(sentences, strategy):
    if strategy == "imperative":
        return classify_by_imperative(sentences)
    else:
        raise Exception(f"Unknown strategy: {strategy}")


def vectorize(sentences, word_vecs):
    sentence_vectors = []
    unk_vector = np.mean(list(word_vecs.values()), axis=0)
    for sentence in tqdm(sentences):
        words = [word_vecs[token['form']] if token['form'] in word_vecs else unk_vector for token in sentence]
        avg_word_vec = np.mean(words, axis=0)
        sentence_vectors.append(avg_word_vec)
    return sentence_vectors

# https://github.com/PrashantRanjan09/Improved-Word-Embeddings

def eval(args):
    print("loading sentences...", end=" ")
    sentences = conllu.parse(open(args.conllu_file, 'r').read())
    print(f"loaded {len(sentences)} sentences from {args.conllu_file}.", flush=True)

    print("classifying sentences...", end=" ")
    sentence_classes = classify(sentences, args.classify_by)
    print("done.", flush=True)

    print("reading vectors...", end=" ")
    word_vecs = read_vecs(args.vecs)
    print("done.", flush=True)

    print("vectorizing sentences...", end=" ")
    sentence_vectors = vectorize(sentences, word_vecs)
    print("done.", flush=True)

    X, X_test, y, y_test = sklearn.model_selection.train_test_split(sentence_vectors, sentence_classes, test_size=0.2)

    m = LogisticRegression()
    m.fit(X, y)
    y_pred = m.predict(X_test)
    print("Accuracy: ", sklearn.metrics.accuracy_score(y_test, y_pred))


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
        "--classify_by",
        help="a strategy for how to decide the binary class of a sentence",
        default="imperative"
    )

    args = parser.parse_args()
    eval(args)
