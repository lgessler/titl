# Installation
Compile word2vecf:

```bash
hg clone https://bitbucket.org/yoavgo/word2vecf
cd word2vecf
# Depending on your system, you may need to replace 
# `#include <malloc.h>` with `#include <stblib.h>`.
make
cd ..
```

Make a new conda environment and install dependencies:

```bash
conda create --name titl python=3.7
conda activate titl
pip install -r requirements.txt
```

# Usage

_(Refer to word2vecf/README.word2vecf.txt for more details.)_

1\. Prepare word-context pairs and vocabularies:

```bash
python conllu_to_word_contexts.py \
        --train data/en_gum-ud-train.conllu \
        --outfile output/en_gum-ud-train.upostag.context \
        --context-tags upostag \
        --context-window-size 2
```

2\. Prepare context and word vocabularies, discarding any that don't occur a certain number of times:

```bash
./word2vecf/count_and_filter \
        -train output/en_gum-ud-train.upostag.context \
        -cvocab output/en_gum-ud-train.upostag.cv \
        -wvocab output/en_gum-ud-train.upostag.wv \
        -min-count 50
```

3\. Train the embeddings:

```bash
./word2vecf/word2vecf \
        -train "output/en_gum-ud-train.upostag.context" \
        -cvocab "output/en_gum-ud-train.upostag.cv" \
        -wvocab "output/en_gum-ud-train.upostag.wv" \
        -size 200 \
        -negative 15 \
        -threads 4 \
        -iters 10 \
        -output "output/en_gum-ud-train.upostag.vecs" \
        -dumpcv "output/en_gum-ud-train.upostag.context_vecs"
```

4\. Convert the vectors so they're numpy-friendly:

```bash
python ./scripts/vecs2nps.py \
        output/en_gum-ud-train.upostag.vecs \
        output/en_gum-ud-train.upostag.npvecs
```

5\. Your NP-ready embeddings will now be in `output/en_gum-ud-train.upostag.npvecs.npy`.
