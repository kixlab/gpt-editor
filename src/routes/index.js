const express = require("express");
const axios = require("axios");

const router = express.Router();

const config = require('../config');
const e = require("express");

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + config.key
}

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

router.post("/generate", (req, res) => {
    console.log(req.body);

    if(req.body.count == 0) {
        var data = {
            prompt: req.body.text,
            max_tokens: 8,
            temperature: 0.7,
            n: 3,
        };

        axios.post('https://api.openai.com/v1/engines/davinci/completions', data, {
            headers: headers
        })
        .then((response) => {
            console.log(response.data);
            for(var i = 0; i < response.data.choices.length; i++) {
                var text = response.data.choices[i].text;
                var cropIdx = text[0] === " " ? 1 : 0;
                cropIdx = text.indexOf(" ", cropIdx);
                response.data.choices[i].text = text.substring(0, cropIdx);
            }
            res.send(response.data.choices);
        })
        .catch((error) => {
            console.log(error);
        });
    } else {
        var data = {
            prompt: req.body.text,
            max_tokens: 40 * req.body.count,
            temperature: 0.7,
            n: 3
        };

        axios.post('https://api.openai.com/v1/engines/davinci/completions', data, {
            headers: headers
        })
        .then((response) => {
            console.log(response.data);
            for(var i = 0; i < response.data.choices.length; i++) {
                var text = response.data.choices[i].text;
                var cropIdx = 0;
                for(var j = 0; j < req.body.count; j++) {
                    var endIdx = findSentenceEnding(text, cropIdx);
                    cropIdx = endIdx + 1;
                }
                response.data.choices[i].text = text.substring(0, cropIdx);
            }
            res.send(response.data.choices);
        })
        .catch((error) => {
            console.log(error);
        });
    }
})

module.exports = router;