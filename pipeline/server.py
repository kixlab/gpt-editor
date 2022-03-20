from flask import Flask
from flask_cors import CORS
from app.api import create_api
from transformers import AutoModel, AutoTokenizer

# Import our models. The package will take care of downloading the models automatically
tokenizer = AutoTokenizer.from_pretrained("princeton-nlp/sup-simcse-bert-base-uncased")
model = AutoModel.from_pretrained("princeton-nlp/sup-simcse-bert-base-uncased")

def start():
    app = Flask("app")

    CORS(app)

    app.register_blueprint(create_api(model, tokenizer), url_prefix='/')

    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    start()