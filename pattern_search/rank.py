
import collections
import argparse
import textwrap
import myfuzzywuzzy
from pattern_finder import compareLines

# RANKING
'''
Source:
https://www.quora.com/Where-can-I-find-a-maximum-marginal-relevance-algorithm-in-Python-for-redundancy-removal-in-two-documents
'''
def mmr_sorted(docs, q, lambda_, similarity1, similarity2):
    """Sort a list of docs by Maximal marginal relevance

	Performs maximal marginal relevance sorting on a set of
	documents as described by Carbonell and Goldstein (1998)
	in their paper "The Use of MMR, Diversity-Based Reranking
	for Reordering Documents and Producing Summaries"

    :param docs: a set of documents to be ranked
				  by maximal marginal relevance
    :param q: query to which the documents are results
    :param lambda_: lambda parameter, a float between 0 and 1
    :param similarity1: sim_1 function. takes a doc and the query
						as an argument and computes their similarity
    :param similarity2: sim_2 function. takes two docs as arguments
						and computes their similarity score
    :return: a (document, mmr score) ordered dictionary of the docs
			given in the first argument, ordered my MMR
    """
    selected = collections.OrderedDict()
    while set(selected) != docs:
        remaining = docs - set(selected)
        mmr_score = lambda x: lambda_*similarity1(x, q) - (1-lambda_)*max([similarity2(x, y)
                                                                           for y in set(selected)-{x}] or [0])
        next_selected = argmax(remaining, mmr_score)
        selected[next_selected] = len(selected)
    return selected

def argmax(keys, f):
    return max(keys, key=f)

def similarity1(d,q):
    return

def similarity2(d1,d2):
    return compareLines(d1,d2)

def main(args):
    with open(args.input, 'r') as f:
        matches = f.readlines()
    sim1 = {}
    sentences = {}
    for i,m in enumerate(matches):
        sentence,score = m.split('\t')
        sentences[i]=sentence
        sim1[i]=score

    mmr_sorted(sentences.values(),'DUMMY',similarity1,similarity2)
# SCRIPT ENTRYPOINT ###########################################################

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description=textwrap.dedent('''\
        Given a query and a list of matching sentences and their scores,
        rank matching sentences based on Maximal Marginal Relevance.
        '''),
        epilog=textwrap.dedent('''\
        Examples:
            %(prog)s INPUT LAMBDA
        '''))
    parser.add_argument('-i', '--input',
                        help='input file SENTENSE TAB SCORE')
    parser.add_argument('-l', '--lambda',
                        help='A number between 0 and 1, 0 means less diversity, 1 means more diversity')
    args = parser.parse_args()
    main(args)
