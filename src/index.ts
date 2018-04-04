
import * as login from 'facebook-chat-api';
import BetService from './services/BetService';
import Service from './services/Service';
import {MessageType} from './Enums';
import {FacebookChatApi, ListenInfo} from './FacebookChatApi';

const services : {[key : string] : Service}  = {};

if(!process.env.FACEBOOK_MAIL || !process.env.FACEBOOK_PWD){
    console.error("Please, set FACEBOOK_MAIL && FACEBOOK_PWD environment variables");
    process.exit(-1);
}

login({email: process.env.FACEBOOK_MAIL, password: process.env.FACEBOOK_PWD}, (err,api : FacebookChatApi) => {
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

function receiveMessage(err, message : ListenInfo){
    if(err)return console.error(err);
    message.type

    try{
        switch(message.type){
            case MessageType.Message : return handleMessageSent(message);
            case MessageType.MessageReaction : return handleReactionSent(message);
            default:break;
        }
    }catch(ex){
        console.error("Failed to execute command " + message.type);
        if(message.type == MessageType.Message){
            console.error(message.body);
        }
        console.error(ex);
    }
}