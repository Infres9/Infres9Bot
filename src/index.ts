
import * as login from 'facebook-chat-api';
import BetService from './services/BetService';
import Service from './services/Service';
import {MessageType} from './Enums';
import {FacebookChatApi, ListenInfo, EventInfo, MessageReactionInfo, MessageInfo} from './FacebookChatApi';

const services : {[key : string] : Service}  = {};

if(!process.env.FACEBOOK_MAIL || !process.env.FACEBOOK_PWD){
    console.error("Please, set FACEBOOK_MAIL && FACEBOOK_PWD environment variables");
    process.exit(-1);
}

login({email: process.env.FACEBOOK_MAIL, password: process.env.FACEBOOK_PWD}, (err,api : FacebookChatApi) => {
    if(err) return console.error(err);

    api.setOptions({listenEvents : true, selfListen : true});
    services["bet"] = new BetService(api);
    api.listen(receiveMessage);
});


function handleMessageSent(message : MessageInfo){
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

    return commands[secondWord]
                .call(service, message)
                .catch(er => console.error(er));
}

function handleReactionSent(message : MessageReactionInfo){
    Object.keys(services).map(k => services[k].reactions(message));

}

function handleEvent(message : EventInfo){
    Object.keys(services).map(k => services[k].events(message));
}

function receiveMessage(err, message : ListenInfo){
    if(err)return console.error(err);
    
    try{
        switch(message.type){
            case MessageType.Message : return handleMessageSent(message);
            case MessageType.MessageReaction : return handleReactionSent(message);
            case MessageType.Event : return handleEvent(message);
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