var request = require('request');
var ratingTemplate = require('./rating.json');

var costsInsurance = require('./apl_costsInsurance.json')
var costsInsuranceData = require('./apl_costsInsuranceData.json')
var coverInsurance = require('./apl_coverInsurance.json')
var coverInsuranceData = require('./apl_coverInsuranceData.json')
var deductibleInsurance = require('./apl_deductibleInsurance.json')
var deductibleInsuranceData = require('./apl_deductibleInsuranceData.json')
var requiredInsurance = require('./apl_requiredInsurance.json')
var requiredInsuranceData = require('./apl_requiredInsuranceData.json')
var typesInsurance = require('./apl_typesInsurance.json')
var typesInsuranceData = require('./apl_typesInsuranceData.json')

// touch events for display cards
app.displayElementSelected(function (request, response) {
	// The request object selectedElementToken will be populated with the token that was registered
	// the element in the display directive. To get the token associated with the directive itself,
	// it is populated on the request.context.Display.token property.
	// handleRequestForTouchEvent(request.selectedElementToken);
	request.getRouter().intent("Authenticate");
	return false;
});

app.intent("Authenticate", 

function(request, response) {
  response.card({
    type: "Standard",
    title: "Authenticating", 
    text: "Please wait till while I authenticate you",
    image: {
      smallImageUrl: "https://www.identrust.com/sites/default/files/inline-images/secure-authentication%20%281%29_0.png", 
      largeImageUrl: "https://www.identrust.com/sites/default/files/inline-images/secure-authentication%20%281%29_0.png"
    }
  });
  console.log(request.slot('OTP'));
  if(request.slot('OTP') == 1234){
    request.getRouter().intent("passAuthentication");
  }
  else{
    request.getRouter().intent("failAuthentication");
  }
});

app.intent("searchTerm",
  function(req, res) {
    var term = req.slot("term");
    const url = `https://dictionaryapi.com/api/v3/references/medical/json/${term}?key=0d14a18b-9926-46b8-ba37-23f03dbb9102`;
    request.get(url, (error, response, body) => {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body);

        response.say(`${body[0].shortDef[0]}`);
    })
  }
);

app.intent("passAuthentication", 
function(req, res) {
  res.say("Thanks for authentication. Please wait while I redirect you").shouldEndSession(false);
});

app.intent("failAuthentication", 
function(req, res) {
  res.card({
    type: "Simple",
    title: "Authentication Failed ", 
    text: "Just say \"Alexa, authenticate \" "
  });
});

app.intent('startSurvey',
  function(req, res) {
    res.say("You are now starting a survey")

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
    res.directive(dialogDirective).shouldEndSession(false);

    
  })

app.intent('Reason', 
  function(req, res) {

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
    res.directive(dialogDirective).shouldEndSession(false);
  })

app.intent('additionalInfo', 
  function(req, res) {

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
    res.directive(dialogDirective).shouldEndSession(false);
  })

app.intent("Feeling",
	function (req, res) {
		if (req.type !== "Alexa.Presentation.APL.UserEvent") {
			res.say('On a scale of one to five how did we perform?').shouldEndSession(false);
		}
		var customDirective = ratingTemplate;
		res.directive(customDirective).shouldEndSession(false);
		return false;

	});

  app.on("AlexaSkillEvent.SkillPermissionAccepted",
    function(req, res, request_json) { 
      console.log("AWS Permission " + req.context.System.apiAccessToken);

      var session = req.getSession();
      session.set("reminderAcessToken", req.context.System.apiAccessToken);
  });

  app.intent("setReminder",
  function(req, res){
    res.card({
      type: "AskForPermissionsConsent",
      permissions: [ "alexa::alerts:reminders:skill:readwrite" ], // full address
      text: "permissions card"
    });

    res.say("Grant permission using your alexa app").shouldEndSession(false);

    const options = {
      url: 'https://api.amazonalexa.com/v1/alerts/reminders',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.getSession().get("reminderAcessToken")}`,
        'Content-Type': 'application/json'
      }
    };

    request.post(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const info = JSON.parse(body);
        console.log(info);
      }
    });

  });

  function getTokenOptions(){
    // const TokenPostData = getTokenPostData();
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

function getWeatherEvent() {
  let timestamp = new Date();
  let expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getHours() + 24);
  let referenceId = "SampleReferenceId" + new Date().getTime();  // cross reference to records in your existing systems
  const eventJson = {
      "timestamp": timestamp.toISOString(),
      "referenceId": referenceId,
      "expiryTime": expiryTime.toISOString(),
      "event":{
          "name":"AMAZON.WeatherAlert.Activated",
          "payload":{
            "alert":{
              "source": "localizedattribute:source",
              "alertType": "HURRICANE"           
            }
          }
      },
      "localizedattribute":[
          {
              "locale": "en-US",
              "source": "Weather Channel"
          },
          {
              "locale": "en-GB",
              "source": "Britain Met Office"
          },
          {
              "locale": "fr-FR",
              "source": "Canal météo"
          }
      ],
      "relevantAudience":{
          "type":"Multicast",
          "payload":{}
      }
  };
  return eventJson;
}

function getProactiveOptions(token, postLength){
  return {
      hostname: 'api.amazonalexa.com',  // api.eu.amazonalexa.com (Europe) api.fe.amazonalexa.com (Far East)
      port: 443,
      path: '/v1/proactiveEvents/' + (mode && mode === 'prod' ? '' : 'stages/development'),  // mode: global var
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
      }
  };
}
function sendEvent(token) {
  return new Promise(resolve => {
      const ProactivePostData = JSON.stringify(getWeatherEvent());
      const ProactiveOptions = getProactiveOptions(token, ProactivePostData.length);
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
  function(req, res) {
    var token = getToken();
    sendEvent(token);
    response.say("Sent an event")
  })

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

function getPhreesiaOptions(method) {
    return {
        hostname: 'api.amazonalexa.com',  // api.eu.amazonalexa.com (Europe) api.fe.amazonalexa.com (Far East)
        port: 443,
        path: '/v1/proactiveEvents/',  // mode: global var
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
}

function sendPhreesiaEvent(method) {
  return new Promise(resolve => {
      const PhreesiaOptions = getPhreesiaOptions(method);
      const req = https.request(PhreesiaOptions, (res) => {
          res.setEncoding('utf8');
          if ([200, 202].includes(res.statusCode)) {
               console.log('successfully sent event');
          } else {
              console.log(`Error https response: ${res.statusCode}`);
              if ([403].includes(res.statusCode)) {
                  resolve(`error ${res.statusCode}`);
              }
          }
          let returnData;
          res.on('data', (chunk) => { returnData += chunk; });
          res.on('end', () => {
              resolve("sent event");
          });
      });
      req.write(ProactivePostData);
      req.end();
  });
}

function postSurvey(symptom, duration, notes, concernLevel) {
  return request_promise({
    "method":"POST", 
    "uri": `https://coreservicetemplate120190507093532.azurewebsites.net/api/assistant/survey`,
    "json": true,
    "body": {
      "symptom": sympton,
      "duration": duration,
      "notes": notes,
      "concernLevel": concernLevel
    }
  });
}

app.intent('getAppointment', 
  function(req, res) {
    var obj =  await getAppointment(req.slot("getID")).then(function(result){
      return JSON.stringify(result)
    });
    console.log(obj);
    if(obj.AppointmentStatus !== "INCOMPLETE")
      res.say((obj.AppointmentStatus)).shouldEndSession(false);
    else
      res.say(obj).shouldEndSession(false);
    res.card("Appointment", obj);
  })