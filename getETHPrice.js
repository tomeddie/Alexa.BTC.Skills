/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

var https = require('https');

const languageStrings = {
    'en-GB': {
        translation: {
            SKILL_NAME: 'ethereum price',
            GET_PRICE_MESSAGE: "The current ethereum price in U S dollars is ",
            GET_PRICE_MONEY: " dollars ",
            GET_PRICE_AND: " and ",
            GET_PRICE_CENTS: " cents.",
            NO_CHANGE_SINCE_OPEN: "  There is no change in ethereum's price today.",
            TODAY_CHANGE_UP: "  It is up ",
            TODAY_CHANGE_DOWN: " It is down ",
            TODAY_PERCENT: " percent today",
            TODAY_SHUCKS: ".  Maybe I should hold my ethereum.",
            TODAY_YIPPIE: ".  To the Moon.",
            HELP_MESSAGE: 'You can say what is the current ethereum price, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
    'en-US': {
        translation: {
            SKILL_NAME: 'ethereum price',
            GET_PRICE_MESSAGE: 'The current ethereum price in U S dollars is ',
            GET_PRICE_MONEY: " dollars ",
            GET_PRICE_AND: " and ",
            GET_PRICE_CENTS: " cents.",
            NO_CHANGE_SINCE_OPEN: "  There is no change in ethereum's price today.",
            TODAY_CHANGE_UP: "  It is up ",
            TODAY_CHANGE_DOWN: " It is down ",
            TODAY_PERCENT: " percent today",
            TODAY_SHUCKS: ".  Maybe I should hold my ethereum.",
            TODAY_YIPPIE: ".  To the Moon.",
            ERROR_UNKNOWN: 'unknown.  Please try again later.',
            HELP_MESSAGE: 'You can say what is the current ethereum price, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    }
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetETHPrice');
    },
    'GetEthereumPrice': function () {
        this.emit('GetETHPrice');
    },
    'GetETHPrice': function () {
          makeETHRequest(this, function ethResponseCallback(locthis, err, ethResponse) {
              console.log('Returned from makeETHRequest');
              if (err === null) {
                  console.log('No error so output');
                  var res = ethResponse.last.split(".");
                  if (res[0] !== null) {
                    var message = locthis.t('GET_PRICE_MESSAGE') + res[0] + locthis.t('GET_PRICE_MONEY');
                    message += locthis.t('GET_PRICE_AND') + res[1] + locthis.t('GET_PRICE_CENTS');
                    
                    if (ethResponse.last > ethResponse.open) {
                        var up =  Math.round((1-(ethResponse.open/ethResponse.last))*100);
                        message += locthis.t('TODAY_CHANGE_UP') + up + locthis.t('TODAY_PERCENT') + locthis.t('TODAY_YIPPIE');
                    } else if (ethResponse.last == ethResponse.open) {
                        message += locthis.t('NO_CHANGE_SINCE_OPEN');
                    } else {
                        var down =  Math.round((1-(ethResponse.last/ethResponse.open))*100);
                        message += locthis.t('TODAY_CHANGE_DOWN') + down + locthis.t('TODAY_PERCENT') + locthis.t('TODAY_SHUCKS');
                    }
                    console.log(message);
                    locthis.emit(':tell', message);    
                  }
                  else {
                      locthis.emit(':tell', locthis.t('ERROR_MESSAGE'));
                  }
                  
              }
              else
              {
                  console.log('error : ' + err);
                  locthis.emit(':tell', locthis.t('ERROR_MESSAGE'));
              }
              
          });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    }
};

function makeETHRequest(localthis, ethResponseCallback) {

    var endpoint = 'https://www.bitstamp.net/api/v2/ticker/ethusd/';
    console.log('Calling http.get');
    https.get(endpoint, function (res) {
        var ethResponseString = '';
      
        if (res.statusCode != 200) {
            console.log("statusCode = " + res.statusCode);
            if (res.statusCode == 301) {
                console.log("Redirect to " + res.Location);
            }
            ethResponseCallback(localthis, new Error("Non 200 Response"));
        }

        res.on('data', function (data) {
            ethResponseString += data;
        });

        res.on('end', function () {
            console.log('ResponseString is : ' + ethResponseString);
            var ethResponseObject = JSON.parse(ethResponseString);

            if (ethResponseObject.error) {
                
                ethResponseCallback(localthis, new Error(ethResponseObject.error.message));
            } else {
                
                ethResponseCallback(localthis, null, ethResponseObject);
            }
        });
    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        ethResponseCallback(localthis, new Error(e.message));
    });
}

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
