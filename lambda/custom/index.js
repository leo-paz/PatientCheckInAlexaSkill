const alexa = require('./node_modules/alexa-app');
var Speech = require('./node_modules/ssml-builder');
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
var treatmentDisplay = require('./treatmentListInfo.json')
var insuranceFAQ = require('./InsuranceFAW.json');
var procedureJson = require('./apl_procedureInfo.json');
var procedureData = require('./procedureData.json');
var docInfo = require('./doctorInfo.json');
var docSource = require('./docDataSource.json');
var concernJson = require('./concern.json');
var summary = require('./summary.json');
var appointmentTakeSurvey = require('./apl_appointment.json');
var appointmentReviewSurvey = require('./apl_appointmentSurveyComplete.json');
var aptJson = require('./apl_appointmentList.json');
var aptData = require('./appointInfoList.json');
var aptReviewData = require('./reviewSurvey.json');
var reviewSurveyUpdated = require('./reviewSurveyUpdated.json');
var appointmentDetail = require('./apl_appointmentDetails.json');




// launch page
app.launch(async (req, res) => {
  
  var customLaunchDirective = {
    "type": "Alexa.Presentation.APL.RenderDocument",
    "token": "anydocument",
    "document": authJson,
    "datasources": authdataSource
  };
  res.say("Welcome to phreesia voice assistant. Please authenticate with your one time password to proceed").shouldEndSession(false);
  res.directive(customLaunchDirective).shouldEndSession(false);
  res.reprompt("Just say, Alexa authenticate me");
  console.log("Launch Request");
	return false;
});

app.intent("directAuthentication",
 async function(req, res){
  if(req.slot('password') == 1234 || req.slot('password') == 4321){
    var result = await res.say(ssmlSpeech()).send();
    var sesh = req.getSession();
    var postObj =  await postUser(req.slot('password')).then(function(result){
      return JSON.stringify(result);
    });
    var getObj =  await getUser(req.slot('password')).then(function(result){
      sesh.set("Duration", result.Survey.Duration)
      sesh.set("Reason", result.Survey.Symptom)
      sesh.set("SurveyStatus", result.Survey.SurveyStatus)
      sesh.set("Notes", result.Survey.Notes)
      sesh.set("Concern", result.Survey.Concern)
      sesh.set("Id", result.Appointment.Id)
      sesh.set("AppointmentStatus", result.Appointment.AppointmentStatus)
      sesh.set("AppointmentDetails", result.Appointment.AppointmentDetails)
    });
    
    sesh.set("OTP", req.slot('password'));
    console.log(result);
    req.getRouter().intent("homePage");
  }
  else{
    req.getRouter().intent("failAuthentication");
  }
});
function ssmlSpeech(){
  
  var speech = new Speech()
  .say('Thanks for authentication')

  var speechOutput = speech.ssml(true);
  return speechOutput;
}
app.intent("treatment",
 function(req, res){
 
  res.say("What would you like to know?").shouldEndSession(false);
  var customDirective = treatmentDisplay;
  res.directive(customDirective).shouldEndSession(false);
  res.reprompt("Try something like Alexa, get my procedure info");
  return false;
});

app.intent("goodBye",function(req, res){
  if (request.type !== "Alexa.Presentation.APL.UserEvent") {
    response.say('On a scale of one to five how did we perform?').shouldEndSession(false);
  }
  var customDirective = ratingTemplate;
  res.directive(customDirective).shouldEndSession(false);
  return false;
});


app.intent("vocalProcedure",
 function(req, res){
 // res.say("Here is your procedure information. Just say alexa define to understand any terminology").shouldEndSession(false);
var customDirective =
    {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'procedureVocal',
        version: '1.0',
        document: require('./pager.json'),
        datasources: {
          'pagerTemplateData': {
            'type': 'object',
            'properties': {
              'hintString': 'Go the main screen',
            },
            'transformers': [
              {
                'inputPath': 'hintString',
                'transformer': 'textToHint',
              },
            ],
          },
        },
      }
      customAPLDirective = {
        "type": "Alexa.Presentation.APL.ExecuteCommands",
        "token": "procedureVocal",
        "commands": [
          {
            "type": "Sequential",
            "commands": [
              {
                "type": "Idle",
                "delay": 120000
              }
            ]
          }
        ]
      }
  res.directive(customDirective).shouldEndSession(false);
  res.directive(customAPLDirective).shouldEndSession(false);
  var speech = new Speech()
  .sentence('A stem cell transplant from another person can help treat certain types of cancer in a way other than just replacing stem cells.')
  .sentence('Donated cells can often find and kill cancer cells better than the immune cells of the person who had the cancer ever could.')
  .sentence('This is called the “graft-versus-cancer” or “graft-versus-leukemia” effect.')
  .sentence('It means that certain kinds of transplants actually help fight the cancer cells, rather than simply providing normal blood cells.')

  var speechOutput = speech.ssml(true);
  res.say(speechOutput).shouldEndSession(false);

  return false;
});

