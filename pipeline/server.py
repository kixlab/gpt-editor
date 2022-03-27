from flask import Flask
from flask_cors import CORS
from app.api import create_api
from transformers import AutoModel, AutoTokenizer, AutoModelForSequenceClassification

# Import our models. The package will take care of downloading the models automatically
class SST:
    model = AutoModel.from_pretrained("princeton-nlp/sup-simcse-bert-base-uncased")
    tokenizer = AutoTokenizer.from_pretrained("princeton-nlp/sup-simcse-bert-base-uncased")

class Sentiment:
    model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
    tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")  

class Emotion:
    model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-emotion")
    tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-emotion") 


def start():
    app = Flask("app")

    CORS(app)

    app.register_blueprint(create_api(SST(), Sentiment(), Emotion()), url_prefix='/')

    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    start()