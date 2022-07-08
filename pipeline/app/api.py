import os
from flask import Blueprint, jsonify, request
import openai
import networkx as nx
import torch
from scipy.spatial.distance import cdist
import json
import random
import numpy as np
from scipy.special import softmax
from nltk.tokenize import sent_tokenize

openai.api_key = os.getenv("OPEN_API_KEY")

def findSentenceEnding(text, startIdx):
    idx = startIdx
    while idx < len(text) and text[idx] not in [".", "?", "!"]:
        idx += 1
    
    if idx + 1 < len(text) and text[idx + 1] in ['"', "'"]:
        idx += 1
    return idx

def get_sentences(request, length):
    response = openai.Completion.create(
        engine=request.json['engine'],
        prompt=request.json['text'],
        max_tokens=40*length,
        temperature=request.json['temperature'],
        top_p=request.json['topP'],
        frequency_penalty=request.json['frequencyPen'],
        presence_penalty=request.json['presencePen'],
        best_of=(request.json['bestOf'] if request.json['bestOf'] >= request.json['n'] else request.json['n']),
        n=request.json['n']
    )

    sentences = []
    for i in range(len(response.choices)):
        s = response.choices[i].text
        cropIdx = 0
        for j in range(length):
            endIdx = findSentenceEnding(s, cropIdx)
            cropIdx = endIdx + 1
        sentences.append(s[:cropIdx])
    
    return sentences

def get_sentences_from_mutiple(request):
    generator_list = request.json['generators']
    sentences = []
    for i in range(len(generator_list)):
        generator = generator_list[i]
        response = openai.Completion.create(
            engine=generator['engine'],
            prompt=request.json['text'],
            max_tokens=40,
            temperature=generator['temperature'],
            top_p=generator['topP'],
            frequency_penalty=generator['frequencyPen'],
            presence_penalty=generator['presencePen'],
            best_of=(generator['bestOf'] if generator['bestOf'] >= request.json['n'] else request.json['n']),
            n=request.json['n'],
        ).choices

        print(response)
        for j in range(len(response)):
            if len(response[j].text) == 0: 
                continue
            response[j].text = response[j].text.strip().split("\n")[0]
            sentences.append({'switchId': generator['switchId'], 'text': response[j].text})
    
    return sentences

def process_simcse(model, tokenizer, texts):
    sentences = list(map(lambda x: sent_tokenize(x), texts))
    sentences_joined = sum(sentences, [])
    inputs = tokenizer(sentences_joined, padding=True, truncation=True, return_tensors="pt")

    # Get the embeddings
    with torch.no_grad():
        embeddings = model(**inputs, output_hidden_states=True, return_dict=True).pooler_output

    # Get average embedding for each text
    embeddings_avg = torch.zeros(len(texts), embeddings.shape[1])
    start_idx = 0
    for i in range(len(texts)):
        end_idx = start_idx + len(sentences[i])
        mean = torch.mean(embeddings[start_idx:end_idx], dim=0)
        embeddings_avg[i] = mean
        start_idx = end_idx

    cossim = 1 - cdist(embeddings_avg, embeddings_avg, 'cosine')
    
    return embeddings_avg, cossim 

def draw_graph(sentences, cossim):
    G = nx.Graph()

    for i in range(len(sentences)):
        G.add_node(i, label=sentences[i])

    for i in range(len(sentences)):
        for j in range(i+1, len(sentences)):
            sim = cossim[i][j].item()
            if sim < 0.5:
                continue
            weight = 2**(10*round(sim, 1) - 5)
            #G.add_edge(i, j, weight=weight, label=weight)
            G.add_weighted_edges_from([(i, j, weight)], label=weight)

    coord = nx.spring_layout(G, weight="weight")
    
    return coord

def get_classification(sentences, model, tokenizer):
    inputs = tokenizer(sentences, padding=True, truncation=True, return_tensors="pt")

    # Get the embeddings
    with torch.no_grad():
        output = model(**inputs)
    scores = output.logits.numpy()
    scores = softmax(scores, axis=1)

    return scores