app.intent("procedure",
 function(req, res){
  var customDirective =
  {
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'pagerToken',
      version: '1.0',
      document: require('./pager.json'),
      datasources: {
        'pagerTemplateData': {
          'type': 'object',
          'properties': {
            'hintString': 'go to the main screen',
          },
          'transformers': [
            {
              'inputPath': 'hintString',
              'transformer': 'textToHint',
            },
          ],
        },
      },
    }

    customAPLDirective = {
    "type": "Alexa.Presentation.APL.ExecuteCommands",
    "token": "pagerToken",
    "commands": [
      {
        "type": "Parallel",
        "commands": [
          {
            "type": "Idle",
            "delay": 120000
          }
        ]
      }
    ]
  }
  res.directive(customDirective).shouldEndSession(false);
  res.directive(customAPLDirective).shouldEndSession(false);

  return false;
});

function getDef(term) {
  return request_promise({
    "method":"GET", 
    "uri": `https://dictionaryapi.com/api/v3/references/medical/json/${term}?key=0d14a18b-9926-46b8-ba37-23f03dbb9102`,
    "json": true})}

function getAppointment(id) {
  return request_promise({
    "method":"GET", 
    "uri": `https://alexaphreesiaapi.azurewebsites.net/api/assistant/patient/appointment/${id}`,
    "json": true})}

function postAppointment(id) {
  return request_promise({
    "method":"POST", 
    "uri": `https://alexaphreesiaapi.azurewebsites.net/api/assistant/appointment/${id}`,
    "json": true})}

app.intent("searchTerm", 
     async function(req, responseAlexa){
     var obj =  await getDef(req.slot("term")).then(function(result){
     return JSON.stringify(result[0].shortdef[0])  
    });
    
    responseAlexa.say(obj).shouldEndSession(false);
  }
)

app.intent("sampleAppointment", 
  async function(req, res){
      var obj =  await getAppointment(req.slot("getID")).then(function(result){
        return JSON.stringify(result)
      });
    console.log(obj);
    if(obj.AppointmentStatus !== undefined)
      res.say((obj.AppointmentStatus)).shouldEndSession(false);
      else
      res.say(obj).shouldEndSession(false);
    res.card("Appointment", obj);
});

app.intent("postAppointment", 
  async function(req, res){
    var obj =  await postAppointment(req.slot("id")).then(function(result){
      return JSON.stringify(result)
    });
    console.log(obj);
    res.say(obj).shouldEndSession(false);
    res.card("Appointment", obj);
});


// error handling
app.post = function(request, response, type, exception) {
  if (exception) {
    // always turn an exception into a successful response
    return response.clear().say("An error occured: " + exception).send();
  }
  else if (type === "IntentRequest" ){
    console.log(type);
    var sesh = request.getSession();
    sesh.set("PreviousIntent", request.data.request.intent.name);
  }          
  else {
    var sesh = request.getSession();
    sesh.set("PreviousRequest", type);
  }
};
app.on('Alexa.Presentation.APL.UserEvent', (request, response, request_json) => {
	console.log("JSON: " + JSON.stringify(request_json));
	if(request_json.request.arguments[0] == "Rate my Experience"){
		request.getRouter().intent("NonVoiceRating");}
	else if(request_json.request.arguments[0] == "Get my Doctor Info")	{
    request.getRouter().intent("NonVoiceDocInfo");
  }
  else if(request_json.request.arguments[0] == "Treatment Info")	{
      request.getRouter().intent("treatment");
  }
  else if(request_json.request.arguments[0] == "Insurance Info")	{
    request.getRouter().intent("insuranceFAQ");
  }
  else if(request_json.request.arguments[0] == "Billing Info")	{
    request.getRouter().intent("billing");
  }
  else if(request_json.request.arguments[0] == "Know your Doctor")	{
    request.getRouter().intent("DocInfo");
  }
  else if(request_json.request.arguments[0] == "Set Survey Reminder")	{
    
    response.say("To set reminder just say Alexa, activate reminder").shouldEndSession(false);
    request.getRouter().intent("AptNonVoiceNonSurvey");
  }
  else if(request_json.request.arguments[0] == "Take a Survey")	{
    
    response.say("To take a survey just say \"Alexa, take a survey\"").shouldEndSession(false);
    response.reprompt("To go to the main screen just say, Alexa, go to the main screen");
    request.getRouter().intent("AptNonVoiceNonSurvey");
    
  }
  else if(request_json.request.arguments[0] == "Update Survey")	{
    
    response.say("To update your survey just say \"Alexa, update my survey\"").shouldEndSession(false);
    response.reprompt("To go to the main screen just say, Alexa, go to the main screen");
    request.getRouter().intent("AptNonVoiceSurveyTaken");
  }
  else if(request_json.request.arguments[0] == "Review Survey")	{
    
    request.getRouter().intent("reviewSurvey")
  }
  else if(request_json.request.arguments[0] =="Appointment Status"){
    if(request.getSession().get('SurveyStatus') == "Pending"){
      request.getRouter().intent("AptDetailsNonVoiceNonSurvey");
    }
    else {
      request.getRouter().intent("AptDetailsSurveyTaken");
    }
  }
  else if(request_json.request.arguments[0] =="Get Appointment Status"){
    if(request.getSession().get('SurveyStatus') == "Pending"){
      request.getRouter().intent("AptNonVoiceNonSurvey");
    }
    else {
      request.getRouter().intent("AptNonVoiceSurveyTaken");
    }
  }
  else if(request_json.request.arguments[0] == "Take Survey"){
    if(request.getSession().get('SurveyStatus') == "SurveyPending"){
      request.getRouter().intent("AptNonVoiceNonSurvey");
    }
    else {
      request.getRouter().intent("AptNonVoiceSurveyTaken");
    }
  }
  else
    request.getRouter().intent("goHome");

});

