'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');
const firebase = require('firebase');


// create LINE SDK client
const client = new line.Client(config);

// firebase setting
var firebaseConfig = {
  apiKey: "AIzaSyDfAcyKxRMKxMQ_g3Ho6Cy4r5-vVUIjLOw",
  authDomain: "checkthestudentname.firebaseapp.com",
  databaseURL: "https://checkthestudentname.firebaseio.com",
  storageBucket: "checkthestudentname.appspot.com"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();



const app = express();

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    // check verify webhook event
    if (event.replyToken === '00000000000000000000000000000000' ||
      event.replyToken === 'ffffffffffffffffffffffffffffffff') {
      return;
    }
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  var strText = String(texts);
  var stringSend = "";
  if (strText == 'ปิดระบบ') {
    database.ref().update({
      'statusBeacon': 'poweredOff'
    })
    stringSend = "ปิดระบบเรียบร้อย"
  } else if (strText == 'ขอใบเช็คชื่อ') {
    stringSend = "line://app/1653365544-Dr01L6Lx"
  }else if (strText == 'ใบเช็คชื่อ') {
    stringSend = "line://app/1653365544-Dr01L6Lx"
  }else if (strText == 'เช็คชื่อ') {
    stringSend = "line://app/1653365544-Dr01L6Lx"
  }else{
    stringSend = "ระบบไม่เข้าใจคำสั่ง กรุณากดที่ปุ่มครับ"
  }
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', 'text': stringSend }))
  );


};

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken) {
  return replyText(replyToken, message.text);
}

function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image');
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video');
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location');
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker');
}

const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});