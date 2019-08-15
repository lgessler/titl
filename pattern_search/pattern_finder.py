'''
Contributors: Olga Zamaraeva, Alexis Palmer
olzama@uw.edu

For the Pittsburgh workshop on Technology for Language Documentation and Revitalization
(August 12-16, 2019)

Scenario: Teacher identifies a pattern of pedagogical interest, such as a word or a phrase.
This program should find uses of that pattern in a given corpus.

I will start this program as a straightforward pattern-matching function but it can later
evolve into something more complex (e.g.: allomorphy, complex syntactic phenomena which manifest themselves
in a variety of ways, etc.)
'''

import argparse
import textwrap
import re
from fuzzywuzzy import fuzz
from fuzzywuzzy import process


# REPORT FORMATTING PARAMETERS ################################################

MAX_LINE_WIDTH = 120
RESULT_WIDTH   = 13 # Reserved for 'PARTIAL MATCH'
MATCH          = 'MATCH'
PARTIAL_MATCH  = 'PARTIAL MATCH' # to use with editdistance or something similar
NO_MATCH       = 'NO MATCH'

# EXCEPTIONS ##################################################################

class PatternFinderError(Exception):
    """Raised when a the program fails for any reason."""

# VALIDATION OF ARGUMENTS

def validate_arguments(args,parser):
    success = True
    if not args.string:
        print('Please provide the string to search for.')
        success = False
    if not args.corpus:
        print('Please provide a corpus to search in.')
        success = False
    if args.string == '*':
        print('Don\'t do that (use * as your pattern)' )
        success = False
    if not (args.words or args.morphemes or args.discont or args.sentence):
        print('Default: Treating the entire sentence as pattern.')
    if not success:
        print('\n')
        parser.print_help()
        exit(1)

# PREPROCESSING OF DATA

def normalize(s):
    norm_s = s.lower()
    return norm_s

# MATCHING FUNCTIONS ##########################################################

def simpleMatch(corpus, string):
    matches = []
    for ln in corpus:
        norm_ln = normalize(ln)
        match = re.search(string, norm_ln)
        if match:
            matches.append(ln)
            print(norm_ln.strip('\n'))
    return matches

def fuzzyMatch(corpus, string):
    matches = []
    for ln in corpus:
        norm_ln = normalize(ln)
        # ratio = fuzz.ratio(string, norm_ln)
        partialRatio = fuzz.partial_ratio(string, norm_ln)
        tokenSetRatio = fuzz.token_set_ratio(string, norm_ln)

        if partialRatio >= 80:
            matches.append(ln)
            print(partialRatio, norm_ln.strip('\n'))

        elif tokenSetRatio >= 80:
            print("----------- token set ratio ------------")
            matches.append(ln)
            print(tokenSetRatio, norm_ln.strip('\n'))
            
    return matches

def tryProcess(corpus, string):
    ''' process module from fuzzywuzzy -seems to score differently from partialRatio & tokenSetRatio '''
    print(len(corpus))
    matches = process.extract(string, corpus)
    print(matches)

# SPLITTING and WEIGHTING FUNCTIONS ##########################################################

'''
Not activated if sentence selection is flagged.
'''

def split(sentence, idcs):
    '''Splits sentence into block and rest of sentence'''
    block = sentence[idcs[0]:idcs[1]]
    rest_of_line = corpus_line[:idcs[0]] + ' ' + corpus_line[idcs[1]:]
    return [block, rest_of_line]

def weightRestOfLine(unselected_corpus_line, unselected_input):
    #do not penalize free word order
    token_score = fuzz.token_sort_ratio(unselected_corpus_line, unselected_input)
    #do not penalize repetitions
    set_score = fuzz.token_set_ratio(unselected_corpus_line, unselected_input)
    return (token_score/2) + (set_score)/2

def weightedFuzzymatch(split_corpusline, split_queryline):
    selected_score = fuzz.ratio(split_corpusline[0], split_queryline[0])
    unselected_score = weightRestOfLine(split_corpusline[1], split_queryline[1])
    return weight(selected_score, unselected_score)

