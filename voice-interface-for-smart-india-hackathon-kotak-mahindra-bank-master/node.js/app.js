const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const translate = require('@vitalets/google-translate-api');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/google-translate-client-to-dialogflow', (req, res) => {
	const message = req.body;
    let response = '';
    console.log(message.message);
    translate(message.message, {to: 'en'}).then(res => {
        response = res.text
    }).then(resp => {
        return res.json({"text" : response})
    }).catch((error) => {
		console.log("error")
	});
});

app.post('/google-translate-dialogflow-to-client', (req, res) => {
    const message = req.body;
    let response = '';
    translate(message.message, {to: message.lang.substring(0,2)}).then(res => {
        response = res.text
    }).then(resp => {
        return res.json({"text" : response})
    }).catch((error) => {
		console.log("error")
	});
});


app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), () => {
    console.log("The server is running");
});