'''
Contributors: Olga Zamaraeva, Alexis Palmer, Sarah Moeller

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
from myfuzzywuzzy import fuzz
from myfuzzywuzzy import process


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
        print('Please provide the string which contains the highlighted patterns.')
        success = False
    if not args.indices:
        print('Please provide the indices of the patterns highlighted in the string.')
        success = False
    if not args.corpus:
        print('Please provide a corpus to search in.')
        success = False
    if not (args.words or args.morphemes or args.discont):
        print('Default: Treating the entire sentence as pattern.')
    if not success:
        print('\n')
        parser.print_help()
        exit(1)

# PREPROCESSING OF DATA

def get_indices(args):
    indices = []
    for index_pair in args.indices.split(','):
        split = index_pair.split('-')
        start = int(split[0])
        end = int(split[1])
        indices.append((start, end))
    return indices

def normalize(s):
    norm_s = s.lower().strip('\n')
    return norm_s

# MATCHING FUNCTIONS ##########################################################

'''
The pattern to match is the entire sentence.
'''
def get_sentences_pattern(string, indices):
    return string[indices[0]:indices[1]+1]

'''
The pattern to match is one or more contiguous words.
'''
def get_words_pattern(string, indices, fuzzy=False):
    substr = re.escape(string[indices[0]:indices[1]+1])
    pattern = r'\b'+substr+r'\b' if not fuzzy else substr # \b is word boundary
    return pattern

'''
The pattern to match is one or more contiguous morphemes.
'''
def get_morphemes_pattern(string, indices, fuzzy=False):
    substr = re.escape(string[indices[0]:indices[1]+1])
    pattern = r'\B'+substr+'|'+substr+r'\B' if not fuzzy else substr
    return pattern

'''
The pattern to match is a discontinuous span.
'''
def get_discont_span_pattern(string, list_of_index_pairs,fuzzy=False):
    substrs = []
    for pair in list_of_index_pairs:
        substrs.append(string[pair[0]:pair[1]+1])
    if not fuzzy:
        pattern = ''
        for s in substrs:
            pattern += r'.*('+re.escape(s)+')'
        return r''+pattern+r'.*'
    return substrs

def simpleMatch(corpus, pattern):
    results = []
    regex = re.compile(r''+pattern,re.I)
    for ln in corpus:
        norm_ln = normalize(ln)
        matches = list(re.finditer(regex, norm_ln))
        if matches:
            match_spans = []
            for m in matches:
                for span in m.regs:
                    match_spans.append(span)
            results.append((norm_ln,match_spans))
            print(norm_ln)
    return results


def fuzzyMatch(corpus, pattern):
    matches = []
    for ln in corpus:
        norm_ln = normalize(ln)
        partialRatio = fuzz.partial_ratio(pattern, norm_ln)
        # partialRatioResult returns the same number as partialRatio but also the indices
        # of where the match was found.
        partialRatioResult = fuzz.custom_get_blocks(pattern,norm_ln)
        tokenSetRatio = fuzz.token_set_ratio(pattern, norm_ln)

        if partialRatio >= 80:
            matches.append(ln)
            print(partialRatio, norm_ln.strip('\n'))

        elif tokenSetRatio >= 80:
            print("----------- token set ratio ------------")
            matches.append(ln)
            print(tokenSetRatio, norm_ln.strip('\n'))
            
    return matches

def tryProcess(corpus, pattern):
    ''' process module from fuzzywuzzy -seems to score differently from partialRatio & tokenSetRatio '''
    print(len(corpus))
    matches = process.extract(pattern, corpus)
    print(matches)

# SPLITTING and WEIGHTING FUNCTIONS ##########################################################

'''
Not activated if sentence selection is flagged.
'''
def split(sentence, idcs):
    '''Splits sentence into block and rest of sentence'''
    block = sentence[idcs[0]:idcs[1]]
    rest_of_line = sentence[:idcs[0]] + ' ' + sentence[idcs[1]:]
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

def weightSubunits(selected_match_score, unselected_match_score):
    '''Takes similar scores for substring/subword units.
    Gives higher weights to selected subunit.
    Returns combined score.'''
    selected_weight = .75
    unselected_weight = .25
    weight1 = selected_match_score * selected_weight
    weight2 = unselected_match_score * unselected_weight
    return weight1 + weight2


def weightedMatch(corpus, input_string, query_idcs, fuzzy=True):
    '''split, match splits, and weight score.
    Returns list of match sentences'''
    weighted_matches = []
    split_string = split(input_string,query_idcs)
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
    indices = get_indices(args)
    s = normalize(args.string)
    if args.words:
        p = get_words_pattern(s,indices[0],args.fuzzy)
    elif args.morphemes:
        p = get_morphemes_pattern(s,indices[0],args.fuzzy)
    elif args.discont:
        p = get_discont_span_pattern(s,indices,args.fuzzy)
    else:
        p = get_sentences_pattern(s,indices[0])
    if args.fuzzy:
        if args.sentence:
            matches = fuzzyMatch(corpus, s)
        else:
            matches = weightedmatch(corpus, s, args.indices)
    else:
        if args.sentence:
            matches = simpleMatch(corpus, s)
        else:
            matches = weightedmatch(corpus, s, args.indices, fuzzy=False)
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
            for m in matches:
                f.write(m[0])
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
                        help='string in which the pattern was highlighted')
    parser.add_argument('-i', '--indices',
                        help='indices of highlighted span(s)')
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
    args = parser.parse_args()
    validate_arguments(args,parser)
    main(args)
    