def weightedSimplematch(split_corpusline, split_queryline):
    '''Matches query to matched block and rest of sentences to each other'''
    selected_score = fuzz.ratio(split_corpusline[0], split_queryline[0])
    if selected_score < 100:
        return = 0
    unselected_score = weightRestOfLine(split_corpusline[1], split_queryline[1])
    return weight(selected_score, unselected_score)

def weight(selected_match_score, unselected_match_score):
    '''Takes similar scores for substring/subword units.
    Gives higher weights to selected subunit.
    Returns combined score.'''
    selected_weight = .6
    unselected_weight = .4

    weight1 = selected_match_score * selected_weight
    weight2 = unselected_match_score * unselected_weight
    return weight1 + weight2


def weightedMatch(corpus,string,query_idcs,fuzzy=True):
    '''split, match splits, and weight score.
    Returns list of match sentences'''
    weighted_matches = []
    split_string = split(string,query_idcs)
    #[(corpus line, ratio, (matched_block_indices))]
    partial_matches = process.extract(split_string[0], corpus, scorer=fuzz.partial_ratio)
    for match in partial_matches:
        weighted_score = 0
        if match[1] >= 80:
            if fuzzy:
                split_match = split(match[0], match[2])
                weighted_score = weightedFuzzymatch(split_match, split_string)
            else:
                norm_match = match[0].lower()
                split_match = split(norm_match, match[2])
                weighted_score = weightedSimplematch(split_match, split_string)

            if weighted_score >= 80:
                weighted_matches.append(match[0])
                print(weighted_score, match[0].strip('\n'))

    return weighted_matches

# MAIN FUNCTIONS ##############################################################
'''
Return a list of sentences where a match was found.
'''
def main(args):
    with open(args.corpus,'r') as f:
        corpus = f.readlines()
    s = normalize(args.string)
    if args.fuzzy:
        if args.sentence:
            matches = fuzzyMatch(corpus, s)
        else:
            matches = weightedFuzzymatch(corpus, s)
    else:
        if args.sentence:
            matches = simpleMatch(corpus, s)
        else:
            matches = weightedSimplematch(corpus, s)
#    print("testing process function from fuzzywuzzy")
#    tryProcess(corpus, s)
    # matches = []
    # for ln in corpus:
    #     norm_ln = normalize(ln)
    #     match = re.search(s,norm_ln)
    #     if match:
    #         matches.append(ln)
    #         print(norm_ln.strip('\n'))
    if len(matches) == 0:
        print(NO_MATCH)
    if args.output:
        with open(args.output, 'w') as f:
            for ln in matches:
                f.write(ln)
    return matches


# SCRIPT ENTRYPOINT ###########################################################

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description=textwrap.dedent('''\
        Scenario: Teacher identifies a pattern of pedagogical interest,
        such as a word or a phrase.
        This program should find uses of that pattern in a given corpus.
        '''),
        epilog=textwrap.dedent('''\
        Examples:
            %(prog)s STRING CORPUS   # take a string and return matches from the corpus
        '''))
    parser.add_argument('-s', '--string',
                        help='string to match')
    parser.add_argument('-w', '--words', action='store_true',
                        help='search for one of more full contiguous words')
    parser.add_argument('-m', '--morphemes', action='store_true',
                        help='search for one or more contiguous morphemes')
    parser.add_argument('-d', '--discont', action='store_true',
                        help='search for a discontinuous span')
    parser.add_argument('-l', '--sentence', action='store_false',
                        help='search for an entire sentence')
    parser.add_argument('-c', '--corpus',
                        help='corpus to find matches in')
    parser.add_argument('-o', '--output',
                        help='path to the output file')
    parser.add_argument('-f', '--fuzzy', action='store_true',
                          help='select partial matches')
    '''
    -w word
    -m morpheme
    -d discontinuous span
    -l sentence
    '''
    args = parser.parse_args()
    validate_arguments(args,parser)
    main(args)
    
