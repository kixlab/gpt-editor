const axios = require("axios");
const config = require('./config');
const fs = require('fs');

function findSentenceEnding(text, startIdx) {
    var idx = startIdx;
    while(idx < text.length && [".", "?", "!"].indexOf(text[idx]) === -1) {
        idx++;
    }
    if(idx + 1 < text.length && ['"', "'"].indexOf(text[idx + 1]) !== -1) {
        idx++;
    }
    return idx;
}

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + config.key
}

const txt = `She broke open the fortune cookie, but there was a map on the tiny slip of paper. She looked at the map and then quickly unfolded it. "Another piece and I'm still nowhere close," she thought to herself. She thanked the cashier and promptly left the Chinese restaurant, her ordered basket of dumplings untouched.`;

var data = {
    prompt: txt,
    max_tokens: 40,
    temperature: 0.7,
    n: 10
};

axios.post('https://api.openai.com/v1/engines/davinci/completions', data, {
    headers: headers
})
.then((response) => {
    console.log(response.data);
    for(var i = 0; i < response.data.choices.length; i++) {
        var text = response.data.choices[i].text;
        var cropIdx = 0;
        var endIdx = findSentenceEnding(text, cropIdx);
        cropIdx = endIdx + 1;
        response.data.choices[i].text = text.substring(0, cropIdx);
    }
    var sentences = response.data.choices.map(choice => choice.text);
    console.log(sentences);

    let data = JSON.stringify(sentences, null, 2);
    fs.writeFileSync('./test_sentences.json', data);
})
.catch((error) => {
    console.log(error);
});