app.error = function(exception, request, response) {
  console.error(exception);
  response.say("Something went wrong. Try again").shouldEndSession(false);
  response.reprompt("Just say, Alexa go to the main screen").shouldEndSession(false);
};


app.intent("DocInfo",
function (request, response) {

	var customLaunchDirective = {
		"type": "Alexa.Presentation.APL.RenderDocument",
		"token": "docInfo",
		"document": docInfo,
		"datasources": docSource
  };
  customAPLDirective = {
    "type": "Alexa.Presentation.APL.ExecuteCommands",
    "token": "docInfo",
    "commands": [
      {
        "type": "Parallel",
        "commands": [
          {
            "type": "Idle",
            "delay": 120000
          }
        ]
      }
    ]
  }

	response.say("Here is your doctor's information. To give feedback, just say, Alexa, give feedback to my doctor").shouldEndSession(false);
  response.directive(customLaunchDirective).shouldEndSession(false);
  response.directive(customAPLDirective).shouldEndSession(false);
	return false;
});
app.intent("homePage", function(req, res){
  console.log("AT HOMEPAGE");
    var customLaunchDirective = {
    "type": "Alexa.Presentation.APL.RenderDocument",
    "token": "homeToken",
    "document": launchJson,
    "datasources": dataSource
    };
    //res.directive(customLaunchDirective).shouldEndSession(false);
    customAPLDirective = {
      "type": "Alexa.Presentation.APL.ExecuteCommands",
      "token": "homeToken",
      "commands": [
        {
          "type": "Parallel",
          "commands": [
            {
              "type": "Idle",
              "delay": 1200000
            }
          ]
        }
      ]
    };
    res.directive(customLaunchDirective).shouldEndSession(false);
    res.directive(customAPLDirective).shouldEndSession(false);
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
    response.card("Survey", "You are now starting a survey");
    response.directive(dialogDirective).shouldEndSession(false);  
  });

  app.intent("NonVoiceDocInfo",
  function (request, response) {
  
    var customLaunchDirective = {
      "type": "Alexa.Presentation.APL.RenderDocument",
      "token": "nonvoiceDocInfo",
      "document": docInfo,
      "datasources": docSource
    };
    customAPLDirective = {
      "type": "Alexa.Presentation.APL.ExecuteCommands",
      "token": "nonvoiceDocInfo",
      "commands": [
        {
          "type": "Sequential",
          "commands": [
            {
              "type": "Idle",
              "delay": 120000
            }
          ]
        }
      ]
    }
    response.directive(customLaunchDirective).shouldEndSession(false);
    response.directive(customAPLDirective).shouldEndSession(false);
    return false;
  });

app.intent('Reason', 
  function(request, response) {
    var sesh = request.getSession();
    sesh.set("Reason", request.slot('reasoning'));
    var dialogDirective = {
      "type": "Dialog.Delegate",
      "updatedIntent": {
        "name": "duration",
        "confirmationStatus": "NONE",
        "slots": {
          "length": {
            "name": "length",
            "resolutions": {},
            "confirmationStatus": "NONE"
          }
        }
      }
    }
    response.card("Notes","How long have you been affected by " + request.slot('reasoning') + "?");
    response.directive(dialogDirective).shouldEndSession(false);
  });
  
  app.intent('duration', 
  function(request, response) {
    var sesh = request.getSession();
    sesh.set("Duration", request.slot('length'));
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
    response.card("Notes","Do you have any additional notes");
    response.directive(dialogDirective).shouldEndSession(false);
  }); 

