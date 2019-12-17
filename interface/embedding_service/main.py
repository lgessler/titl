import argparse
import logging
from flask import Flask, jsonify, request, g
import conllu
from embedding_knn import SentenceEmbeddingKnn
app = Flask(__name__)


def read_conllu(filepath):
    with open(filepath, 'r') as f:
        sentences = conllu.parse(f.read())
    return [[word['form'] for word in sentence] for sentence in sentences]


def read_sentences(filepath):
    if filepath.endswith(".conllu"):
        return read_conllu(filepath)
    else:
        raise Exception("NYI")


def initialize(args):
    global g
    g['sentences'] = read_sentences(args.corpus_filepath)
    g['embedder'] = SentenceEmbeddingKnn(g['sentences'], args.np_word_vecs)
    g['k'] = args.k


@app.route('/', methods=["POST"])
def compute():
    global g
    embedder = g['embedder']

    logging.info(f"Got a request:\n{request.json}")
    # separate sentences based on whether they have been marked relevant or not
    if request.json['sentences']:
        sentences = [sentence['sentence'] for sentence in request.json['sentences'] if sentence['annotations']['relevant']]
        negative_sentences = [sentence['sentence'] for sentence in request.json['sentences'] if not sentence['annotations']['relevant']]
    else:
        raise Exception("no input")

    distances, indexes = embedder.query(sentences, g['k'])
    
    sorted_cosine_simi = list(zip(indexes[0], distances[0]))

    sent_dict = {}
    for (sent_index, cosine_value) in sorted_cosine_simi:
        if len(sent_dict.keys()) == g['k']
            break
        sent = all_lines[sent_index]
        print(sent)
        print(cosine_value)
        if sent not in negative_sentences:
            sent_dict[sent] = cosine_value

    return jsonify(sent_dict)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "np_word_vecs",
        description="word vectors that can be loaded using `np.loadtxt`."
    )
    parser.add_argument(
        "corpus_filepath",
        description=("a file whose tokens will be embedded using the vectors. Can be either a "
                     ".conllu file or a plaintext file with sentences separated by newlines.")
    )
    parser.add_argument(
        "--k",
        type=int,
        default=7,
        description="The k nearest neighbors that we should consider "
    )
    args = parser.parse_args()
    initialize(args)
    app.run()


if __name__ == "__main__":
    main()
