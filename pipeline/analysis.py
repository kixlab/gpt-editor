import json
from datetime import datetime
from os.path import exists
import scipy.stats as stats

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

for i, p in enumerate(participants):
    tasks = ['a', 'b']
    isTreatment = p['isTreatment'] == 1
    temp = {
        "participant": i+1, "isTreatment": isTreatment, 
        "generate_count": [], "input_count": [], "property_count": [], 
        "input_count_nr": [], "property_count_nr": []
    }

    if 'Heemoon' in p['name'] or 'elias' in p['name']:
        continue
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
        
        temp['generate_count'].append(generate_count)
        temp['input_count'].append(input_count)
        temp['property_count'].append(property_count)
        temp['input_count_nr'].append(input_count_nr)
        temp['property_count_nr'].append(property_count_nr)

    results.append(temp)

with open('./data/results.json', 'w') as f:
    json.dump(results, f)

def parseResultsList(results, key, isTreatment):
    #return list(map(lambda y: (y[0] + y[1])/2, [x[key] for x in results if x['isTreatment'] == isTreatment]))
    return sum([x[key] for x in results if x['isTreatment'] == isTreatment], [])

# NR = No Repetitions

analysis = {
    "treatment": {
        "num_participants": len([x for x in results if x['isTreatment']]),
        "generate_count": parseResultsList(results, 'generate_count', True),
        "input_count": parseResultsList(results, 'input_count', True),
        "property_count": parseResultsList(results, 'property_count', True),
        "input_count_nr": parseResultsList(results, 'input_count_nr', True),
        "property_count_nr": parseResultsList(results, 'property_count_nr', True)
    },
    "control": {
        "num_participants": len([x for x in results if not x['isTreatment']]),
        "generate_count": parseResultsList(results, 'generate_count', False),
        "input_count": parseResultsList(results, 'input_count', False),
        "property_count": parseResultsList(results, 'property_count', False),
        "input_count_nr": parseResultsList(results, 'input_count_nr', False),
        "property_count_nr": parseResultsList(results, 'property_count_nr', False)
    }
}

for key in analysis:
    averages = {
        "generate_count": sum(analysis[key]['generate_count']) / len(analysis[key]['generate_count']),
        "input_count": sum(analysis[key]['input_count']) / len(analysis[key]['input_count']),
        "property_count": sum(analysis[key]['property_count']) / len(analysis[key]['property_count']),
        "input_count_nr": sum(analysis[key]['input_count_nr']) / len(analysis[key]['input_count_nr']),
        "property_count_nr": sum(analysis[key]['property_count_nr']) / len(analysis[key]['property_count_nr']),
    }

    print(f'{key.upper()}: {averages}')

for key in analysis['treatment']:
    if key == 'num_participants':
        continue
    res = stats.ttest_ind(analysis['treatment'][key], analysis['control'][key])
    print(f'{key.upper()}: {res}')