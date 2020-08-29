require('coffee-register');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const gapi = require('gapi');
const { Console } = require('console');
const { EOF } = require('dns');
const gauth = require('./GAuth');
const google_ids = require('../reps/google ids.json');
const discIDs = require('../reps/discord ids.json');
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://spreadsheets.google.com/feeds',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

const TOKEN_PATH = '../tokens/token_sheets.json';

const CREDENTIALS_PATH = '../credentials/credentials_sheets.json';

var write_flag;
var contents;
var am2ID;
var client;
var mID2member;
var am;
var id;
var name;

async function MembersData(inc_w_bool, inc_contents, inc_amID, inc_client,inc_IDMembers){  
    write_flag=inc_w_bool;
    contents=inc_contents;
    am=contents[0];
    id=contents[1];
    name=contents[2];
    am2ID=inc_amID;
    client=inc_client;
    mID2member=inc_IDMembers;
    let auth = await gauth.authorization(SCOPES,TOKEN_PATH,CREDENTIALS_PATH);
    let response;
    if(write_flag){
       response = await write2Sheet(auth);
    }
    else{
       response = await loadMembers(auth);
    }
    
    return new Promise((resolve, reject) => {
      resolve(response);
    });
}

//load members from sheets to local structures
function loadMembers(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get({
      spreadsheetId: google_ids.MembersDataSheet,
      range: 'Members Data',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      if (rows.length) {
        rows.map((row) => {
          //console.log(row);
          am2ID[row[0]]=`${row[1]}`;
          //console.log(`${row[0]}, ${row[1]}, ${row[2]}`);
        });
      } else {
        console.log('No sheet data found.');
      }
  
      for(let am in am2ID){
         //fetch('id') returns <member>
        client.guilds.cache.get(discIDs.KEPguild).members.fetch(am2ID[am])
        .then(member=>mID2member[am2ID[am]]=member)
        .catch(err=> {
          if(am2ID[am].length>0){
             /* this will be automated in the future  */
            console.log(`\nMember not found while scanning docs. Be sure to remove it from "Members Data"\n ID: ${am2ID[am]}`);
            client.channels.cache.get(discIDs.channels.papbot).send(`Remove Member with MemberID:${am2ID[am]}\n`);
          }
        }); 
      }
    });
    resolve(mID2member);
  });
}


function write2Sheet(auth){
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
    return sheets.spreadsheets.values.append({
      spreadsheetId: google_ids.MembersDataSheet,
      range:"Members Data",
      valueInputOption:'RAW',
      resource,
    });
}

exports.MembersData = MembersData;