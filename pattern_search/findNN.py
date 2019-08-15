import os
import argparse
import re
import codecs
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

parser = argparse.ArgumentParser()
parser.add_argument("--all_sents", type=str)
parser.add_argument("--all_sents_vectors", type=str)
parser.add_argument("--input_sent", type=str)
parser.add_argument("--input_sent_vec", type=str)
parser.add_argument("--output", type=str)
parser.add_argument("--k", type=int)
parser.add_argument("--dim", type=int)
args = parser.parse_args()

def file_split(f, delim=' \t\n', bufsize=1024):
    prev = ''
    while True:
        s = f.read(bufsize)
        if not s:
            break
        tokens = re.split('[' + delim + ']{1,}', s)
        if len(tokens) > 1:
            yield prev + tokens[0]
            prev = tokens[-1]
            for x in tokens[1:-1]:
                yield x
        else:
            prev += s
    if prev:
        yield prev

with codecs.open(args.input_sent, "r", encoding='utf-8') as fin:
    given_lines = fin.readlines()

with codecs.open(args.input_sent_vec,"r", encoding='utf-8') as fin:
    given_lines_vectors = fin.readlines()
    vectors = []
    for vec  in given_lines_vectors:
        v = np.asarray(vec.strip().split()).astype(np.float32)
        vectors.append(np.transpose(v.reshape((args.dim,1))))


with codecs.open(args.all_sents, "r", encoding='utf-8') as fin:
    all_lines = fin.readlines()

with codecs.open(args.all_sents_vectors,"r", encoding='utf-8') as fin:
    all_lines_vectors = fin.readlines()
    all_vectors = []
    for vec  in all_lines_vectors:
        v = np.asarray(vec.strip().split()).astype(np.float32)
        all_vectors.append(np.transpose(v.reshape((args.dim,1))))

print("Total lines :{0} Input Lines: {1}".format(len(all_lines), len(given_lines)))
assert len(all_lines) == len(all_vectors)
assert len(given_lines) ==  len(given_lines_vectors)

print("Loaded all vectors.")
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

    cosine_similarities[index] = max_cosine

print("Computed all cosine.")
sorted_cosine_simi = sorted(cosine_similarities.items(), key=lambda kv:kv[1], reverse=True)[:args.k]

with codecs.open(args.output,"w", encoding='utf-8') as fout:
    for (sent_index, cosine_vaule) in sorted_cosine_simi:
        sent = all_lines[sent_index]
        fout.write(sent.strip()  + "\t" + str(cosine_vaule) + "\n")


