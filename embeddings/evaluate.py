import argparse
from scipy.spatial.distance import cosine as cosine_distance
from scipy.stats import spearmanr
import numpy as np


def cosine_similarity(u, v):
    return 1 - cosine_distance(u, v)


def read_simlex_999():
    with open('eval_datasets/SimLex-999/SimLex-999.txt', 'r') as f:
        lines = [x.strip().split("\t") for x in f.readlines()][1:]

    # every line is a word-pair followed by various metrics on the pair
    return {(l[0], l[1]): {"POS": l[2],
                           "SimLex999": l[3],
                           "conc(w1)": l[4],
                           "conc(w2)": l[5],
                           "concQ": l[6],
                           "Assoc(USF)": l[7],
                           "SimAssoc333": l[8],
                           "SD(SimLex)": l[9]} for l in lines}


def eval_simlex_999(vecs):
    simlex_scores = read_simlex_999()
    # just take the SimLex999 score
    simlex_scores = {k: v["SimLex999"] for k, v in simlex_scores.items()}

    similarities = {(w1, w2): cosine_similarity(vecs[w1], vecs[w2])
                    for (w1, w2) in simlex_scores.keys()
                    if w1 in vecs and w2 in vecs}
    print(f"Able to evaluate {len(similarities)} out of {len(simlex_scores)}"
          f" ({len(similarities)/len(simlex_scores) * 100}%) of SimLex-999 pairs")

    simlex_scores = {(w1, w2): v
                     for ((w1, w2), v) in simlex_scores.items()
                     if w1 in vecs and w2 in vecs}

    pred_sorted_pairs = [x[0] for x in sorted(list(similarities.items()), key=lambda x: float(x[1]), reverse=True)]
    gold_sorted_pairs = [x[0] for x in sorted(list(simlex_scores.items()), key=lambda x: float(x[1]), reverse=True)]
    pair_indexes = {k: i for i, k in enumerate(gold_sorted_pairs)}

    pred_rank = [pair_indexes[k] for k in pred_sorted_pairs]
    gold_rank = [pair_indexes[k] for k in gold_sorted_pairs]

    rho, p = spearmanr(pred_rank, gold_rank)
    print("SimLex-999 scores:")
    print(f"  Spearman's rho = {rho}")
    print(f"               p = {p}")


def read_vecs(filepath):
    with open(filepath, 'r') as f:
        lines = [x.strip() for x in f.readlines()]

    count, dim = lines[0].split(" ")
    vecs = [l.split(" ") for l in lines[1:]]
    vecs = {x[0].lower(): np.array([float(y) for y in x[1:]])
            for x in vecs}
    print(f"{filepath}: loaded {count} vectors with dim {dim}")
    return vecs

def eval(vecs, benchmark):
    vecs = read_vecs(vecs)

    benchmarks = {"SimLex-999": eval_simlex_999}
    if benchmark not in benchmarks:
        raise Exception(f"Unknown benchmark: {benchmark}")

    benchmarks[benchmark](vecs)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process some integers.")
    parser.add_argument(
        "vecs",
        help="A .vecs file, as produced by word2vecf",
    )
    parser.add_argument(
        "--benchmark",
        help="The evaluation benchmark to use",
        default="SimLex-999",
    )

    args = parser.parse_args()
    eval(args.vecs, args.benchmark)
