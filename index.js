const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(bodyParser.json());
const port = 9010;
const cors = require('cors');
const whitelist = ["http://localhost:8080", "https://newara.dev.sparcs.org"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed Origin!"));
    }
  },
};

app.use(cors(corsOptions));


const vapid = webpush.generateVAPIDKeys();
webpush.setVapidDetails('mailto:triangle@sparcs.org', vapid.publicKey, vapid.privateKey);

app.get('/api/pwa', (req, res) => {
        console.log("pwa")
        res.send("This is a webpush server");
});

// 1. service-worker의 pushManager가 Registration을 하기 위한  키를 받아오는 GET
app.get('/api/pwa/key', (req, res) => {
    console.log(`publick key sent: ${vapidKeys.publicKey}`);
    res.send({
        key: vapid.publicKey
    });
})

// 2. 구독 POST
const temp_subs = [];
app.post('/api/pwa/subscribe', (req, res) => {
    temp_subs.push(req.body.subscription);
    console.log(`subscribed : ${JSON.stringify(req.body.subscription)}`);
    res.send('Subscribed');
});

// 3. 등록된 service-worker들에게 푸시를 보내는 POST
app.post('/api/pwa/notify', (req, res) => {
    console.log(`-------------------------------------------`);
    console.log(`notify requested : ${JSON.stringify(req.body)}`);
    let payload = {};
    payload.title = req.body.title;
    payload.message = req.body.message;

    for(const subs of temp_subs){
        webpush.sendNotification(subs, JSON.stringify(payload))
        .then( (response) => {
            console.log('sent notification');
            res.sendStatus(201);
        }).catch( (err) => {
            console.error(`notification error : ${err}`);
            res.sendStatus(500);
        });
    }
});
    
app.listen(port, () => {
    console.log(`server is listening at localhost`);
});
    