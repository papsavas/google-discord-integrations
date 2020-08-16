require('coffee-register');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const gapi = require('gapi');
const { Console } = require('console');
const { EOF } = require('dns');
const gauth = require('./GAuth');


var events;
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'tokens/token_calendar.json';
const CREDENTIALS_PATH = 'credentials/credentials_calendar.json';
var Dmessage;

function listEvents(message){
    Dmessage = message;
    gauth.authorization(SCOPES,TOKEN_PATH,CREDENTIALS_PATH,loadEvents);
}

function loadEvents(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        events = res.data.items;
        if (events.length) {
            sendEvents(events, Dmessage);
            return
        } 
        else {
            Dmessage.channel.send('No upcoming events found.');
        }
    });
}

function sendEvents(events,receivedMessage){
    console.log('Upcoming 100 events:');
    events.map(async(event, i) => 
    {
        const start = event.start.dateTime || event.start.date;
        let dateNtime = start.split('T');
        let date = dateNtime[0];
        timeNtimezone= dateNtime[1].split('+');
        time=timeNtimezone[0];
        date = date.split('-');
        
        str = `>>> • **${event.summary}**  (${event.description}) -> **${date[2]}/${date[1]}** στις ${time}`
        
        let spaces=''
        for(let i=0; i<2.55*str.length;i++){
            spaces+='\xa0';  //length of the horizontal line splitting events
        }
        //spaces+='__';
        receivedMessage.channel.send(str+`\n__${spaces}__\n`);
    });
}

exports.listEvents=listEvents;