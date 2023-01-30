import csv
import json
from datetime import datetime
from os.path import exists
from scipy import mean
import scipy.stats as stats
import evaluate
import numpy as np
import math

rouge = evaluate.load('rouge')
bleu = evaluate.load('bleu')

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

date_format = '%Y-%m-%d %H:%M:%S'

results = []

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


for i, p in enumerate(participants):
    tasks = ['a', 'b']
    isTreatment = p['isTreatment'] == 1
    temp = {
        "participant": i+1, "isTreatment": isTreatment, 
        "generate_count": [], "input_count": [], "property_count": [], 
        "input_count_nr": [], "property_count_nr": [],
        "rouge1": [], "rouge2": [], "rougeL": [], "rougeLsum": [],
        "bleu": []
    }

    if 'Heemoon' in p['name'] or 'elias' in p['name']:
        continue
    for j in range(2):
        json_str = []
        filename = f'./data/p{i+1}-{tasks[j]}'
        print(p)
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
        # order based on timestampe
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

        predictions = generations
        references = []
        for gen_i in range(len(generations)):
            references.append(generations[:gen_i] + generations[gen_i+1:])
        score = rouge.compute(predictions=predictions,
                    references=references,
                    use_aggregator=True)
        for key in score:
            if 'generations-' + key in temp:
                temp['generations-' + key].append(score[key])
            else:
                temp['generations-' + key] = [score[key]]
        
        score =  bleu.compute(predictions=predictions, references=references)
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

        print(advertisements[i*2 + j][1])
        ad = advertisements[i*2 + j][5]
        scores = rouge.compute(predictions=[ad], references=[generations], use_aggregator=True)
        
        # scores = {}
        # for key in rouge_scores:
        #     scores[key] = np.array(rouge_scores[key])[candidates_idx]
        
        for key in scores:
            temp[key].append(scores[key])
            if scores[key] == 0:
                print(temp['participant'])
                print(ad)
            #temp[key].append(sum(scores[key]) / len(scores[key]))

        scores = bleu.compute(predictions=[ad], references=[generations])
        temp['bleu'].append(scores['bleu'])

    results.append(temp)

with open('./data/results.json', 'w') as f:
    json.dump(results, f)

def parseResultsList(results, key, isTreatment):
    #return list(map(lambda y: (y[0] + y[1])/2, [x[key] for x in results if x['isTreatment'] == isTreatment]))
    return sum([x[key] for x in results if x['isTreatment'] == isTreatment], [])

# NR = No Repetitions

analysis = {
    "treatment": {
        "num_participants": len([x for x in results if x['isTreatment']])
    },
    "control": {
        "num_participants": len([x for x in results if not x['isTreatment']])
    }
}

measures = list(results[0].keys())[2:]

for key in measures:
    print(key)
    analysis['treatment'][key] = parseResultsList(results, key, True)
    analysis['control'][key] = parseResultsList(results, key, False)

print(analysis['treatment'])

# for key in analysis:
#     averages = {}
#     for m in measures:
#         if len(analysis[key][m]) == 0: continue
#         averages[m] = sum(analysis[key][m]) / len(analysis[key][m])

#     print(f'{key.upper()}')
#     for m in averages:
#         print(f'\t{m}: {averages[m]} {min(analysis[key][m])}')

for key in analysis['treatment']:
    if key == 'num_participants':
        continue
    sh = stats.shapiro(analysis['treatment'][key] + analysis['control'][key])
    if sh.pvalue < 0.05:
        res = stats.mannwhitneyu(analysis['treatment'][key], analysis['control'][key])
    else:
        res = stats.ttest_ind(analysis['treatment'][key], analysis['control'][key])
    print(f'{key.upper()}')
    print("T AVG:", format(mean(analysis['treatment'][key]), "3f"))
    print("T STD:", format(np.std(analysis['treatment'][key]), "3f"))
    print("C AVG:", format(mean(analysis['control'][key]), "3f"))
    print("C STD:", format(np.std(analysis['control'][key]), "3f"))
    print("SHAPIRO:", format(sh.pvalue, "3f"))
    print("TEST:", format(res.pvalue, "3f"))
    print()

survey = [4, 7, 5, 5, 5, 5, 6, 2, 5, 5, 6, 5, 7, 6, 5, 6, 5, 7, 3, 7, 3, 4, 6, 4, 7, 5, 5, 5, 4, 5, 5, 4, 5, 6, 4, 4]
print(stats.linregress(analysis['control']['generate_count'] + analysis['treatment']['generate_count'], survey))