//a node.js middleware for handling JSON, Raw, Text and URL encoded form data
let bodyParser = require('body-parser');
let express = require('express');
let mysql = require('mysql');

const app = express();
const port = 3000;

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
//handle the post request

app.post('/', function (req, res, next) {
  //add log.
  
  //console.log(req.body.queryResult.intent.displayName);
  switch(req.body.queryResult.intent.displayName){
    case 'starter':
      console.log('starter called');
      break;

    case 'getUser':
      console.log('getUser called');

      db.connect(function(err){  
        if(err){ console.log(err); }
        console.log('Dabatase connected');
        
        db.query("SELECT * FROM users WHERE UniKey = '" + req.body.queryResult.parameters.unikey + "'"
        , function (err, result){
          if(err) { throw err; console.log(err);};
          name = result[0].Name;
          res.send(createNameRespond(name));
          });
      });
      break;
    default:
      // code block
  }



  //whenever the server receive a post, store the user input to 'Log' in the database
    // console.log("----------request --------");
    // console.log(req.body);
    // console.log("----------request --------");
    
    // db.connect(function(err){
    //   if(err){ console.log(err); }
    //   console.log('Dabatase connected');  
      
    //   db.query("INSERT INTO Courses (CourseCode, CourseName, UniKey) " +
    //   "VALUES ('COMP5703', 'Capstone Project', 'admin');", function (err, result){
    //    if(err) { throw err; console.log(err);};  
    //    });

    //    db.query("INSERT INTO Logs (CourseCode, LogDate, LogDescription) " +
    //    "VALUES ('COMP5703', NOW(), " + "'" + req.body.queryResult.queryText + "'" + ");", function (err, result){
    //     if(err) { throw err; console.log(err);};  
   
    //     });
      
    // });
});
 
function createNameRespond(name) {
  let respond = {
    "fulfillmentText": "This is a text response",
    "fulfillmentMessages": [
      {
        "text": {
            "text":[
                "Hello " + name + ", what have you done today?"
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

