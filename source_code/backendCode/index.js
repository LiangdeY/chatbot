//a node.js middleware for handling JSON, Raw, Text and URL encoded form data
let bodyParser = require('body-parser');
let express = require('express');
let mysql = require('mysql');

const app = express();
const port = 4000;

//testing connection to front-end
app.get("/testFrontEnd", (req, res) => res.send("Hello Frontend"));


//create db
app.get('/createdb', (req, res) => {
  let sql = 'CREATE DATABASE chatbotDB';
  db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(res);
    res.send('database created');
  })
});
//create connection
let db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'chatbotDB'
});
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//###########################################################################################################
//--------handling wesite calls-------------
app.post('/login', function(req, res) {
  //get data from the front end input
  let credential = req.body;

  //if the password match, return the user
  db.connect(function(err){  
    db.query("SELECT * FROM users WHERE UniKey = '" + credential.unikey + "'"
    , function (err, result){
      try{     

        if(credential.password == result[0].Password){
          let user = result[0] ;
          res.set('Content-Type', 'application/json');
          res.send({
              user,
              isSuccess: true
          });
        }else{
          res.set('Content-Type', 'application/json');
          res.send({
              isSuccess: false
          });
        }
      }
      catch(err) {
        console.log(err);
        res.set('Content-Type', 'application/json');
        res.send({
            isSuccess: false
        });
      }
    });
  });
});

app.post('/studentLogs', function(req, res) {
  //get data from the front end input
  let key = req.body.unikey;

  //if the password match, return the user
  db.connect(function(err){  
    db.query("SELECT * FROM logs WHERE UniKey = '" + key + "'"
    , function (err, result){
      try{     
          let logs = result;
          res.set('Content-Type', 'application/json');
          res.send({
            logs,
            isSuccess: true
          });   
      }
      catch(err) {
        console.log(err);
        res.set('Content-Type', 'application/json');
        res.send({ isSuccess: false });
      }
    });
  });
});

app.post('/teachingStaffLogs', function(req, res) {
  //get data from the front end input
  let courseCode = req.body.courseCode;

  //if the password match, return the user
  db.connect(function(err){  
    db.query("SELECT * FROM logs WHERE CourseCode = '" + courseCode + "'"
    , function (err, result){
      try{     
          let logs = result;
          res.set('Content-Type', 'application/json');
          res.send({
            logs,
            isSuccess: true
          });   
      }
      catch(err) {
        console.log(err);
        res.set('Content-Type', 'application/json');
        res.send({ isSuccess: false });
      }
    });
  });
});

//###########################################################################################################
//--------Handling dialogflow calls-------------
app.post('/', function (req, res, next) {
  var intentName = req.body.queryResult.intent.displayName;
  console.log(intentName);

  switch(intentName){
    case 'starter':
      console.log('starter called');
      break;

    case 'getUser':
      console.log('getUser called');

      var unikey = req.body.queryResult.parameters.unikey;
      db.connect(function(err){  
          db.query("SELECT * FROM users WHERE UniKey = '" + unikey + "'"
          , function (err, result){
            try{    
              name = result[0].Name;
              res.send(nameRespond(name, result[0].UniKey, req.body.session));  
            }catch(err) {
              console.log(err);
              res.send(simpleTextRespond("Cannot find unikey:" + unikey + ", would you like to try again?"));  
            }
          });
      });

      break;

    case 'logProductive':
      console.log('logProductive');
      findUserAndLog(req, 0);
      //respond is defiend on the dialog console.
      break;

    case 'logProductive_hasMore':
      console.log('logProductive_hasMore');
      findUserAndLog(req, 0);
      //respond is defiend on the dialog console.
      break;
   
    case 'logUnproductive':
      //return the unfinished tasks, and mark them as finished
      console.log('logUnproductive');
      let currentUnikey = getCurrentUnikey(req);
      db.connect(function(err){  

        db.query("SELECT * FROM tasks WHERE UniKey = '" + currentUnikey + "' AND IsCompleted = " + 0
        , function (err, result){
          try{    
            console.log(result[0]);
            let url = result[0].Url;
            let id = result[0].TaskID;
             console.log(id);
            db.query("UPDATE tasks SET IsCompleted = 1 WHERE UniKey = '" + currentUnikey + "' AND TaskID = " + id
            , function (err, resu){
                console.log(err);          
            });
            res.send(simpleTextRespond("This might help: " + url));
          }catch(err) {
            console.log(err);
            res.send(simpleTextRespond("You have finished all the tasks, you can send the teaching staff questions by starting with 'question:'"));  
          }
        });

    });
      break;
    
    case 'askQuestion':
      console.log('askQuestion called');
      findUserAndLog(req, 1);
      break;
    

    default:
      console.log('no match intent found');
  }

});

