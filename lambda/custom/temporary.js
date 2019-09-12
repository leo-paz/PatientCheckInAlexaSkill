const alexa = require('./node_modules/alexa-app');
const app = new alexa.app('phreesia');
var launchJson = require('./launchDirective');
var request = require('./node_modules/request');
var ratingTemplate = require('./rating.json');
var launchJson = require('./launchRequest.json');
var dataSource = require('./launchDataSource.json');
var authdataSource = require('./authenticationDataSource.json');
var authJson = require('./authenticationRequest.json');
var https = require('https');
var request_promise = require('./node_modules/request-promise');
var costsInsurance = require('./apl_costsInsurance.json');
var costsInsuranceData = require('./apl_costsInsuranceData.json');
var coverInsurance = require('./apl_coverInsurance.json');
var coverInsuranceData = require('./apl_coverInsuranceData.json');
var deductibleInsurance = require('./apl_deductibleInsurance.json');
var deductibleInsuranceData = require('./apl_deductibleInsuranceData.json');
var requiredInsurance = require('./apl_requiredInsurance.json');
var requiredInsuranceData = require('./apl_requiredInsuranceData.json');
var typesInsurance = require('./apl_typesInsurance.json');
var typesInsuranceData = require('./apl_typesInsuranceData.json');
var treatmentJson = require('./treatmentPage.json');
var treatmentData = require('./treatmentData.json');

app.intent("treatment",
 function(req, res){
  var customLaunchDirective = {
    "type": "Alexa.Presentation.APL.RenderDocument",
    "token": "anydocument3",
    "document": treatmentJson,
    "datasources": treatmentData
  };
  res.say("What would you like to know?").shouldEndSession(false);
  res.directive(customLaunchDirective).shouldEndSession(false);
});


function getDef(term) {
  return request_promise({
    "method":"GET", 
    "uri": `https://dictionaryapi.com/api/v3/references/medical/json/${term}?key=0d14a18b-9926-46b8-ba37-23f03dbb9102`,
    "json": true})}

app.intent("searchTerm", 
     async function(req, responseAlexa){
     var obj =  await getDef(req.slot("term")).then(function(result){
     return JSON.stringify(result[0].shortdef[0])  
    });
    
    responseAlexa.say(obj).shouldEndSession(false);
  }
)

// error handling
app.post = function(request, response, type, exception) {
  if (exception) {
    // always turn an exception into a successful response
    return response.clear().say("An error occured: " + exception).send();
  }
  else {
    return response.send();
  }
};
app.on('Alexa.Presentation.APL.UserEvent', (request, response, request_json) => {
	console.log(request_json);
	if(request_json.request.arguments[0] == "Rate my Experience"){
		request.getRouter().intent("NonVoiceRating");}
	else if(request_json.request.arguments[0] == "Get my Doctor Info")	{
    request.getRouter().intent("NonVoiceDocInfo");}
  else if(request_json.request.arguments[0] == "Billing Info")	{
      request.getRouter().intent("treatment");
	}
});
 
app.intent("homePage", function(req, res){
    var customLaunchDirective = {
    "type": "Alexa.Presentation.APL.RenderDocument",
    "token": "anydocument2",
    "document": launchJson,
    "datasources": dataSource
    };
    res.directive(customLaunchDirective).shouldEndSession(false);
});
  
app.intent('startSurvey',
  function(request, response) {
    response.say("You are now starting a survey")

    var dialogDirective = {
      "type": "Dialog.Delegate",
      "updatedIntent": {
        "name": "Reason",
        "confirmationStatus": "NONE",
        "slots": {
          "reasoning": {
            "name": "reasoning",
            "resolutions": {},
            "confirmationStatus": "NONE"
          },
          
        }
      }
    }
    response.directive(dialogDirective).shouldEndSession(false);

    
  });

app.intent('Reason', 
  function(request, response) {

    var dialogDirective = {
      "type": "Dialog.Delegate",
      "updatedIntent": {
        "name": "additionalInfo",
        "confirmationStatus": "NONE",
        "slots": {
          "info": {
            "name": "info",
            "resolutions": {},
            "confirmationStatus": "NONE"
          }
        }
      }
    }
    response.directive(dialogDirective).shouldEndSession(false);
  });

app.intent('additionalInfo', 
  function(request, response) {

    var dialogDirective = {
      "type": "Dialog.Delegate",
      "updatedIntent": {
        "name": "Feeling",
        "confirmationStatus": "NONE",
        "slots": {
          "number": {
            "name": "number",
            "resolutions": {},
            "confirmationStatus": "NONE"
          }
        }
      }
    }
    response.directive(dialogDirective).shouldEndSession(false);
  });