app.intent('additionalInfo', 
  function(request, response) {
    var sesh = request.getSession();
    sesh.set("Notes", request.slot('reasoning'));
    request.getRouter().intent("Feeling");    
    
  });


app.intent("Feeling",
	function (request, response) {
		if (request.type !== "Alexa.Presentation.APL.UserEvent") {
			response.say('What is your level of concern?').shouldEndSession(false);
		}
		var customDirective = concernJson;
		response.directive(customDirective).shouldEndSession(false);
		return false;

  });

  app.intent("summarySurvey",  function(req, res){
      var sesh = req.getSession();
      if(req.getSession().get("SurveyStatus") == "Completed")
        sesh.set("SurveyStatus", "Updated");
      else
        sesh.set("SurveyStatus", "Completed");
      req.getRouter().intent("SummarySurveyScreen");

  });

  app.intent("SummarySurveyScreen", function(req, res){
    var reason = req.getSession().get("Reason");
    var duration = req.getSession().get("Duration");
    var notes = req.getSession().get("Notes");
    var concernLevel = req.getSession().get("Concern");
    var OTP = req.getSession().get("OTP");
    console.log('presenting summary screen');
    res.say("Here is the summary of your survey. To update your survey, just say, Alexa, update my survey");
    var directive = {
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'summary',
      document: summary,
      datasources: {
        "bodyTemplate1Data": {
            "type": "object",
            "objectId": "bt1Sample",
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "",
                        "size": "small",
                        "widthPixels": 0,
                        "heightPixels": 0
                    },
                    {
                        "url": "",
                        "size": "large",
                        "widthPixels": 0,
                        "heightPixels": 0
                    }
                ]
            },
            "title": "Summary",
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": "Reason: " + reason + 
                    "<br/>Duration: " + duration + 
                    "<br/>Notes: " + notes + 
                    "<br/>Concern: " + concernLevel
                }
            },
            "logoUrl": ""
        }
    }
  };
    customAPLDirective = {
      "type": "Alexa.Presentation.APL.ExecuteCommands",
      "token": "summary",
      "commands": [
        {
          "type": "Sequential",
          "commands": [
            {
              "type": "Idle",
              "delay": 1200000
            }
          ]
        }
      ]
    };
    res.directive(directive).shouldEndSession(false);
    res.directive(customAPLDirective).shouldEndSession(false);
    console.log("made it to summarySurveyScreen");
    req.getRouter().intent("SurveyPost");
  })
  app.intent("SurveyPost", async function(req, res){
    var reason = req.getSession().get("Reason");
    var duration = req.getSession().get("Duration");
    var notes = req.getSession().get("Notes");
    var concernLevel = req.getSession().get("Concern");
    var surveyStatus = req.getSession().get("SurveyStatus");

    var OTP = req.getSession().get("OTP");
    await postSurvey(reason, duration, notes, concernLevel, surveyStatus, OTP).then(function(result) { 
        console.log(result);
      });
      
      var sesh = req.getSession();
      sesh.set('AppointmentStatus', "Completed");
  })
  app.intent("AptDetailsSurveyTaken", function(req,res){
    var customaptDirective = {
      "type": "Alexa.Presentation.APL.RenderDocument",
      "token": "aptDetail",
      "document": appointmentDetail,
      "datasources": {
        "bodyTemplate1Data": {
            "type": "object",
            "objectId": "bt1Sample",
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://images.pexels.com/photos/5412/water-blue-ocean.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
                        "size": "small",
                        "widthPixels": 0,
                        "heightPixels": 0
                    },
                    {
                        "url": "https://images.pexels.com/photos/5412/water-blue-ocean.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
                        "size": "large",
                        "widthPixels": 0,
                        "heightPixels": 0
                    }
                ]
            },
            "title": "Appointment Details",
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text":"ID: " + req.getSession().get('Id') +
                    "<br/> Status: " + "Completed" +
                    "<br/> Time: Monday, May 20 at 9:00 AM" +
                    "<br/><br/><br/><font size='2'>To cancel your appointment. Just Say : <br/><i>\"Alexa, request cancellation of my appointment\"</i></font>"
                }
            },
            "logoUrl": ""
        }
    }
      };
      customAPLDirective = {
        "type": "Alexa.Presentation.APL.ExecuteCommands",
        "token": "aptDetail",
        "commands": [
          {
            "type": "Parallel",
            "commands": [
              {
                "type": "Idle",
                "delay": 1200000
              }
            ]
          }
        ]
      };
      res.directive(customaptDirective).shouldEndSession(false);
      res.directive(customAPLDirective).shouldEndSession(false);
  })

  app.intent("AptDetailsNonVoiceNonSurvey", function(req,res){
    var customaptDirective = {
      "type": "Alexa.Presentation.APL.RenderDocument",
      "token": "aptDetail",
      "document": appointmentDetail,
      "datasources": {
        "bodyTemplate1Data": {
            "type": "object",
            "objectId": "bt1Sample",
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://images.pexels.com/photos/5412/water-blue-ocean.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
                        "size": "small",
                        "widthPixels": 0,
                        "heightPixels": 0
                    },
                    {
                        "url": "https://images.pexels.com/photos/5412/water-blue-ocean.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
                        "size": "large",
                        "widthPixels": 0,
                        "heightPixels": 0
                    }
                ]
            },
            "title": "Appointment Details",
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": "ID: " + req.getSession().get('Id') +
                    "<br/> Status: " + "SurveyPending" +
                    "<br/> Time: Monday, May 20 at 9:00 AM" +
                    "<br/><br/><br/><font size='2'>Just Say : <i>\"Alexa, take a survey\"</i></font>"
                }
            },
            "logoUrl": ""
        }
    }
      };
      customAPLDirective = {
        "type": "Alexa.Presentation.APL.ExecuteCommands",
        "token": "aptDetail",
        "commands": [
          {
            "type": "Parallel",
            "commands": [
              {
                "type": "Idle",
                "delay": 1200000
              }
            ]
          }
        ]
      };
      res.directive(customaptDirective).shouldEndSession(false);
      res.directive(customAPLDirective).shouldEndSession(false);
  })
  
  app.intent("appointmentDetails", async function(req, res){
  
    
    var getObj =  await getUser(req.getSession().get('OTP')).then(function(result){
      var details = "";
      console.log("Appt details"+ result)
      var sesh = req.getSession();
      sesh.set("Id", result.Appointment.Id)
      sesh.set("AppointmentStatus", result.Appointment.AppointmentStatus)
      sesh.set("AppointmentDetails", result.Appointment.AppointmentDetails)
      if(req.getSession().get('AppointmentStatus') === "SurveyPending"){
        res.say("I was not able to confirm your appointment. You need to first take a survey.")
        details = "ID: " + req.getSession().get('Id') +
        "<br/> Status: " + req.getSession().get('AppointmentStatus') +
        "<br/> Time: Monday, May 20 at 9:00 AM" +
        "<br/><br/><br/><font size='2'>Just Say : <i>\"Alexa, take a survey\"</i></font>"
    }
    else {
      res.say("Your appointment has been confirmed for Monday, May 20 at nine AM")
      details = "ID: " + req.getSession().get('Id') +
                "<br/> Status: " + req.getSession().get('AppointmentStatus') +
                "<br/> Time: Monday, May 20 at 9:00 AM" +
                "<br/><br/><br/><font size='2'>To cancel your appointment. Just Say : <br/><i>\"Alexa, request cancellation of my appointment\"</i></font>"
    }
    var customaptDirective = {
      "type": "Alexa.Presentation.APL.RenderDocument",
      "token": "aptDetail",
      "document": appointmentDetail,
      "datasources": {
        "bodyTemplate1Data": {
            "type": "object",
            "objectId": "bt1Sample",
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://images.pexels.com/photos/5412/water-blue-ocean.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
                        "size": "small",
                        "widthPixels": 0,
                        "heightPixels": 0
                    },
                    {
                        "url": "https://images.pexels.com/photos/5412/water-blue-ocean.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
                        "size": "large",
                        "widthPixels": 0,
                        "heightPixels": 0
                    }
                ]
            },
            "title": "Appointment Details",
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": details
                }
            },
            "logoUrl": ""
        }
    }
      };
      customAPLDirective = {
        "type": "Alexa.Presentation.APL.ExecuteCommands",
        "token": "aptDetail",
        "commands": [
          {
            "type": "Parallel",
            "commands": [
              {
                "type": "Idle",
                "delay": 1200000
              }
            ]
          }
        ]
      };
      res.directive(customaptDirective).shouldEndSession(false);
      res.directive(customAPLDirective).shouldEndSession(false);
    });
   
      
  })

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

