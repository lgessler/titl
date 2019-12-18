import argparse
import logging
import sys

import numpy as np
import conllu
from flask import Flask, jsonify, request, g
from embedding_knn import SentenceEmbeddingKnn
app = Flask(__name__)


def read_conllu(filepath):
    logging.info(f"reading conllu file {filepath}")
    with open(filepath, 'r') as f:
        sentences = conllu.parse(f.read())
    sentences = [[word['form'] for word in sentence] for sentence in sentences]
    logging.info(f"loaded {len(sentences)} sentences with {len([w for s in sentences for w in s])} tokens.")
    return sentences


def read_sentences(filepath):
    if filepath.endswith(".conllu"):
        return read_conllu(filepath)
    else:
        raise Exception("NYI")


def read_vectors(filepath):
    logging.info(f"reading vectors from {filepath}")
    with open(filepath, 'r') as f:
        lines = f.read().split("\n")[:-1]
    try:
        row_count, dims = list(map(int, lines[0].split(" ")))
    except ValueError:
        logging.error("First line in vector file must have row count and dimensionality")
        sys.exit(1)

    vs = {}
    for i, line in enumerate(lines[1:]):
        if len(line) < 2:
            logging.warning(f"Line {i + 1} in {filepath} appears to be malformed. Skipping.")
            continue
        line = line.split()
        floats = [float(val) for val in line[1:]]
        if len(floats) != dims:
            logging.error(f"Line {i+1}: malformed vector for '{line[0]}' (line {i+1}): has dims {len(floats)}")
            sys.exit(1)
        vs[line[0]] = np.array(floats)

    logging.info(f"loaded {len(vs) + 1} vectors, d={dims}")
    return vs


def initialize(args):
    global embedder, k
    word_vectors = read_vectors(args.word_vectors)
    sentences = read_sentences(args.corpus_filepath)
    k = args.k
    embedder = SentenceEmbeddingKnn(sentences, word_vectors, k)


@app.route('/', methods=["POST"])
def compute():
    global embedder, k

    logging.info(f"Got a request:\n{request.json}")
    # separate sentences based on whether they have been marked relevant or not
    if request.json['sentences']:
        received_sentences = [sentence['sentence'] for sentence in request.json['sentences']]
        sentences = [sentence['sentence'] for sentence in request.json['sentences'] if sentence['annotations']['relevant']]
        negative_sentences = [sentence['sentence'] for sentence in request.json['sentences'] if not sentence['annotations']['relevant']]
    else:
        raise Exception("no input")

    distances, indexes = embedder.knn(sentences)
    sorted_cosine_simi = list(zip(indexes[0], distances[0]))
    sent_dict = {}
    for (sent_index, cosine_value) in sorted_cosine_simi:
        if len(sent_dict.keys()) == k:
            break
        sent = embedder.get_sentence_by_index(sent_index)
        if sent not in received_sentences:
            logging.info(f"Adding sentence: '{sent}'")
            sent_dict[sent] = cosine_value
        else:
            logging.info(f"Skipping sent: '{sent}'")
    logging.info(f"Responding with {len(sent_dict)} sentences: {sent_dict}")

    return jsonify(sent_dict)


def main():
    logging.basicConfig(level=logging.DEBUG)

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "word_vectors",
        help="newline separated static embeddings. first line must contain `x y` where x is the row count"
             "and `y` is the number of dimensions."
    )
    parser.add_argument(
        "corpus_filepath",
        help="a file whose tokens will be embedded using the vectors. Can be either a "
             ".conllu file or a plaintext file with sentences separated by newlines."
    )
    parser.add_argument(
        "--k",
        type=int,
        default=7,
        help="The k nearest neighbors that we should consider "
    )
    args = parser.parse_args()
    initialize(args)
    app.run()


if __name__ == "__main__":
    sys.setrecursionlimit(10000)
    main()
