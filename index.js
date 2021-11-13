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

app.use(cors());

const sendNotiAll = (title, message, res) => {
    const options = {
        body : message,
        icon : '/img/icons/ara-pwa-192.png',
        dir : 'ltr',
        lang : 'ko-KR',
        vibrate : [100, 50, 200],
        badge : '/img/icons/ara-pwa-192.png',
        tag : 'confirm-notificaction',
        renotify : true,
        actions : [
          { action : 'confirm', title : '확인'},
          { action : 'cancel', title : '취소'},
        ]
    };
    console.log(`-------------------------------------------`);
    let payload = {};
    payload.title = title;
    payload.options = options;
    console.log(payload)

    for(const subs of temp_subs){
        if (subs && subs.endpoint){
            webpush.sendNotification(subs, JSON.stringify(payload))
            .then( (response) => {
                console.log('sent notification');
            }).catch( (err) => {
                console.error(`notification error : ${err}`);
            });
        }
    }
    res.sendStats(201);
}

const vapid = webpush.generateVAPIDKeys();
webpush.setVapidDetails('mailto:triangle@sparcs.org', vapid.publicKey, vapid.privateKey);

app.get('/api/pwa', (req, res) => {
        console.log("pwa")
        res.send("This is a webpush server");
});

// 1. service-worker의 pushManager가 Registration을 하기 위한  키를 받아오는 GET
app.get('/api/pwa/key', (req, res) => {
    console.log(`publick key sent: ${vapid.publicKey}`);
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
app.get('/api/pwa/notify', (req, res) => {
    const title = req.query.title
    const message = req.query.message

    sendNotiAll(title, message, res)
});
    
app.get('/api/pwa/writepost', (req, res) => {
    let id = req.query.borad_id
    let title = req.query.title

    console.log(id + " "+ title)
    sendNotiAll(`새로운 글이 올라왔어요`, title, res)
})

app.listen(port, () => {
    console.log(`server is listening at localhost`);
});
    