function getAppointmentEvent() {
  let timestamp = new Date();
  let expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getHours() + 24);
  let referenceId = "SampleReferenceId" + new Date().getTime();  
  const eventJson = {
      "timestamp": timestamp.toISOString(),
      "referenceId": referenceId,
      "expiryTime": expiryTime.toISOString(),
      "event": {
        "name": "AMAZON.Occasion.Updated",
        "payload": {
            "state": {
                "confirmationStatus": "CONFIRMED"
            },
            "occasion": {
                "occasionType": "APPOINTMENT",
                "subject": "localizedattribute:subject",
                "provider": {
                    "name": "localizedattribute:providerName"
                },
                "bookingTime": "2019-05-13T19:47:59.00Z",
                "broker": {
                    "name": "localizedattribute:brokerName"
                }
            }
    },
    "localizedAttributes": [
        {
            "locale": "en-US",
            "subject": "root canal",
            "providerName": "Dental XYZ",
            "brokerName": "Dental XYZ"
        }
    ],
    "relevantAudience": {
        "type": "Multicast",
        "payload": {}
    }
  }
};
return eventJson;
};

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

app.intent("goHome", 
function(req, res) {
  var customLaunchDirective = {
    "type": "Alexa.Presentation.APL.RenderDocument",
    "token": "homelaunch",
    "document": launchJson,
    "datasources": dataSource
    };
    customAPLDirective = {
      "type": "Alexa.Presentation.APL.ExecuteCommands",
      "token": "homelaunch",
      "commands": [
        {
          "type": "Parallel",
          "commands": [
            {
              "type": "Idle",
              "delay": 1200000
            }
          ]
        }
      ]
    };
    res.directive(customLaunchDirective).shouldEndSession(false);
    res.directive(customAPLDirective).shouldEndSession(false);
});

