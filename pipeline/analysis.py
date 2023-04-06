import csv
import json
from datetime import datetime
from os.path import exists
import scipy.stats as stats
import numpy as np
import math
import evaluate
from nltk.tokenize import word_tokenize
import matplotlib.pyplot as plt

rouge = evaluate.load('rouge')
bleu = evaluate.load('bleu')

date_format = '%Y-%m-%d %H:%M:%S'

def arePropertiesEqual(a, b):
    if a is None or b is None:
        return False
    
    for key in a:
        if a[key] != b[key]:
            return False
    return True

def isPropertyInList(property, list):
    for item in list:
        if arePropertiesEqual(property, item):
            return True
    return False

def calc_rouge(advertisement, generations, use_aggregator=True):
    results = rouge.compute(predictions=generations,
                            references=[advertisement] * len(generations),
                            use_aggregator=use_aggregator)
    return results

advertisements = []
with open('./data/advertisements.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        advertisements.append(row)

advertisements = advertisements[1:]

participants = [
    { "name": "Munim Hasan Wasi", "isTreatment": 1, "tasks": ["Q", "U"]},
    { "name": "Jinho Park", "isTreatment": 0, "tasks": ["Q", "U"]},
    { "name": "Jonghyun Lee", "isTreatment": 1, "tasks": ["U", "Q"]},
    { "name": "Sean Tristan De Guzman", "isTreatment": 1, "tasks": ["Q", "U"]},
    { "name": "Omar Sayeed Saimum", "isTreatment": 0, "tasks": ["U", "Q"]},
    { "name": "Jisung Hwang", "isTreatment": 0, "tasks": ["Q", "U"]},
    { "name": "Heemoon Chae", "isTreatment": 1, "tasks": ["U", "Q"]},
    { "name": "elias firisa", "isTreatment": 0, "tasks": ["U", "Q"]},
    { "name": "Akotet Yeshaw Tesema", "isTreatment": 1, "tasks": ["Q", "U"]},
    { "name": "Minhajur Rahman Chowdhury Mahim", "isTreatment": 0, "tasks": ["Q", "U"]},
    { "name": "Hanhee", "isTreatment": 1, "tasks": ["U", "Q"]},
    { "name": "Ananya Mulatu Besufekad", "isTreatment": 0, "tasks": ["U", "Q"]},
    { "name": "Bich Ngoc Doan", "isTreatment": 1, "tasks": ["Q", "U"]},
    { "name": "Mahnoor Shafiq", "isTreatment": 0, "tasks": ["Q", "U"]},
    { "name": "Harim Seo", "isTreatment": 0, "tasks": ["U", "Q"]},
    { "name": "RIFAKAT", "isTreatment": 1, "tasks": ["U", "Q"]},
    { "name": "Istiak Hossain Akib", "isTreatment": 1, "tasks": ["Q", "U"]},
    { "name": "Gadisa", "isTreatment": 0, "tasks": ["Q", "U"]},
    { "name": "Kibriyanur", "isTreatment": 1, "tasks": ["U", "Q"]},
    { "name": "Duc", "isTreatment": 0, "tasks": ["U", "Q"]},
]

anomalies = ['heemoon', 'elias']


def process_results():
    results = []

    for i, p in enumerate(participants):
        tasks = ['a', 'b']
        isTreatment = p['isTreatment'] == 1
        temp = {
            "participant": i+1, 'name': p['name'],
            "isTreatment": isTreatment, "task": p['tasks'],
            "helpful": [], "control": [], "easy": [], 
            "explored": [], "explored-help": [], "iterate": [], "iterate-help": [],
            "proud": [], "goals": [], "ownership": [], "unique": [],
            "generate_count": [], "input_count": [], "property_count": [], 
            "input_count_nr": [], "property_count_nr": [],
            "rouge1": [], "rouge2": [], "rougeL": [], "rougeLsum": [], "bleu": [],
            "generations": [], "output": []
        }

        for j in range(2):
            json_str = []
            filename = f'./data/p{i+1}-{tasks[j]}'
            if isTreatment:
                with open(filename + "_history.json", "r") as f:
                    json_str += f.readlines()
            else:
                for k in range(3):
                    filename_control = f'{filename}-{k+1}_history.json'
                    if not exists(filename_control):
                        continue
                    with open(filename_control, "r") as f:
                        json_str += f.readlines()

            data = [json.loads(x) for x in json_str]
            # order based on timestamp
            data = sorted(data, key=lambda x: datetime.strptime(x['timestamp'], date_format))

            generate_count = 0
            input_count = 0
            property_count = 0

            generate_count = 0
            input_count_nr = 0
            property_count_nr = 0

            curr_input = ""
            curr_properties = None

            all_inputs = []
            all_properties = []

            generations = []

            for d in data:
                if "LangLang" in d['input']:
                    continue

                generate_count += 1

                if d['input'] != curr_input:
                    input_count += 1
                    curr_input = d['input']
                if not arePropertiesEqual(d['properties'], curr_properties):
                    property_count += 1
                    curr_properties = d['properties']

                if not d['input'] in all_inputs:
                    input_count_nr += 1
                    all_inputs.append(d['input'])
                if not isPropertyInList(d['properties'], all_properties):
                    property_count_nr += 1
                    all_properties.append(d['properties'])

                for s in d['sentences']:
                    if s in generations: continue
                    generations.append(s)
            
            temp['generate_count'].append(generate_count)
            temp['input_count'].append(input_count)
            temp['property_count'].append(property_count)
            temp['input_count_nr'].append(input_count_nr)
            temp['property_count_nr'].append(property_count_nr)
            temp['generations'].append(generations)

            # used = []
            # groups = []
            # for gen_i in range(len(generations)):
                # if gen_i+1 == len(generations): break
                # if gen_i in used: continue
                # candidates = np.logical_or(np.array(score['rouge1']) > 0., np.array(score['rouge2']) > 0.9)
                # candidates = np.where(candidates)
                # g = [generations[gen_i]]
                # for c_i in candidates[0]:
                #     g.append(generations[c_i])
                #     used.append(c_i)
                # groups.append(g)

            # predictions is the generations
            # references is the other generations excluding itself
            predictions = generations
            references = []
            for gen_i in range(len(generations)):
                references.append(generations[:gen_i] + generations[gen_i+1:])

            # compute similarity between each generation and the other generations excluding itself
            score = rouge.compute(
                predictions=predictions,
                references=references,
                use_aggregator=True
            )
            for key in score:
                if 'generations-' + key in temp:
                    temp['generations-' + key].append(score[key])
                else:
                    temp['generations-' + key] = [score[key]]
            
            # compute similarity between each generation and the other generations excluding itself
            score =  bleu.compute(
                predictions=predictions, 
                references=references,
                tokenizer=word_tokenize
            )
            key = 'bleu'
            if 'generations-' + key in temp:
                temp['generations-' + key].append(score[key])
            else:
                temp['generations-' + key] = [score[key]]


            # scores = {'rouge1': [], 'rouge2': [], 'rougeL': [], 'rougeLsum': []}
            
            # for g in groups:
            #     rouge_scores = calc_rouge(advertisements[i][5], g)
            #     for rouge_metric in rouge_scores.keys():
            #         scores[rouge_metric].append(rouge_scores[rouge_metric])

            # rouge_scores = calc_rouge(advertisements[i][5], generations, use_aggregator=False)
            # if len(generations) >= 5:
            #     candidates_idx = np.argpartition(rouge_scores['rouge2'], -5)[-5:]
            # else:
            #     candidates_idx = np.argpartition(rouge_scores['rouge2'], -1 * len(generations))[-1 * len(generations):]
            # top_10 = math.ceil(0.1 * len(generations))
            # candidates_idx = np.argpartition(rouge_scores['rouge2'], -1*top_10)[-1*top_10:]

            # get the survey data (ith participant, jth task)
            survey_data = advertisements[i*2 + j]
            ad = survey_data[5]

            temp['helpful'].append(int(survey_data[6]))
            temp['control'].append(int(survey_data[7]))
            temp['easy'].append(int(survey_data[8]))
            temp['explored'].append(int(survey_data[9]))
            temp['explored-help'].append(int(survey_data[10]))
            temp['iterate'].append(int(survey_data[11]))
            temp['iterate-help'].append(int(survey_data[12]))
            temp['proud'].append(int(survey_data[13]))
            temp['goals'].append(int(survey_data[14]))
            temp['ownership'].append(int(survey_data[15])) 
            temp['unique'].append(int(survey_data[16]))

            # calculate similarity between final advertisement and unioque generations seen
            scores = rouge.compute(
                predictions=[ad], 
                references=[generations], 
                use_aggregator=True
            )
            for key in scores:
                temp[key].append(scores[key])

            scores = bleu.compute(
                predictions=[ad], 
                references=[generations],
                tokenizer=word_tokenize
            )
            temp['bleu'].append(scores['bleu'])
            temp['output'].append(ad)

        results.append(temp)

    with open('./data/results.json', 'w') as f:
        json.dump(results, f)

# process_results()

results = json.load(open('./data/results.json'))
results = [x for x in results if x['name'].lower().split(" ")[0] not in anomalies]

def parseResultsList(results, key, isTreatment):
    return sum([x[key] for x in results if x['isTreatment'] == isTreatment], [])


# for each participant calculate the average bleu
final_sim = {
    'treatment': [],
    'control': []
}
participant = {
    'treatment': [],
    'control': []
}
for i in range(len(results)):
    if results[i]['isTreatment']:
        final_sim['treatment'].append(np.mean(results[i]['generate_count']))
        participant['treatment'].append(results[i]['name'])
    else:
        final_sim['control'].append(np.mean(results[i]['generate_count']))
        participant['control'].append(results[i]['name'])

print(final_sim)
print(participant)

analysis = {
    "treatment": {
        "num_participants": len([x for x in results if x['isTreatment']])
    },
    "control": {
        "num_participants": len([x for x in results if not x['isTreatment']])
    }
}

measures = list(results[0].keys())[4:]
measures.remove('output')
measures.remove('generations')

for key in measures:
    analysis['treatment'][key] = parseResultsList(results, key, True)
    analysis['control'][key] = parseResultsList(results, key, False)

def statisticalAnalysis(analysis, key):
    sh_treat = stats.shapiro(analysis['treatment'][key])
    sh_control = stats.shapiro(analysis['control'][key])
    if sh_treat.pvalue < 0.05 or sh_control.pvalue < 0.05:
        res = stats.mannwhitneyu(analysis['treatment'][key], analysis['control'][key])
    else:
        res = stats.ttest_ind(analysis['treatment'][key], analysis['control'][key])
    print(f'{key.upper()}')
    print(f"T: {np.mean(analysis['treatment'][key]):.3f} ({np.std(analysis['treatment'][key]):.3f})")
    print(f"C: {np.mean(analysis['control'][key]):.3f} ({np.std(analysis['control'][key]):.3f})")
    print(f"IS NORMAL? {sh_treat.pvalue >= 0.05 and sh_control.pvalue >= 0.05}")
    print(f"P-VALUE: {res.pvalue:.3f}")
    print()

def leveneTest(analysis, key):
    res = stats.levene(analysis['treatment'][key], analysis['control'][key], center='median')
    print(f'{key.upper()}')
    print(f"P-VALUE: {res.pvalue:.3f}")
    print()

for key in analysis['treatment']:
    if key == 'num_participants':
        continue
    statisticalAnalysis(analysis, key)
    leveneTest(analysis, key)

# create a new measure that is the total of proud, ownership, unique, goals
analysis['treatment']['output-perception'] = [x + y  for x, y in zip(analysis['treatment']['proud'], analysis['treatment']['unique'])]
analysis['control']['output-perception'] = [x + y for x, y in zip(analysis['control']['proud'], analysis['control']['unique'])]
print(len(analysis['treatment']['output-perception']))
# statistical analysis
statisticalAnalysis(analysis, 'output-perception')

# do the same but for helpful, control, easy
analysis['treatment']['helpful-control-easy'] = [x + y + z for x, y, z in zip(analysis['treatment']['helpful'], analysis['treatment']['control'], analysis['treatment']['easy'])]
analysis['control']['helpful-control-easy'] = [x + y + z for x, y, z in zip(analysis['control']['helpful'], analysis['control']['control'], analysis['control']['easy'])]
# statistical analysis
statisticalAnalysis(analysis, 'helpful-control-easy')

# create a new measure that is addition of exploration and iteration
analysis['treatment']['explore-iterate'] = [sum(x) for x in zip(analysis['treatment']['explored'], analysis['treatment']['iterate'])]
analysis['control']['explore-iterate'] = [sum(x) for x in zip(analysis['control']['explored'], analysis['control']['iterate'])]
# statistical analysis
statisticalAnalysis(analysis, 'explore-iterate')

# # linear regression of bleu against the helpful, control, easy, explored, iterate, proud, ownership, unique
# for key in ['helpful', 'control', 'easy', 'explored', 'iterate', 'proud', 'ownership', 'unique', 'goals']:
#     print(key)
#     res = stats.linregress(analysis['treatment']['generate_count'], analysis['treatment'][key])
#     if res.pvalue < 0.05:
#         print('TREATMENT:', res.slope, ' / ', res.pvalue)
#     res = stats.linregress(analysis['control']['generate_count'], analysis['control'][key])
#     if res.pvalue < 0.05:
#         print('CONTROL:', res.slope, ' / ', res.pvalue)
#         print('R SQUARED:', res.rvalue**2)
#     print()