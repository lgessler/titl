'''
Started by Olga Zamaraeva
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
RESULT_WIDTH = 13 # Reserved for 'PARTIAL MATCH'
MATCH           = 'MATCH'
PARTIAL_MATCH   = 'PARTIAL MATCH' # to use with editdistance or something similar
NO_MATCH      = 'NO MATCH'


# EXCEPTIONS ##################################################################

class PatternFinderError(Exception):
    """Raised when a the program fails for any reason."""

# VALIDATION OF ARGUMENTS

def validate_arguments(args):
    if not args.string:
        raise PatternFinderError('Please provide the string to search for.')
    if not args.corpus:
        raise PatternFinderError('Please provide a corpus to search in.')
    if args.string == '*':
        raise PatternFinderError('Don\'t do that (use * as your pattern)' )

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

        if partialRatio >= 65:
            matches.append(ln)
            print(partialRatio, norm_ln.strip('\n'))

        elif tokenSetRatio >= 65:
            print("----------- token set ratio ------------")
            matches.append(ln)
            print(tokenSetRatio, norm_ln.strip('\n'))
            
    return matches

def tryProcess(corpus, string):
    ''' process module from fuzzywuzzy -seems to score differently from partialRatio & tokenSetRatio '''
    print(len(corpus))
    matches = process.extract(string, corpus)
    print(matches)
        
        


# MAIN FUNCTIONS ##############################################################
'''
Return a list of sentences where a match was found.
'''
def main(args):
    validate_arguments(args)
    with open(args.corpus,'r') as f:
        corpus = f.readlines()
    s = normalize(args.string)
    if args.fuzzy == True:
        matches = fuzzyMatch(corpus, s)
    else:
        matches = simpleMatch(corpus, s)
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
    parser.add_argument('-c', '--corpus',
                        help='corpus to find matches in')
    parser.add_argument('-f', '--fuzzy', action='store_true',
                          help='select partial matches')
    args = parser.parse_args()

    main(args)
    