app.intent("Feeling",
	function (request, response) {
		if (request.type !== "Alexa.Presentation.APL.UserEvent") {
			response.say('On a scale of one to five how did we perform?').shouldEndSession(false);
		}
		var customDirective = ratingTemplate;
		response.directive(customDirective).shouldEndSession(false);
		return false;

  });
  
  app.intent("setReminder",
  function(req, res){
    
    res.card({
      type: "AskForPermissionsConsent",
      permissions: [ "alexa::alerts:reminders:skill:readwrite" ], // full address
      text: "permissions card"
    });

    res.say("Grant permission using your alexa app").shouldEndSession(false);
    request.post( {
      url: 'https://api.amazonalexa.com/v1/alerts/reminders',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + req.context.System.apiAccessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "requestTime" : "2019-04-29T21:04:00.672",
        "trigger": {
             "type" : "SCHEDULED_RELATIVE",
             "offsetInSeconds" : "60"
        },
        "alertInfo": {
             "spokenInfo": {
                 "content": [{
                     "locale": "en-US", 
                     "text": "Take your Phreesia survey"
                 }]
             }
         },
         "pushNotification" : {                            
              "status" : "ENABLED"         
         }
     })
    });
    /*,  function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const info = JSON.parse(body);
        console.log(info);
      }
      else {
        console.log(response.statusCode);
      }
    });
/*
    request.post(uri, JSON.stringify(options), function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const info = JSON.parse(body);
        console.log(info);
      }
      else {
        console.log("Error found: " + response);
      }
    });
*/
  });
  function getTokenOptions(){
    return {
        hostname: 'api.amazon.com',
        port: 443,
        path: '/auth/O2/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }
}

function getTokenPostData() {
    return 'grant_type=client_credentials&client_id=amzn1.application-oa2-client.3e8ba61f21ba40099d9b87daa1b9e5b9' + 
          '&client_secret=61d828b87e3e41ba074a8dbcc1a69fa1331cd5c2c705df9ec584c6c4c284fb4b' + 
          '&scope=alexa::proactive_events';
}

function getToken() {
    return new Promise(resolve => {
        const TokenPostData = getTokenPostData();
        const req = https.request(getTokenOptions(), (res) => {
            res.setEncoding('utf8');
            let returnData = '';
            res.on('data', (chunk) => { returnData += chunk; });
            res.on('end', () => {
                const tokenRequestId = res.headers['x-amzn-requestid'];
                // console.log(`Token requestId: ${tokenRequestId}`);
                resolve(JSON.parse(returnData).access_token);
            });
        });
        req.write(TokenPostData);
        req.end();
    });
}

function getMessageEvent() {
  let timestamp = new Date();
  let expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getHours() + 24);
  let referenceId = "SampleReferenceId" + new Date().getTime();  // cross reference to records in your existing systems
  const eventJson = {
      "timestamp": timestamp.toISOString(),
      "referenceId": referenceId,
      "expiryTime": expiryTime.toISOString(),
      "event": {
        "name": "AMAZON.MessageAlert.Activated",
        "payload": {
          "state": {
            "status": "UNREAD",
            "freshness": "NEW"
          },
          "messageGroup": {
            "creator": {
              "name": "Andy"
            },
            "count": 5,
            "urgency": "URGENT"
          }
        }
      },
      "relevantAudience": {
        "type": "Unicast",
        "payload": {
        "user": "amzn1.ask.account.AEB7SM6KY2KNKW6QJQKVAZUBOFPCD3FBAVSYZ5WWZTLVDC3ZVTNANT4BCBCQR5FDYVJFY2MCJJZ7DAKDGLUNLXCOO2T3T64XHA34N4JRSZF3GMUZTAJHGDWXBLQGPRFGO26VQSNJIYDZGHJCMGKXGNFACTLSIH25YJONZ5MMAWKF6KRA6NGD6QGYBVTFEEURA4RHIGM3WKRDOII"
        }
      }
  };
  return eventJson;
}

function getProactiveOptions(token){
  return {
      hostname: 'api.amazonalexa.com',  // api.eu.amazonalexa.com (Europe) api.fe.amazonalexa.com (Far East)
      port: 443,
      path: '/v1/proactiveEvents/stages/development',  // mode: global var
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
      }
  };
}

