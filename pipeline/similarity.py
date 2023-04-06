import csv
import json
import torch
import re
from scipy import mean
import scipy.stats as stats
import numpy as np
from sentence_transformers import SentenceTransformer, util
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.util import ngrams

model = SentenceTransformer('all-MiniLM-L6-v2')

anomalies = ['heemoon', 'elias']
anomalies += ['hanhee', 'mahnoor'] # BLEU and PROUD, but no UNIQUE

results = json.load(open('./data/results.json'))
results = [x for x in results if x['name'].lower().split(" ")[0] not in anomalies]

def getEmbeddingSim(target_emb, embeddings):
    similarities = util.cos_sim(torch.Tensor([target_emb]), embeddings)
    return sum(similarities[0]) / len(similarities[0])

def compareSentences(sentences):
    embeddings = model.encode(sentences)
    similarities = util.cos_sim(embeddings, embeddings)
    output = []
    for i in range(len(sentences)):
        # get average similarity without self
        similarities[i][i] = 0
        avg = np.mean(similarities[i].numpy())
        # standard deviation
        std = np.std(similarities[i].numpy())
        output.append(std)
    return output

def tokenize(text, sent=True):
    if sent:
        sentences = sent_tokenize(text)
        tokens = []
        for s in sentences:
            tokens.append(word_tokenize(s))
    else:
        tokens = word_tokenize(text)
    return tokens

def distinctN(tokens, n):
    if len(tokens) == 0:
        return 0.0  # Prevent a zero division
    distinct_ngrams = set(ngrams(tokens, n))
    return len(distinct_ngrams) / len(tokens)

def parseResultsList(results, key, isTreatment):
    return sum([x[key] for x in results if x['isTreatment'] == isTreatment], [])

def parseResults(results):
    analysis = {
        "treatment": {
            "num_participants": len([x for x in results if x['isTreatment']])
        },
        "control": {
            "num_participants": len([x for x in results if not x['isTreatment']])
        }
    }

    measures = list(results[0].keys())[4:]

    for key in measures:
        analysis['treatment'][key] = parseResultsList(results, key, True)
        analysis['control'][key] = parseResultsList(results, key, False)

    return analysis

for i in range(len(results)):
    data = results[i]
    data['avg_similarity'] = []
    data['distinct_2'] = [0, 0]
    for j in range(2):
        similarities = compareSentences(data['generations'][j])
        data['avg_similarity'].append(np.mean(similarities))

        for k in range(len(data['generations'][j])):
            # # PER SENTENCE
            # tokens_per_sentence = tokenize(data['generations'][j][k])
            # distinct_2 = 0
            # for tokens in tokens_per_sentence:
            #     distinct_2 += distinctN(tokens, 2)
            # distinct_2 /= len(tokens_per_sentence)
            # data['distinct_2'][j] += distinct_2

            # PER GENERATION
            tokens = tokenize(data['generations'][j][k], sent=False)
            data['distinct_2'][j] += distinctN(tokens, 2)

        data['distinct_2'][j] /= len(data['generations'][j])

analysis = parseResults(results)

for key in analysis['treatment']:
    if key != 'avg_similarity' and key != 'distinct_2':
        continue
    sh_treat = stats.shapiro(analysis['treatment'][key])
    sh_control = stats.shapiro(analysis['control'][key])
    if sh_treat.pvalue < 0.05 or sh_control.pvalue < 0.05:
        res = stats.mannwhitneyu(analysis['treatment'][key], analysis['control'][key])
    else:
        res = stats.ttest_ind(analysis['treatment'][key], analysis['control'][key])
    print(f'{key.upper()}')
    print(f"T: {mean(analysis['treatment'][key]):.3f} ({np.std(analysis['treatment'][key]):.3f})")
    print(f"C: {mean(analysis['control'][key]):.3f} ({np.std(analysis['control'][key]):.3f})")
    print(f"IS NORMAL? {sh_treat.pvalue >= 0.05 and sh_control.pvalue >= 0.05}")
    print(f"P-VALUE: {res.pvalue:.3f}")
    print()