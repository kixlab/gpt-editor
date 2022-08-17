from flask import Flask, render_template
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
    app = Flask(__name__, static_folder='../build/static', template_folder='../build')

    CORS(app)

    @app.route('/')
    def index_redir():
        # Reached if the user hits example.com/ instead of example.com/index.html
        return render_template('index.html')

    app.register_blueprint(create_api(SST(), Sentiment(), Emotion()), url_prefix='/')

    app.run(host='76.28.247.222', port=5000)

if __name__ == '__main__':
    start()