function getCurrentUnikey(req){
  let i = 0 ;
  let currentUserUnikey ='';
  while (i <req.body.queryResult.outputContexts.length){
    try{
      if(currentUserUnikey == undefined || currentUserUnikey == ''){
        currentUserUnikey = req.body.queryResult.outputContexts[i].parameters["currentUserUnikey"];
      }
    } catch(e){ console.log(e); }
    i++;
  }
  if(currentUserUnikey == undefined){
    console.log("currentUserUnikey is undifined");
    return null;
  }
  else{
    return currentUserUnikey;
  }
}

function findUserAndLog(req, isQuestion){
  let i = 0 ;
  let currentUserUnikey ='';
  while (i <req.body.queryResult.outputContexts.length){
    try{
      if(currentUserUnikey == undefined || currentUserUnikey == ''){
        currentUserUnikey = req.body.queryResult.outputContexts[i].parameters["currentUserUnikey"];
      }
    } catch(e){ console.log(e); }
    i++;
  }
  if(currentUserUnikey == undefined){
    console.log("currentUserUnikey is undifined");
    res.send(simpleTextRespond("Connection time out, please re-enter your Unikey"));  
  }
  else{
    logData(req.body.queryResult.queryText, currentUserUnikey, isQuestion);
  }
}

function logData(text, key, isQuestion){
  db.connect(function(err){
    try{
      db.query("INSERT INTO Logs (UniKey, CourseCode, LogDate, LogDescription, IsQuestion) " +
      "VALUES (" + "'" + key + "'" +", " + "'COMP5703', NOW(), " + "'" + text + "'" + ", " + isQuestion + ");"
      );
      console.log("query success");
    }catch(err){
      console.log(err);
    }
  });
}
 
function nameRespond(name, key, session) {
  console.log("name=" + name + " key=" + key + " session=" + session);

  let respond = {
    "fulfillmentText": "NameRespond_text",
    "fulfillmentMessages": [
      {
        "text": {
            "text":[
                "Hello " + name + ", what have you done today?"
                + " (tips: you can start with 'question: ' to send a query to the teaching staff)" 
            ]
        }         
      }
    ],
    "outputContexts":[  
      {  
        "name":session + "/contexts/currentUserUnikey",
        "lifespanCount":20,
        "parameters":{  
          "currentUserUnikey":key
        }
      }
    ]
  }
  return respond;
}
function simpleTextRespond(text) {
  let respond = {
    "fulfillmentText": "NameRespond_text",
    "fulfillmentMessages": [
      {
        "text": {
            "text":[
                text
            ]
        }         
      }
    ]
  }
  return respond;
}
function createTextRespond(name, email) {
    let respond = {
        "fulfillmentText": "This is a text response",
        "fulfillmentMessages": [
          {
            "text": {
                "text":[
                    "Your name is " + name + " and your email is " + email
                ]
            }         
          }
        ],
        "source": "example.com",
        "payload": {
          "google": {
            "expectUserResponse": true,
            "richResponse": {
              "items": [
                {
                  "simpleResponse": {
                    "textToSpeech": "this is a simple response"
                  }
                }
              ]
            }
          },
        },
        "outputContexts": [
          {
            "name": "projects/project-id/agent/sessions/session-id/contexts/context-name",
            "lifespanCount": 5,
            "parameters": {
              "param-name": "param-value"
            }
          }
        ],
        "followupEventInput": {
          "name": "event name",
          "languageCode": "en-US",
          "parameters": {
            "param-name": "param-value"
          }
        }
      }
      return respond;
}
//###########################################################################################################