app.intent("passAuthentication", 
function(req, res) {
  res.say("Thanks for authentication. Please wait while I redirect you").shouldEndSession(false);
  request.getRouter().intent("homePage");

});

app.intent("failAuthentication", 
function(req, res) {
  res.card({
    type: "Simple",
    title: "Authentication Failed. Please try again ", 
    text: "Just say \"Alexa, authenticate \" "
  });
  res.say("Please try again").shouldEndSession(false);
});

app.intent("goBack", 
function(req, res) {
  var customLaunchDirective = {
    "type": "Alexa.Presentation.APL.RenderDocument",
    "token": "anydocument",
    "document": launchJson,
    "datasources": dataSource
    };
    res.directive(customLaunchDirective).shouldEndSession(false);
});

app.intent("Authenticate", 

function(request, response) {
  response.card({
    type: "Standard",
    title: "Authenticating", 
    text: "Please wait while I authenticate you",
    image: {
      smallImageUrl: "https://www.identrust.com/sites/default/files/inline-images/secure-authentication%20%281%29_0.png", 
      largeImageUrl: "https://www.identrust.com/sites/default/files/inline-images/secure-authentication%20%281%29_0.png"
    }
  });
  console.log(request.slot('OTP'));
  if(request.slot('OTP') == 1234){
    response.say("Thanks for authentication. Please wait while I redirect you").shouldEndSession(false);
    request.getRouter().intent("homePage");
  }
  else{
    request.getRouter().intent("failAuthentication");
  }
});

function sendEvent(token) {
  return new Promise(resolve => {
      const ProactivePostData = JSON.stringify(getMessageEvent());
      const ProactiveOptions = getProactiveOptions(token);
      const req = https.request(ProactiveOptions, (res) => {
          res.setEncoding('utf8');
          if ([200, 202].includes(res.statusCode)) {
               console.log('successfully sent event');
          } else {
              console.log(`Error https response: ${res.statusCode}`);
              console.log(`requestId: ${res.headers['x-amzn-requestid']}`);
              if ([403].includes(res.statusCode)) {
                  resolve(`error ${res.statusCode}`);
              }
          }
          let returnData;
          res.on('data', (chunk) => { returnData += chunk; });
          res.on('end', () => {
              const requestId = res.headers['x-amzn-requestid'];
              resolve("sent event");
          });
      });
      req.write(ProactivePostData);
      req.end();
  });
}
  
app.intent('sendEvent', 
  async function(req, res) {
    console.log("sending event");
    var token = await getToken();
    sendEvent(token);
    //res.say("Sent an event")
  });

  app.on("AlexaSkillEvent.ProactiveSubscriptionChanged", (request, response, request_json) => {
    console.log("AWS User " + request.context.System.user.userId);
  });

  app.intent('insuranceType', 
  function(req, res) {
    var customLaunchDirective = {
      "type": "Alexa.Presentation.APL.RenderDocument",
      "token": "insuranceType",
      "document": typesInsurance,
      "datasources": typesInsuranceData
    };
    res.directive(customLaunchDirective).shouldEndSession(false);
  });

  app.intent('insuranceCosts', 
  function(req, res) {
    var customLaunchDirective = {
      "type": "Alexa.Presentation.APL.RenderDocument",
      "token": "insuranceCosts",
      "document": costsInsurance,
      "datasources": costsInsuranceData
    };
    res.directive(customLaunchDirective).shouldEndSession(false);
  });

  app.intent('insuranceCover', 
  function(req, res) {
    var customLaunchDirective = {
      "type": "Alexa.Presentation.APL.RenderDocument",
      "token": "insuranceCover",
      "document": coverInsurance,
      "datasources": coverInsuranceData
    };
    res.directive(customLaunchDirective).shouldEndSession(false);
  });

  app.intent('insuranceDeductible', 
  function(req, res) {
    var customLaunchDirective = {
      "type": "Alexa.Presentation.APL.RenderDocument",
      "token": "insuranceDeductible",
      "document": deductibleInsurance,
      "datasources": deductibleInsuranceData
    };
    res.directive(customLaunchDirective).shouldEndSession(false);
  });

  app.intent('insuranceRequired', 
  function(req, res) {
    var customLaunchDirective = {
      "type": "Alexa.Presentation.APL.RenderDocument",
      "token": "insuranceRequired",
      "document": requiredInsurance,
      "datasources": requiredInsuranceData
    };
    res.directive(customLaunchDirective).shouldEndSession(false);
  });