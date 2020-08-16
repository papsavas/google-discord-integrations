require('coffee-register');
require('discord.js')
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const gapi = require('gapi');
const { Console, error } = require('console');
const { EOF } = require('dns');
const async = require("async");
const gauth =require('./GAuth');

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata'];
const TOKEN_PATH = 'tokens/token_drive.json';
const CREDENTIALS_PATH= 'credentials/credentials_drive.json';

var drole;
var email_message;
var email;
const google_ids = require('../resps/google ids.json');
const fileId=google_ids.dai_archive;
var drive;


function add(discord_message, role){
    drole = role;
    email_message = discord_message;
    email = email_message.content.match(/(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g);
    email = email.toString();
    gauth.authorization(SCOPES,TOKEN_PATH,CREDENTIALS_PATH,addUser);

}


function listPerms(auth){
    const drive = google.drive({version: 'v3', auth});
    var permIDs=[];
    return drive.permissions.list({
        "fileId": fileId,
        "useDomainAdminAccess": false
        })
            .then(function(response) {
                    // Handle the results here (response.result has the parsed body).
                    //console.log("Response", response);
                    fs.writeFile("256names from drive.txt",'Names and emails\n', function(err) {
                    if(err) {
                        return console.log(err);
                    }

                    
                    console.log("The file was saved!");
                }); 

                


                    response.data.permissions.map(perm => permIDs.push(perm.id));
                    console.log(permIDs);
                    for(let i=241;i<=255;i++ ){
                    getPerms(permIDs[i],auth);
                    }
                    
                },
                function(err) { console.error("Execute error", err); });
}

function getPerms(id,auth){
    const drive = google.drive({version: 'v3', auth});
    drive.permissions.get({
        "fileId": fileId,
        "permissionId": id,
        "fields": "displayName,emailAddress"   
        })
            .then(function(response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log(response.data);
                    
                fs.appendFile("256names from drive.txt", `${response.data.displayName} : ${response.data.emailAddress}\n`, (err) => {
                    if (err) throw err;
                });

                },
                function(err) { console.error("Execute error", err); });
}

   

function addUser(auth) {
    drive = google.drive({version: 'v3', auth});
    var permissions = [
        {
            'type': 'user',
            'role': drole,
            'emailAddress': email
        }
    ];
    async.eachSeries(permissions, function (permission, permissionCallback) {
        drive.permissions.create({
            resource: permission,
            fileId: fileId,
            fields: 'id',
        }, function (err, res) {
            if (err) {
                console.error(err);
                permissionCallback(err);
            } else {
                console.log('Permission ID: ', res.id)
                permissionCallback();
            }
        });
    }, function (err) {
            if (err) {
                email_message.channel.react('😟');
                console.log(err);
                
            } 
            else {
                // All permissions inserted
                console.log('success adding email to DAI Archive');
                email_message.react('👍');
            }
        });
}


exports.add=add;