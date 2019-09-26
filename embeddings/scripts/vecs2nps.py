"""An update of word2vecf's vecs2nps.py for python 3"""
import numpy as np
import sys
import io

fh=io.open(sys.argv[1])
foutname=sys.argv[2]
first=next(fh)
size=list(map(int,first.strip().split()))

wvecs=np.zeros((size[0],size[1]),float)

vocab=[]
for i,line in enumerate(fh):
    line = line.strip().split()
    vocab.append(line[0])
    wvecs[i,] = np.array(list(map(float,line[1:])))

np.save(foutname+".npy",wvecs)
with io.open(foutname+".vocab","w") as outf:
   print(" ".join(vocab), file=outf)