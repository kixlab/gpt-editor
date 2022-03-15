import os
import openai
import networkx as nx
import matplotlib.pyplot as plt
#from sentence_transformers import SentenceTransformer, util
import torch
from scipy.spatial.distance import cdist
from transformers import AutoModel, AutoTokenizer
from sklearn.manifold import TSNE

# Import our models. The package will take care of downloading the models automatically
tokenizer = AutoTokenizer.from_pretrained("princeton-nlp/sup-simcse-bert-base-uncased")
simcse_model = AutoModel.from_pretrained("princeton-nlp/sup-simcse-bert-base-uncased")

#sbert_model = SentenceTransformer('all-mpnet-base-v2')

def findSentenceEnding(text, startIdx):
    idx = startIdx
    while idx < len(text) and text[idx] not in [".", "?", "!"]:
        idx += 1
    
    if idx + 1 < len(text) and text[idx + 1] in ['"', "'"]:
        idx += 1
    return idx

txt = """She broke open the fortune cookie, but there was a map on the tiny slip of paper. She looked at the map and then quickly unfolded it. "Another piece and I'm still nowhere close," she thought to herself. She thanked the cashier and promptly left the Chinese restaurant, her ordered basket of dumplings untouched."""

sentences = [
    '\n\nShe sat on the curb, looking at the piece of paper.', 
    ' She checked the slip of paper, which read: "Go straight to your left, turn right at the first corner.', 
    "\n\nCHAPTER 4\n\nThe Detective's Office\n\nThe first detective on the scene was Detective Ross.", 
    '\n\nShe stepped outside and the wind whipped her long hair around her face.', 
    ' She had less than twenty minutes to go.', 
    '\n\nShe walked over to the skateboarding area, and stood on a bench, looking over the dozens of kids, who all seemed to look like', 
    "\n\nShe didn't give up.", 
    '\n\n\n\nShe called the first name on the map, a farmer named Janet Dixon.', 
    '\n\n\n\n\n\nMay 3rd, 2007\n\n\n\n"What in the name of magnolias and china do we have here?"', 
    '\n\n*****\n\n"Tina?"', 
    '\n\n\n\n"I suppose I should have figured it out sooner," she said to herself.', 
    '\n\nShe walked along the street towards the train station, trying to figure out where she was.', 
    " She was too tempted to go to the treasure site again even before she'd finished her dumplings.", 
    '\n\n#\n\n"So, where did you run away to?"', '\n\nA few blocks away was a small park with a walking trail.', 
    '\n\n\n\n* * * * *\n\n\n\n"I\'m going to go meet with the others tonight."', 
    ' She pulled the map out of her purse and studied it.', 
    '\n\nAs she headed back to the sidewalk, she spotted a distant payphone.', 
    '\n\n\n\nAt the main office, she sprinted up the stairs two at a time and headed straight to her desk.', 
    '\n\nFor the next hour, she wandered around the city, looking for the address on the map.'
]

def get_sentences():
    openai.api_key = os.getenv("OPEN_API_KEY")
    response = openai.Completion.create(
        engine="davinci",
        prompt=txt,
        max_tokens=30,
        temperature=0.8,
        n=20
    )

    sentences = []
    for i in range(len(response.choices)):
        s = response.choices[i].text
        cropIdx = 0
        endIdx = findSentenceEnding(s, cropIdx)
        cropIdx = endIdx + 1
        sentences.append(s[:cropIdx])
    
    return sentences

def process_sbert(sentences):
    embeddings = sbert_model.encode(sentences)
    cos_sim = util.cos_sim(embeddings, embeddings)
    return embeddings, cos_sim

def process_simcse(sentences):
    inputs = tokenizer(sentences, padding=True, truncation=True, return_tensors="pt")

    # Get the embeddings
    with torch.no_grad():
        embeddings = simcse_model(**inputs, output_hidden_states=True, return_dict=True).pooler_output

    cossim = 1 - cdist(embeddings, embeddings, 'cosine')
    
    return embeddings, cossim

def draw_matrix(sentences, cossim):
    plt.imshow(cossim)

    # set y axis tick labels
    plt.yticks(range(len(sentences)), map(lambda s: s[1].replace('\n', '\\n')+" ("+str(s[0])+")", enumerate(sentences)), fontsize=10)
    plt.xticks(range(len(sentences)), range(len(sentences)), fontsize=10)

    plt.colorbar()
    plt.show()


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

    # set label coords a bit upper the nodes
    node_label_coords = {}
    for node, coords in coord.items():
        node_label_coords[node] = (coords[0], coords[1] + 0.04)

    sentences = map(lambda s: s.replace('\n', '\\n'), sentences)

    # draw the network
    nodes = nx.draw_networkx_nodes(G, pos=coord)
    edges = nx.draw_networkx_edges(G, pos=coord)
    edge_labels = nx.draw_networkx_edge_labels(G, pos=coord, edge_labels=nx.get_edge_attributes(G, 'label'))
    node_labels = nx.draw_networkx_labels(G, pos=node_label_coords, font_size=8, labels={i: s for i, s in enumerate(sentences)})
    plt.title("Sentences network")

sentences = sentences
embeds, cossim = process_simcse(sentences)

# find maximum weight clique of length 3



#plt.subplot(121)
#draw_graph(sentences, cossim)
#embeds, cossim = process_sbert(sentences)
#plt.subplot(122)
#draw_graph(sentences, cossim)

#new_embeds = TSNE(n_components=2, learning_rate="auto").fit_transform(embeds)

#plt.scatter(new_embeds[:,0], new_embeds[:,1])

#for i, txt in enumerate(sentences):
#    plt.annotate(txt, (new_embeds[:,0][i], new_embeds[:,1][i]))

#plt.show()