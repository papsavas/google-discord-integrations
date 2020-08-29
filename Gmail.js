require('coffee-register');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const gauth = require('./GAuth');
const { resolve } = require('path');
const { rejects } = require('assert');


    const SCOPES = [
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.send'
    ];
    const TOKEN_PATH = '../tokens/token_gmail.json';

    const CREDENTIALS_PATH = '../credentials/credentials_gmail.json'; 

    //__________________________________________________________________________

    async function email(email_addr, subject, message) {
      const to = email_addr;
      const subj = subject;
      const msg = message;
      
      let exauth = await gauth.authorization(SCOPES, TOKEN_PATH, CREDENTIALS_PATH);
      return new Promise(async (resolve, reject) => {           
         const response = await send(exauth, { to, subj, msg });
         resolve(response);
      });
    }



    function send(exauth, data) {
        var raw = makeBody(data.to, 'name of sender bluh bluh', data.subj, data.msg);
        const gmail = google.gmail({
          version: 'v1',
          exauth
        });
        return gmail.users.messages.send({ auth: exauth, userId: 'me', resource: { raw } })
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