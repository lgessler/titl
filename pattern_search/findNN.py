import os
import argparse
import re
import codecs
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import KDTree
from flask import Flask, jsonify, request
app = Flask(__name__)


all_vectors = None
all_lines = None

def initialize():
    global all_lines, all_vectors, tree
    print("Initializing lines and vectors...", end=" ")

    with codecs.open(args.all_sents, "r", encoding='utf-8') as fin:
        all_lines = [line.strip().lower() for line in fin.readlines()]

    with codecs.open(args.all_sents_vectors,"r", encoding='utf-8') as fin:
        all_vectors = np.loadtxt(fin)

    assert len(all_lines) == len(all_vectors)
    print("Loaded all lines and vectors.")
    print("Total lines: " + str(len(all_lines)))

    
    print("Building KDTree... ", end="")
    tree = KDTree(all_vectors) #metric=cosine_similarity)
    print(" built.")

@app.route('/', methods=["POST"])
def compute():
    global all_lines, all_vectors, tree
    given_lines = []

    if request.json['sentences']:
        sentences = [sentence['text'] for sentence in request.json['sentences'] if sentence['relevant']]
        given_lines += sentences
    else:
        raise Exception("no input")

    indexes = [all_lines.index(line.strip().lower()) for line in given_lines]
    vectors = np.array([all_vectors[i] for i in indexes])
    assert len(given_lines) ==  len(vectors)

    cosine_similarities = {}
    distances, indexes = tree.query(np.array([np.mean(vectors, axis=0)]), k=args.k, sort_results=True)
    
    sorted_cosine_simi = list(zip(indexes[0], distances[0]))

    sent_dict = {}
    for (sent_index, cosine_value) in sorted_cosine_simi:
        print(sent_index, cosine_value)
        sent = all_lines[sent_index]
        sent_dict[sent] = cosine_value

    return jsonify(sent_dict)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--all_sents", type=str, default='ara_raw.lower.txt')
    parser.add_argument("--all_sents_vectors", type=str, default='ara_sent2vec.lower.vec')
    parser.add_argument("--output", type=str, default=None)
    parser.add_argument("--k", type=int, default=20)
    parser.add_argument("--dim", type=int, default=700)
    args = parser.parse_args()

    initialize()
    app.run()

