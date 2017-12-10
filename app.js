'use strict';
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const through2 = require('through2')
const {nyTimes} = require('./keys')

const app = express()

app.set('case sensitive routing', true)
app.use(bodyParser.json())
// [END setup] viewed/sections.json


const sections = through2({objectMode: true}, (chunk, enc, callback) => {
    const {results} = JSON.parse(chunk.toString())
    const sectionNames = results.map(section => section.name)
    sections.push(JSON.stringify(sectionNames))
    callback()
});

app.get('/sections', (req, res) => {
    const reqURL = `http://api.nytimes.com/svc/mostpopular/v2/viewed/sections.json?api-key=${nyTimes}`
    request.get(reqURL)
        .pipe(sections)
        .pipe(res)
});

app.get('/popular/:section/:since', (req, res) => {
    const reqURL = `http://api.nytimes.com/svc/mostpopular/v2/mostshared/${req.params.section}/${req.params.since}.json?api-key=${nyTimes}`
    request.get(reqURL).pipe(res);
});

if (module === require.main) {
    const PORT = process.env.PORT || 8080
    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`)
        console.log('Press Ctrl+C to quit.')
    });
}

module.exports = app