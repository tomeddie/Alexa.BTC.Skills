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
            SKILL_NAME: 'Bit coin price',
            GET_PRICE_MESSAGE: "The current Bit coin price is ",
            GET_PRICE_MONEY: " pounds",
            HELP_MESSAGE: 'You can say what is the current bit coin price, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
    'en-US': {
        translation: {
            SKILL_NAME: 'Bit coin price',
            GET_PRICE_MESSAGE: 'The current Bit coin price is ',
            GET_PRICE_MONEY: " dollars ",
            GET_PRICE_AND: " and ",
            GET_PRICE_CENTS: " cents ",
            ERROR_UNKNOWN: 'unknown.  Please try again later.',
            HELP_MESSAGE: 'You can say what is the current bit coin price, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    }
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetBTCPrice');
    },
    'GetBitCoinPrice': function () {
        this.emit('GetBTCPrice');
    },
    'GetBTCPrice': function () {
          makeBTCRequest(this, function btcResponseCallback(locthis, err, btcResponse) {
              console.log('Returned from makeBTCRequest');
              if (err === null) {
                  console.log('No error so output');
                  var res = btcResponse.last.split(".");
                  if (res[0] !== null) {
                    var message = locthis.t('GET_PRICE_MESSAGE') + res[0] + locthis.t('GET_PRICE_MONEY');
                    message += locthis.t('GET_PRICE_AND') + res[1] + locthis.t('GET_PRICE_CENTS');
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

function makeBTCRequest(localthis, btcResponseCallback) {

    var endpoint = 'https://www.bitstamp.net/api/ticker/';
    console.log('Calling http.get');
    https.get(endpoint, function (res) {
        var btcResponseString = '';
      
        if (res.statusCode != 200) {
            console.log("statusCode = " + res.statusCode);
            if (res.statusCode == 301) {
                console.log("Redirect to " + res.Location);
            }
            btcResponseCallback(localthis, new Error("Non 200 Response"));
        }

        res.on('data', function (data) {
            btcResponseString += data;
        });

        res.on('end', function () {
            console.log('ResponseString is : ' + btcResponseString);
            var btcResponseObject = JSON.parse(btcResponseString);

            if (btcResponseObject.error) {
                
                btcResponseCallback(localthis, new Error(btcResponseObject.error.message));
            } else {
                
                btcResponseCallback(localthis, null, btcResponseObject);
            }
        });
    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        btcResponseCallback(localthis, new Error(e.message));
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
