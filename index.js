// OpenRelay V1 | NONFEDERATED
// Written by Brenden2008
// Hack the planet!
const express = require('express')
const bodyParser = require('body-parser');
const querystring = require('querystring');
const { Deta } = require('deta');
const crypto = require('crypto')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));

const deta = Deta();
const ORIM = deta.Base('OR_INCOMINGMESSAGES');
const ORRC = deta.Base('OR_REGISTEREDCLIENTS');

app.get('/', (req, res) => res.send('OpenRelay V1 | NONFEDERATED'))

app.post('/postData', async (req, res) => {
    if(await ORRC.get(req.body.deliverTo) != null){
        var insertedMessage = await ORIM.put({ deliverTo: req.body.deliverTo, data: req.body.data }, null, {
            expireIn: 3600
          });
        res.status(201).json(insertedMessage);
    } else {
        res.status(404).json({err: "CLIENT_NOT_FOUND"});
    }
})

app.get('/acceptanceStatus', async (req, res) => {
    const { id } = req.query;
    if(await ORIM.get(id) != null){
        var acceptStatus = await ORIM.get(id)
        res.status(201).json(acceptStatus.accepted);
    } else {
        res.status(404).json({err: "MESSAGE_NOT_FOUND"});
    }
})

app.get('/getData', async (req, res) => {
    const { username, password } = req.query;
    var user = await ORRC.get(username);
    console.log(JSON.stringify(user))
    if(user.password == password){
        const { items: messages } = await ORIM.fetch({"deliverTo": username});
        res.status(201).json(messages);
    } else {
        res.status(404).json({err: "CLIENT_NOT_FOUND_OR_PASSWORD_INCORRECT"});
    }
})

app.get('/deleteData', async (req, res) => {
    const { username, password, id } = req.query;
    var user = await ORRC.get(username);
    console.log(JSON.stringify(user))
    if(user.password == password){
        const message = await ORIM.get(id);
        if(message.deliverTo == user.username){
            await ORIM.delete(id)
            res.status(201).json({success: true});
        } else {
            res.status(500).json({err: "NO_OWNERSHIP_OF_MESSAGE"});
        }
    } else {
        res.status(404).json({err: "CLIENT_NOT_FOUND_OR_PASSWORD_INCORRECT"});
    }
})

app.get('/acceptData', async (req, res) => {
    const { username, password, id } = req.query;
    var user = await ORRC.get(username);
    console.log(JSON.stringify(user))
    if(user.password == password){
        const message = await ORIM.get(id);
        if(message.deliverTo == user.username){
            const acceptStatus = await ORIM.update({accepted: true}, id);
            res.status(201).json(await ORIM.get(id));
        } else {
            res.status(500).json({err: "NO_OWNERSHIP_OF_MESSAGE"});
        }
    } else {
        res.status(404).json({err: "CLIENT_NOT_FOUND_OR_PASSWORD_INCORRECT"});
    }
})

app.get('/declineData', async (req, res) => {
    const { username, password, id } = req.query;
    var user = await ORRC.get(username);
    console.log(JSON.stringify(user))
    if(user.password == password){
        const message = await ORIM.get(id);
        if(message.deliverTo == user.username){
            const acceptStatus = await ORIM.update({accepted: false}, id);
            res.status(201).json(await ORIM.get(id));
        } else {
            res.status(500).json({err: "NO_OWNERSHIP_OF_MESSAGE"});
        }
    } else {
        res.status(404).json({err: "CLIENT_NOT_FOUND_OR_PASSWORD_INCORRECT"});
    }
})

app.get('/registerUser', async (req, res) => {
    const username = crypto.randomUUID({disableEntropyCache : true});
    try {
        const user = await ORRC.insert({"username": username, password: crypto.randomUUID({disableEntropyCache : true})}, username)
        res.status(201).json(user);
    } catch {
        res.status(500).json({err: "DATABASE_ERROR"});
    }
})

// export 'app'
module.exports = app