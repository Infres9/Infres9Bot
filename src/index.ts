
import * as login from 'facebook-chat-api';
import BetService from './services/BetService';
import Service from './services/Service';

const services  = {};

if(!process.env.FACEBOOK_MAIL || !process.env.FACEBOOK_PWD){
    console.error("Please, set FACEBOOK_MAIL && FACEBOO_PWD environment variables");
    process.exit(-1);
}

login({email: process.env.FACEBOOK_MAIL, password: process.env.FACEBOOK_PWD}, (err,api) => {
    if(err) return console.error(err);

    services["bet"] = new BetService(api);
    api.listen(receiveMessage);
});


function handleMessageSent(message){
    let cleaned = message.body.replace(/\s+/g,' ');
    let splited = cleaned.split(' ');
    let firstChar = cleaned[0];
    if(firstChar !== '/')return;
    let firstWord = splited[0].substr(1);
    if(!services[firstWord])return;
    let service = services[firstWord];
    
    let secondWord = splited[1];
    console.error(secondWord);
    let commands = service.commands();
    if(!secondWord || !commands[secondWord]){
        console.error("Command not found");
        return;
    }

    return commands[secondWord].call(service, message);
}

function handleReactionSent(message){
    //later :)
}

function receiveMessage(err, message){
    if(err)return console.error(err);

    try{
        switch(message.type){
            case "message":return handleMessageSent(message);
            case "message_reaction":return handleReactionSent(message);
            default:break;
        }
    }catch(ex){
        console.error("Failed to execute command " + message.body);
        console.error(ex);
    }
}