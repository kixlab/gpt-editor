import os
from flask import Blueprint, jsonify, request
import openai
import networkx as nx
import torch
from scipy.spatial.distance import cdist
import json

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

def process_simcse(model, tokenizer, sentences):
    inputs = tokenizer(sentences, padding=True, truncation=True, return_tensors="pt")

    # Get the embeddings
    with torch.no_grad():
        embeddings = model(**inputs, output_hidden_states=True, return_dict=True).pooler_output

    cossim = 1 - cdist(embeddings, embeddings, 'cosine')
    
    return embeddings, cossim 


def draw_graph(sentences, cossim):
    G = nx.Graph()

    for i in range(len(sentences)):
        G.add_node(i, label=sentences[i])

    for i in range(len(sentences)):
        for j in range(i+1, len(sentences)):
            weight = 100 * round(cossim[i][j].item(), 2)
            #G.add_edge(i, j, weight=weight, label=weight)
            G.add_weighted_edges_from([(i, j, weight)], label=weight)

    coord = nx.spring_layout(G, weight="weight")
    
    return coord

def create_api(model, tokenizer) -> Blueprint:
    api = Blueprint('api', __name__)

    @api.route('/api/generate-new', methods=['POST'])
    def generate():
        sentences = get_sentences(request, 1)
        existing = request.json['existing']
        combined = list(map(lambda entry: entry['text'], existing))+sentences
        embeddings, cossim = process_simcse(model, tokenizer, combined)
        coord = draw_graph(combined, cossim)
        result = []
        for i in range(len(existing)):
            result.append({
                'switchId': existing[i]['switchId'],
                'text': existing[i]['text'], 
                'coordinates': {'x': coord[i][0], 'y': coord[i][1]
            }})
        for i in range(len(sentences)):
            result.append({
                'switchId': request.json['switchId'], 
                'text': sentences[i], 
                'coordinates': {'x': coord[i + len(existing)][0], 'y': coord[i + len(existing)][1]
            }})
        return jsonify(result)

    @api.route('/api/generate-one', methods=['POST'])
    def generate_one():
        sentences = get_sentences(request, 1)
        return jsonify([{'text': sentences[0]}])

    @api.route('/api/generate-length', methods=['POST'])
    def generate_length():
        sentences = get_sentences(request, request.json['length'])
        existing = request.json['existing']
        combined = list(map(lambda entry: entry['text'], existing))+sentences
        embeddings, cossim = process_simcse(model, tokenizer, combined)
        coord = draw_graph(combined, cossim)
        result = []
        for i in range(len(existing)):
            result.append({
                'switchId': existing[i]['switchId'],
                'text': existing[i]['text'], 
                'coordinates': {'x': coord[i][0], 'y': coord[i][1]
            }})
        for i in range(len(sentences)):
            result.append({
                'switchId': request.json['switchId'], 
                'text': sentences[i], 
                'coordinates': {'x': coord[i + len(existing)][0], 'y': coord[i + len(existing)][1]
            }})
        return jsonify(result)

    return api





