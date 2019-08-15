import os
import argparse
import re
import codecs
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, jsonify, request
app = Flask(__name__)


given_lines = []
all_vectors = None
all_lines = None

def initialize():
    global all_lines, all_vectors

    with codecs.open(args.all_sents, "r", encoding='utf-8') as fin:
        all_lines = fin.readlines()

    with codecs.open(args.all_sents_vectors,"r", encoding='utf-8') as fin:
        all_lines_vectors = fin.readlines()
        all_vectors = []
        for vec in all_lines_vectors:
            v = np.asarray(vec.strip().split()).astype(np.float32)
            all_vectors.append(np.transpose(v.reshape((args.dim,1))))

    print("Total lines :{0} Input Lines: {1}".format(len(all_lines), len(given_lines)))
    assert len(all_lines) == len(all_vectors)

    print("Loaded all vectors.")


@app.route('/', methods=["POST"])
def compute():
    global given_lines, all_lines, all_vectors

    if args.input_sent:
        with codecs.open(args.input_sent, "r", encoding='utf-8') as fin:
            given_lines += fin.readlines()
    elif request.json['sentences']:
        sentences = [sentence['text'] for sentence in request.json['sentences'] if sentence['relevant']]
        given_lines += sentences
    else:
        raise Exception("no input")

    #with codecs.open(args.input_sent_vec,"r", encoding='utf-8') as fin:
    #    given_lines_vectors = fin.readlines()
    #    vectors = []
    #    for vec  in given_lines_vectors:
    #        v = np.asarray(vec.strip().split()).astype(np.float32)
    #        vectors.append(np.transpose(v.reshape((args.dim,1))))

    indexes = [all_lines.index(line) for line in given_lines]
    vectors = [all_vectors[i] for i in indexes]
    assert len(given_lines) ==  len(vectors)

    cosine_similarities = {}
    for index, vec in enumerate(all_vectors):
        sent  = all_lines[index].strip()
        max_cosine = -10.0
        for input_index, input_vec in enumerate(vectors):
            input_sent = given_lines[input_index].strip()
            if input_sent == sent:
                continue

            cosine_dist = cosine_similarity(vec, input_vec)[0][0]
            if cosine_dist > max_cosine:
                max_cosine = cosine_dist

        cosine_similarities[index] = float(max_cosine)

    print("Computed all cosine.")
    sorted_cosine_simi = sorted(cosine_similarities.items(), key=lambda kv:kv[1], reverse=True)[:args.k]

    sent_dict = {}
    for (sent_index, cosine_value) in sorted_cosine_simi:
        sent = all_lines[sent_index]
        sent_dict[sent] = cosine_value

    if args.output:
        with codecs.open(args.output,"w", encoding='utf-8') as fout:
            pass #NYI
    else:
        return jsonify(sent_dict)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--all_sents", type=str, default='ara_raw.lower.txt')
    parser.add_argument("--all_sents_vectors", type=str, default='ara_sent2vec.lower.vec')
    parser.add_argument("--input_sent", type=str, default=None)
    parser.add_argument("--input_sent_vec", type=str)
    parser.add_argument("--output", type=str, default=None)
    parser.add_argument("--k", type=int, default=20)
    parser.add_argument("--dim", type=int, default=700)
    args = parser.parse_args()

    initialize()
    app.run()