def create_api(sst, sentiment, emotion) -> Blueprint:
    api = Blueprint('api', __name__)

    @api.route('/api/generate-new', methods=['POST'])
    def generate():
        sentences = get_sentences(request, 1)
        existing = request.json['existing']
        combined = list(map(lambda entry: entry['text'], existing))+sentences
        embeddings, cossim = process_simcse(sst.model, sst.tokenizer, combined)
        coord = draw_graph(combined, cossim)
        result = []
        for i in range(len(existing)):
            result.append({
                'switchId': existing[i]['switchId'],
                'text': existing[i]['text'], 
                'coordinates': {'x': coord[i][0], 'y': coord[i][1]}
            })
        for i in range(len(sentences)):
            result.append({
                'switchId': request.json['switchId'], 
                'text': sentences[i], 
                'coordinates': {'x': coord[i + len(existing)][0], 'y': coord[i + len(existing)][1]},
                'isNew': True
            })
        return jsonify(result)

    @api.route('/api/generate-one', methods=['POST'])
    def generate_one():
        sentences = get_sentences(request, 1)
        return jsonify([{'text': sentences[0]}])

    @api.route('/api/generate-length', methods=['POST'])
    def generate_length():
        sentences = list(map(lambda txt: txt.strip(), get_sentences(request, request.json['length'])))
        #existing = request.json['existing']

        properties = {
            'engine': request.json['engine'],
            'temperature': request.json['temperature'],
            'topP': request.json['topP'],
            'frequencyPen': request.json['frequencyPen'],
            'presencePen': request.json['presencePen'],
            'bestOf': request.json['bestOf']
        }
        input_text = request.json['text']

        sentiments = get_classification(sentences, sentiment.model, sentiment.tokenizer)
        emotions = get_classification(sentences, emotion.model, emotion.tokenizer)

        #combined = list(map(lambda entry: entry['text'], existing))+sentences
        #embeddings, cossim = process_simcse(sst.model, sst.tokenizer, combined)
        #coord = draw_graph(combined, cossim)

        result = []
        '''
        for i in range(len(existing)):
            result.append({
                'switchId': existing[i]['switchId'],
                'text': existing[i]['text'], 
                'coordinates': {'x': coord[i][0], 'y': coord[i][1]},
                "sentiment": existing[i]['sentiment'],
                "emotion": existing[i]['emotion'],
                "isPinned": existing[i]['isPinned'] if 'isPinned' in existing[i] else False,
                'properties': existing[i]['properties'],
                'inputText': existing[i]['inputText']
            })
        '''
        for i in range(len(sentences)):
            result.append({
                'switchId': request.json['switchId'], 
                'text': sentences[i], 
                'coordinates': {'x': 0, 'y': 0},
                "sentiment": np.around(sentiments[i] * 100).tolist(),
                "emotion": np.around(emotions[i] * 100).tolist(),
                'isNew': True,
                'properties': properties,
                'inputText': input_text
            })
        return jsonify(result)

    @api.route('/api/get-similarity', methods=['POST'])
    def get_similarity():
        sentences = request.json['sentences']
        sentences_text = list(map(lambda entry: entry['text'], sentences))
        embeddings, cossim = process_simcse(sst.model, sst.tokenizer, sentences_text)
        coord = draw_graph(sentences_text, cossim)
        for i in range(len(sentences)):
            sentences[i]['coordinates'] = {'x': coord[i][0], 'y': coord[i][1]}
        return jsonify(sentences)


    @api.route('/api/generate-multiple', methods=['POST'])
    def generate_multiple():
        generations = get_sentences_from_mutiple(request)
        sentences = list(map(lambda entry: entry['text'], generations))
        existing = request.json['existing']

        sentiments = get_classification(sentences, sentiment.model, sentiment.tokenizer)
        emotions = get_classification(sentences, emotion.model, emotion.tokenizer)

        combined = list(map(lambda entry: entry['text'], existing))+sentences
        embeddings, cossim = process_simcse(sst.model, sst.tokenizer, combined)
        coord = draw_graph(combined, cossim)

        result = []
        for i in range(len(existing)):
            result.append({
                'switchId': existing[i]['switchId'],
                'text': existing[i]['text'], 
                'coordinates': {'x': coord[i][0], 'y': coord[i][1]},
                "sentiment": existing[i]['sentiment'],
                "emotion": existing[i]['emotion']
            })
        for i in range(len(sentences)):
            result.append({
                'switchId': generations[i]['switchId'], 
                'text': sentences[i], 
                'coordinates': {'x': coord[i + len(existing)][0], 'y': coord[i + len(existing)][1]},
                "sentiment": np.around(sentiments[i] * 100).tolist(),
                "emotion": np.around(emotions[i] * 100).tolist(),
                "isNew": True
            })
        return jsonify(result)

    return api





