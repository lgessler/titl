import os
import argparse

import conllu

PADDING = "🆒"
CONTEXT_SEP = "_"


def parse_conllu(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        sentences = [tl for tl in conllu.parse_incr(f)]
        return sentences


def extract_tags(parsed_sentences, *keys):
    """Turns each sentence into a list of tuples, where each item in the tuple corresponds to a value given in *keys"""
    return [[tuple(tok[key] for key in keys)
             for tok in parsed_sentence]
            for parsed_sentence in parsed_sentences]


def extract_tokens(parsed_sentences):
    return [[tok["form"] for tok in parsed_sentence]
            for parsed_sentence in parsed_sentences]


def construct_context(parsed_sentences, context_window_size, *keys):
    """Turns each sentence into a special delimited string constructed with conllu column values from
    neighboring tokens. Tokens in a window of `context_window_size`, not including the token whose
    context is being constructed, are processed such that for each neighboring token, each value
    (specified by *keys) is joined with a separator ("_"), yielding a context for the token, and
    each of these values is then joined with a double separator ("__"), yielding the final context
    representation for the token, something like "ADJ__NOUN__ADJ__NOUN".
    """
    sentence_contexts = []
    for parsed_sentence in parsed_sentences:
        sentence_context = []
        for i in range(len(parsed_sentence)):
            context = []
            for j in range(i - context_window_size, i + context_window_size + 1):
                if j == i:
                    continue
                elif j < 0 or j >= len(parsed_sentence):
                    context.append(PADDING)
                else:
                    tok = parsed_sentence[j]
                    context.append(CONTEXT_SEP.join(tok[key] for key in keys))
            sentence_context.append((CONTEXT_SEP * 2).join(context))
        sentence_contexts.append(sentence_context)

    return sentence_contexts


def main(args):
    train_file = args.train

    parsed_train = parse_conllu(train_file)

    train_tokens = extract_tokens(parsed_train)
    train_contexts = construct_context(parsed_train, args.context_window_size, "upostag")
    assert len(train_tokens) == len(train_contexts)

    dirs = args.outfile.split(os.sep)[:-1]
    if len(dirs) > 0:
        os.makedirs(os.sep.join(dirs), exist_ok=True)
    with open(args.outfile, "w") as f:
        for i in range(len(train_tokens)):
            for j in range(len(train_tokens[i])):
                f.write(f"{train_tokens[i][j]}  {train_contexts[i][j]}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process some integers.")
    parser.add_argument(
        "--train",
        help="A conllu file to train the embeddings on",
        default=os.sep.join(["data", "en_gum-ud-train.conllu"]),
    )
    parser.add_argument(
        "--outfile",
        help="The file that will hold the space-delimited token-context pairs.",
        default=os.sep.join(["output", "en_gum-ud-train.upostag.context"]),
    )
    parser.add_argument(
        "--context-tags",
        help="comma-delimited conllu column names. Common values are 'id', 'form', 'lemma', 'upostag', 'xpostag', 'feats', 'head', 'deprel', 'deps', 'misc'. See conllu package for details.",
        default="upostag"
    )
    parser.add_argument(
        "--context-window-size",
        help="context window size, in terms of number of tokens in either direction",
        default=2,
        type=int,
    )

    args = parser.parse_args()
    args.context_tags = [ctx_tag.strip() for ctx_tag in args.context_tags.split(",")]
    main(args)