require('coffee-register');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const gauth = require('./GAuth');
const { resolve } = require('path');
const { rejects } = require('assert');
//const { send } = require('process');

    const SCOPES = [
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.send'
    ];
    const TOKEN_PATH = 'tokens/token_gmail.json';

    const CREDENTIALS_PATH = 'credentials/credentials_gmail.json'; 
    var to;
    var subj;
    var msg;
    var sended = false;
    
    function send(exauth){
        var raw = makeBody(to, '---Your Diplayed Name---', subj, msg);
        const gmail = google.gmail({version: 'v1', exauth});
        gmail.users.messages.send({
            auth: exauth,
            userId: 'me',
            resource: {
                raw: raw
            }
        })
        .then(sended=true)
        .catch(err => sended=false);
    }
    
    function email(email_addr, subject, message) {
        to=email_addr;
        subj=subject;
        msg=message;
        gauth.authorization(SCOPES, TOKEN_PATH,CREDENTIALS_PATH,send);  
        return sended;
    }

    function makeBody(to, from, subject, message) {
        var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
            "MIME-Version: 1.0\n",
            "Content-Transfer-Encoding: 7bit\n",
            "to: ", to, "\n",
            "from: ", from, "\n",
            "subject: ", subject, "\n\n",
            message
        ].join('');

   

        var encodedMail = Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
            return encodedMail;
    }


exports.email=email;