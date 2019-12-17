from abc import ABC, abstractmethod
import numpy as np
import logging
import spacy
from scipy.spatial import KDTree
from spacy.tokenizer import Tokenizer


class SentenceEmbeddingKnn:
    def __init__(self, sentences, numpy_vector_filepath):
        logging.info(f"Attempting to loading vectors from {numpy_vector_filepath}")
        with open(numpy_vector_filepath, 'r') as f:
            vectors = np.loadtxt(f)
        logging.info("Vectors loaded.")

        self._vectors = vectors
        self.sentences = sentences

        nlp = spacy.load("en_core_web_sm")
        nlp.tokenizer = Tokenizer(nlp.vocab)
        self._tokenizer = nlp

        logging.info("Computing sentence vectors...")
        self.sentence_vectors =

        self._tree = KDTree(vectors)
        logging.info("KDTree constructed.")

    # np.array([np.mean(vectors, axis=0)]), k=args.k * 10, sort_results=True

    def _tokenize(self, input_string):
        return self._tokenizer(input_string)

    def embed(self, input_sentence):
        pass

    def knn(self, sentences, tokenize=True):
        ...
#        if tokenize:
#
#        sentences = []
#        for sentence in sentences:
#            if tokenize:
#                sentence = self.tokenize(sentence)
#


