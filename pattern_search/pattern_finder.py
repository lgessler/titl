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


def compareLine(line1, line2):
    '''Compares multiple word segments or whole sentences.'''
    #do not penalize free word order
    token_score = fuzz.token_sort_ratio(line1, line2)
    #do not penalize repetitions
    set_score = fuzz.token_set_ratio(line1, line2)
    return (token_score/2) + (set_score)/2


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
            results.append((norm_ln,100))
            print(norm_ln)
    return results


def fuzzyMatch(corpus, pattern):
    matches = []
    for ln in corpus:
        score = compareLine(ln,pattern)
    # partialRatioResult returns the same number as partialRatio but also the indices
    # of where the match was found.
    #partialRatioResult = fuzz.custom_get_blocks(pattern,norm_ln)
    #tokenSetRatio = fuzz.token_set_ratio(pattern, norm_ln)

    if score >= 80:
        matches.append((ln,score))
        print(partialRatio, norm_ln.strip('\n'))

#    elif tokenSetRatio >= 80:
#        print("----------- token set ratio ------------")
#        matches.append(ln)
#        print(tokenSetRatio, norm_ln.strip('\n'))
            
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

def compareLines(unselected_corpus_line, unselected_input):
    #do not penalize free word order
    token_score = fuzz.token_sort_ratio(unselected_corpus_line, unselected_input)
    #do not penalize repetitions
    set_score = fuzz.token_set_ratio(unselected_corpus_line, unselected_input)
    return (token_score/2) + (set_score)/2

def weightedFuzzymatch(split_corpusline, split_queryline):
    selected_score = fuzz.ratio(split_corpusline[0], split_queryline[0])
    unselected_score = compareLines(split_corpusline[1], split_queryline[1])
    return weightSubunits(selected_score, unselected_score)

def weightedSimplematch(split_corpusline, split_queryline):
    '''Matches query to matched block and rest of sentences to each other'''
    selected_score = fuzz.ratio(split_corpusline[0], split_queryline[0])
    if selected_score < 100:
        return 0
    unselected_score = compareLines(split_corpusline[1], split_queryline[1])
    return weightSubunits(selected_score, unselected_score)

def weightSubunits(selected_match_score, unselected_match_score):
    '''Takes similar scores for substring/subword units.
    Gives higher weights to selected subunit.
    Returns combined score.'''
    selected_weight = .75
    unselected_weight = .25
    weight1 = selected_match_score * selected_weight
    weight2 = unselected_match_score * unselected_weight
    return weight1 + weight2

def weightedFuzzymatch(split_corpusline, split_queryline):
    selected_score = fuzz.ratio(split_corpusline[0], split_queryline[0])
    unselected_score = compareLine(split_corpusline[1], split_queryline[1])
    return weightSubunits(selected_score, unselected_score)


def weightedMatch(corpus, input_string, query, fuzzy):
    '''split, match splits, and weight score.
    Returns list of match sentences'''
    weighted_matches = []
    if fuzzy:
        split_string = split(input_string, get_indices(args))
        #[(corpus line, ratio, (matched_block_indices))]
        partial_matches = process.extract(query, corpus, scorer=fuzz.partial_ratio)
        for match in partial_matches:
            if match[1] >= 50:
                split_line = split(match[0], match[2])
                weighted_score = weightedFuzzymatch(split_line, split_string)
                if weighted_score >= 80:
                    weighted_matches.append(match[0], weighted_score)
    else:
        span_matches = simpleMatch(corpus, query)
        for match in span_matches:
            line_similarity = compareLine(input_string, span_matches[0])
            weighted_score = weight(span_matches[1],line_similarity)
            if weighted_score >= 80:
                weighted_matches.append(span_matches[0],weighted_score)
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
            matches = fuzzyMatch(corpus, p)
        else:
            matches = weightedMatch(corpus, p, args.indices,args.fuzzy)
    else:
        if args.sentence:
            matches = simpleMatch(corpus, p)
        else:
            matches = weightedMatch(corpus, p, args.indices, fuzzy=False)
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
            %(prog)s -s hiiko -i "0-2" -c ../../Arapaho-test.txt -o output.txt -m # take a sentence, indices
             for the query substring, and return matches from the corpus   # search for the morpheme
             'hii' in the file Arapaho-test.txt
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
    parser.add_argument('-l', '--sentence', action='store_true',
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
    