app.intent("Authenticate", 

async function(request, response) {
  response.card({
    type: "Standard",
    title: "Authenticating", 
    text: "Incorrect OTP. Try again",
    image: {
      smallImageUrl: "https://www.identrust.com/sites/default/files/inline-images/secure-authentication%20%281%29_0.png", 
      largeImageUrl: "https://www.identrust.com/sites/default/files/inline-images/secure-authentication%20%281%29_0.png"
    }
  });
  console.log(request.slot('OTP'));
  if(request.slot('OTP') == 1234 || request.slot('OTP') == 4321){
    
    response.say("Thanks for authentication. Please wait while I redirect you").shouldEndSession(false);
    request.getRouter().intent("homePage");
    var sesh = request.getSession();
    sesh.set("OTP", request.slot('OTP'));
    var obj =  await postUser(request.slot('OTP')).then(function(result){
      return JSON.stringify(result)
    });
    var getObj =  await getUser(request.slot('OTP')).then(function(result){
      console.log(result);
      sesh.set("Duration", result.Survey.Duration)
      sesh.set("Reason", result.Survey.Symptom)
      sesh.set("SurveyStatus", result.Survey.SurveyStatus)
      sesh.set("Notes", result.Survey.Notes)
      sesh.set("Concern", result.Survey.Concern)
      sesh.set("Id", result.Appointment.Id)
      sesh.set("AppointmentStatus", result.Appointment.AppointmentStatus)
      sesh.set("AppointmentDetails", result.Appointment.AppointmentDetails)
    });
  }
  else{
    request.getRouter().intent("failAuthentication");
  }
});
function postUser(OTP){
    return request_promise({
      "method":"POST", 
      "uri": `https://alexaphreesiaapi.azurewebsites.net/api/assistant/patient/${OTP}`,
      "json": true})
}
function getUser(OTP){
  return request_promise({
    "method":"GET", 
    "uri": `https://alexaphreesiaapi.azurewebsites.net/api/assistant/patient/${OTP}`,
    "json": true})
}
function sendEvent(token) {
  return new Promise(resolve => {
      const ProactivePostData = JSON.stringify(getAppointmentEvent());
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
    req.getRouter().intent("goHome");
    //res.say("Sent an event")
  });

  app.on("AlexaSkillEvent.ProactiveSubscriptionChanged", (request, response, request_json) => {
    console.log("AWS User " + request.context.System.user.userId);
  });

  app.intent('insuranceFAQ',
    function(req, res) {
      var customDirective = insuranceFAQ;
      res.directive(customDirective).shouldEndSession(false);
      return false;
    })

  app.intent('insuranceType', 
  function(req, res) {
    res.say('made it');
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

  app.intent("AMAZON.PreviousIntent", function(req, res){
    
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

  app.intent("billing", function(req, res){
    var customDirective =
    {
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'pagerToken',
        version: '1.0',
        document: require('./pager.json'),
        datasources: {
          'pagerTemplateData': {
            'type': 'object',
            'properties': {
              'hintString': 'try the blue cheese!',
            },
            'transformers': [
              {
                'inputPath': 'hintString',
                'transformer': 'textToHint',
              },
            ],
          },
        },
      }
      res.directive(customDirective).shouldEndSession(false);
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

  app.intent('concern',
  function(req, res) {
    console.log("made it to concern");
    var concern = req.slot('concernLevel');
    var sesh = req.getSession();
    sesh.set("Concern", concern);
    req.getRouter().intent("summarySurvey");
  })

  app.intent('moderate', 
  function(request, response) {
    var sesh = request.getSession();
    sesh.set("Concern", "Moderate");
      request.getRouter().intent("summarySurvey");
  });

  app.intent('low', 
  function(request, response) {
    var sesh = request.getSession();
    sesh.set("Concern", "Low");
      request.getRouter().intent("summarySurvey");
  });
  app.intent('high', 
  function(request, response) {
    var sesh = request.getSession();
    sesh.set("Concern", "High");
      request.getRouter().intent("summarySurvey");
  });
  

  app.displayElementSelected(function (request, response) {
    // The request object selectedElementToken will be populated with the token that was registered
    // the element in the display directive. To get the token associated with the directive itself,
    // it is populated on the request.context.Display.token property.
    // handleRequestForTouchEvent(request.selectedElementToken);
    console.log(JSON.stringify(request.data.request.token));
    if(request.data.request.token === "type")	{
      console.log("made it");
      request.getRouter().intent("insuranceType");
    }
    else if(request.data.request.token === "costs")	{
      request.getRouter().intent("insuranceCosts");
    }
    else if(request.data.request.token === "cover")	{
      request.getRouter().intent("insuranceCover");
    }
    else if(request.data.request.token === "deductible")	{
      request.getRouter().intent("insuranceDeductible");
    }
    else if(request.data.request.token === "required")	{
      request.getRouter().intent("insuranceRequired");
    }
    else if(request.data.request.token  === "procedure"){
      request.getRouter().intent("procedure");
    }
    else if (request.data.request.token  === "Moderate" || request.data.request.token  === "Low" || request.data.request.token  === "High")
    {
      var sesh = request.getSession();
      sesh.set("Concern", request.data.request.token);
      request.getRouter().intent("summarySurvey");
    }
    else if (request.data.request.token === "status")
    {
      request.getRouter().intent("appointmentStatus");
    }
    else if (request.data.request.token === "take survey")
    {
      request.getRouter().intent("startSurvey");
    }
    else if (request.data.request.token === "doctor info")
    {
      request.getRouter().intent("DocInfo");
    }
    else if (request.data.request.token === "review info")
    {
      request.getRouter().intent("reviewSurvey")
    }
    else if (request.data.request.token === "item_1" || request.data.request.token === "item_2" || request.data.request.token === "item_3" ||
    request.data.request.token === "item_4" || request.data.request.token === "item_5" ){
      request.getRouter().intent("Rate")
    }
  });

  app.intent('goBack',
    function(req, res) {
      var prevIntent = req.getSession().get("PreviousIntent");
      var prevRequest = req.getSession().get("PreviousRequest");
      if (prevRequest === "IntentRequest") req.getRouter.intent(prevIntent);
      
      
    });

    function getSurvey(OTP) {
      return request_promise({
        "method":"GET", 
        "uri": `https://alexaphreesiaapi.azurewebsites.net/api/assistant/patient/survey/${OTP}`,
        "json": true})}

    function getApt(OTP) {
      return request_promise({
        "method":"GET", 
        "uri": `https://alexaphreesiaapi.azurewebsites.net/api/assistant/patient/appointment/${OTP}`,
        "json": true})}

    function postSurvey(symptom, duration, notes, concernLevel, status, OTP) {
      return request_promise({
        "method":"POST", 
        "uri": `https://alexaphreesiaapi.azurewebsites.net/api/assistant/patient/survey/${OTP}`,
        "json": true,
         "body": { 
          "Symptom": symptom,
          "Duration": duration,
          "Notes": notes,
          "Concern": concernLevel,
          "SurveyStatus": status
        }
      });
    
    }
    app.intent('appointmentInfo',
    async function(req, res) {
      var customDirective = {
        "type": "Alexa.Presentation.APL.RenderDocument",
        "token": "apt",
        "document": aptJson,
        "datasources": aptData
      };
      var customReviewDirective = {
        "type": "Alexa.Presentation.APL.RenderDocument",
        "token": "apt",
        "document": aptJson,
        "datasources": aptReviewData
      };
      var customUpdateDirective = {
        "type": "Alexa.Presentation.APL.RenderDocument",
        "token": "apt",
        "document": aptJson,
        "datasources": reviewSurveyUpdated
      };
      
      
      console.log("logging OTP: " + req.getSession().get("OTP"));
      var obj =  await getUser(req.getSession().get("OTP")).then(function(result){
       // var customDirective = appointmentTakeSurvey
        if(result.Appointment.AppointmentStatus === "Confirmed"){
          if(result.Survey.SurveyStatus === "Updated"){
            customDirective = customUpdateDirective
            res.say("You have updated your survey. Your appointment has been confirmed").shouldEndSession(false);
          }
          else{
            customDirective = customReviewDirective
            res.say("You have completed your survey. Your appointment has been confirmed").shouldEndSession(false);
          }    
        }
        else{
          res.say("You have not yet completed your survey. Please complete your survey to confirm your appointment").shouldEndSession(false);
        }
        customAPLDirective = {
          "type": "Alexa.Presentation.APL.ExecuteCommands",
          "token": "apt",
          "commands": [
            {
              "type": "Parallel",
              "commands": [
                {
                  "type": "Idle",
                  "delay": 1200000
                }
              ]
            }
          ]
        };
        res.directive(customDirective).shouldEndSession(false);
        res.directive(customAPLDirective).shouldEndSession(false);
      
      }); 
    });

  	app.intent("DocRating",
	function (request, response) {
		if (request.type !== "Alexa.Presentation.APL.UserEvent") {
			response.say('On a scale of one to five how was your experience?').shouldEndSession(false);
		}
		var customDirective = ratingTemplate;
		response.directive(customDirective).shouldEndSession(false);
		return false;

  });
  app.intent("Rate",
	function (request, response) {
		response.say("Thank you for rating your experience").shouldEndSession(false);
		request.getRouter().intent("goHome");
    return false;
  })

    app.intent("AptNonVoiceNonSurvey", function(req, res){
      var customDirective = {
        "type": "Alexa.Presentation.APL.RenderDocument",
        "token": "apt",
        "document": aptJson,
        "datasources": aptData
      };
      customAPLDirective = {
        "type": "Alexa.Presentation.APL.ExecuteCommands",
        "token": "apt",
        "commands": [
          {
            "type": "Parallel",
            "commands": [
              {
                "type": "Idle",
                "delay": 1200000
              }
            ]
          }
        ]
      };
      res.directive(customDirective).shouldEndSession(false);
      res.directive(customAPLDirective).shouldEndSession(false);

    });
    
    app.intent("AptNonVoiceSurveyTaken", function(req, res){
      var customReviewDirective = {
        "type": "Alexa.Presentation.APL.RenderDocument",
        "token": "apt",
        "document": aptJson,
        "datasources": aptReviewData
      };
      customAPLDirective = {
        "type": "Alexa.Presentation.APL.ExecuteCommands",
        "token": "apt",
        "commands": [
          {
            "type": "Parallel",
            "commands": [
              {
                "type": "Idle",
                "delay": 1200000
              }
            ]
          }
        ]
      };
      res.directive(customReviewDirective).shouldEndSession(false);
      res.directive(customAPLDirective).shouldEndSession(false);

    });

    app.intent('reviewSurvey',
     function(req, res) {
      var reason = req.getSession().get("Reason");
      var duration = req.getSession().get("Duration");
      var notes = req.getSession().get("Notes");
      var concernLevel = req.getSession().get("Concern");
      var surveyStatus = req.getSession().get("SurveyStatus");
        var directive = {
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'summary',
          document: summary,
          datasources: {
            "bodyTemplate1Data": {
                "type": "object",
                "objectId": "bt1Sample",
                "backgroundImage": {
                    "contentDescription": null,
                    "smallSourceUrl": null,
                    "largeSourceUrl": null,
                    "sources": [
                        {
                            "url": "",
                            "size": "small",
                            "widthPixels": 0,
                            "heightPixels": 0
                        },
                        {
                            "url": "",
                            "size": "large",
                            "widthPixels": 0,
                            "heightPixels": 0
                        }
                    ]
                },
                "title": "Here is your survey review",
                "textContent": {
                    "primaryText": {
                        "type": "PlainText",
                        "text": "Reason: " + reason+ 
                        "<br/>Duration: " + duration + 
                        "<br/>Notes: " + notes + 
                        "<br/>Concern: " + concernLevel +
                        "<br/>Status: " + surveyStatus 
                        
                    }
                },
                "logoUrl": ""
            }
        }
      };
        customAPLDirective = {
          "type": "Alexa.Presentation.APL.ExecuteCommands",
          "token": "summary",
          "commands": [
            {
              "type": "Sequential",
              "commands": [
                {
                  "type": "Idle",
                  "delay": 1200000
                }
              ]
            }
          ]
        };
        res.directive(directive).shouldEndSession(false);
        res.directive(customAPLDirective).shouldEndSession(false);
      });
    

exports.handler = app.lambda();