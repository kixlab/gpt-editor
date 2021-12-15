const express = require("express");
const axios = require("axios");

const router = express.Router();

const config = require('../config');

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + config.key
}

router.post("/generate", (req, res) => {
    console.log(req.body);

    var data = {
        prompt: req.body.text,
        max_tokens: 64,
        temperature: 0.7,
        n: 3,
        stop: ['.', '!', '?']
    };

    axios.post('https://api.openai.com/v1/engines/davinci/completions', data, {
        headers: headers
    })
    .then((response) => {
        console.log(response.data);
        res.send(response.data.choices);
    })
    .catch((error) => {
        console.log(error);
    });
})

module.exports = router;