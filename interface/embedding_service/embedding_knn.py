import numpy as np
import logging
import spacy
from scipy.spatial import KDTree
from spacy.tokenizer import Tokenizer


class SentenceEmbeddingKnn:
    def _filter_short_sentences(self, sentences, min_length):
        return [sentence for sentence in sentences if len(sentence) > min_length]

    def __init__(self, sentences, word_vectors, k, sentence_min_length=3):
        self._k = k

        # tokenizer setup
        logging.info("Initializing embedder")
        logging.info("Setting up tokenizer")
        nlp = spacy.load("en_core_web_sm")
        nlp.tokenizer = Tokenizer(nlp.vocab)
        self._tokenizer = nlp

        logging.info("Generating sentence vectors for corpus")
        assert type(sentences[0]) != str, "Corpus must already be tokenized."
        long_sentences = self._filter_short_sentences(sentences, sentence_min_length)
        logging.info(f"Filtered out {len(sentences) - len(long_sentences)} which were under the minimum length of {sentence_min_length}")
        self.sentences = long_sentences
        self._word_vectors = word_vectors
        self._UNK_WORD = np.mean(np.array(list(word_vectors.values())), axis=0) # define unknown word vector as the mean of all vectors
        self.sentence_vectors = self.embed(self.sentences)

        self._tree = KDTree(self.sentence_vectors)
        logging.info("KDTree constructed.")

    # np.array([np.mean(vectors, axis=0)]), k=args.k * 10, sort_results=True

    def _tokenize(self, input_string):
        doc = self._tokenizer(input_string)
        tokens = list(map(lambda x: getattr(x, 'text'), doc[:]))
        return tokens

    def _embed_word(self, word):
        return self._word_vectors[word] if word in self._word_vectors else self._UNK_WORD

    def embed(self, sentences):
        sentence_vectors = []
        for sentence in sentences:
            avg_word_vec = np.mean(list(map(self._embed_word, sentence)), axis=0)
            sentence_vectors.append(avg_word_vec)

        return sentence_vectors

    def knn(self, sentences):
        sentences = [self._tokenize(sentence) for sentence in sentences]
        sentence_vectors = self.embed(sentences)
        distances, indices = self._tree.query(sentence_vectors, k=self._k * 10)
        return distances, indices

    def get_sentence_by_index(self, i):
        if 0 <= i < len(self.sentences):
            return " ".join(self.sentences[i])
        else:
            raise ValueError(f"Index {i} is greater than len(self.sentences) = {len(self.sentences)}")
