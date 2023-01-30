## Client-side

Instructions to setup the front-end.

Install all the needed packages through:

### `npm install`

Build the front-end by running:

### `npm run build`

## Server-side

Create conda environment with the required packages by running:

### `conda env create -f environment.yml`

Activate the environment by running:

### `conda activate genwidget`

Then, set the environment variable with the OpenAI API key by running the following where `YOUR_KEY_HERE` is replaced by your key:

### `export OPEN_API_KEY="YOUR_KEY_HERE"`

Finally, in the directory `/pipeline`, run the following to start the server:

### `python server.py`

## Acessing the Prototype

In your browser, use the following address to access the prototype:

#### `https://localhost:8080/?u=p1-test`
