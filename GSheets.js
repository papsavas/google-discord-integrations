require('coffee-register');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const gapi = require('gapi');
const { Console } = require('console');
const { EOF } = require('dns');
const gauth = require('./GAuth');
const google_ids = require('../resps/google ids.json');
const discIDs = require('../resps/discord ids.json');
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://spreadsheets.google.com/feeds',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

const TOKEN_PATH = 'tokens/token_sheets.json';

const CREDENTIALS_PATH = 'credentials/credentials_sheets.json';

var w_bool;
var contents;
var amID;
var client;
var IDMembers;

function list(inc_w_bool, inc_contents, inc_amID, inc_client,inc_IDMembers){  
    write_flag=inc_w_bool;
    contents=inc_contents;
    amID=inc_amID;
    client=inc_client;
    IDMembers=inc_IDMembers;
    gauth.authorization(SCOPES,TOKEN_PATH,CREDENTIALS_PATH,loadMembers);
}


function loadMembers(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: google_ids.MembersDataSheet,
    range: 'Members Data',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('AM, ID, Name');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        //console.log(row);
        amID[row[0]]=`${row[1]}`;
      //  console.log(`${row[0]}, ${row[1]}, ${row[2]}`);
      });
    } else {
      console.log('No data found.');
    }

    for(let am in amID){
      client.guilds.cache.get(discIDs.KEPguild).members.fetch(amID[am]).then(value=>IDMembers[amID[am]]=value);
    }
    console.log('idmembers:'+ IDMembers);
    if(w_bool)
        write2Sheet(auth, contents[0],contents[1],contents[2])
  });
}


function write2Sheet(auth, am,id,name){
  const sheets = google.sheets({version: 'v4', auth});
  let values = [
      [
        am, id, name
      ],
      // Additional rows ...
    ];
    let resource = {
      values,
    };
    sheets.spreadsheets.values.append({
      spreadsheetId: google_ids.MembersDataSheet,
      range:"Members Data",
      valueInputOption:'RAW',
      resource,
    });
}

exports.list = list;