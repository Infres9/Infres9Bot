import Service from './services/Service';
import BetService from './services/BetService';
import ThoughtsService from './services/ThoughtsService';
import { FacebookChatApi, ListenInfo, MessageInfo, EventInfo, MessageReactionInfo } from './FacebookChatApi';
import { MessageType } from './Enums';

export default class Messenger{

    private services : {[key : string] : Service};
    private api : FacebookChatApi;

    constructor(private loginFunction){
        if(!process.env.FACEBOOK_MAIL || !process.env.FACEBOOK_PWD){
            console.error("Please, set FACEBOOK_MAIL && FACEBOOK_PWD environment variables");
            return;
        }
        //login ?
        this.services = {};
        this.login();
    }
    
    private login(){
        this.loginFunction({email: process.env.FACEBOOK_MAIL, password: process.env.FACEBOOK_PWD}, (err,api : FacebookChatApi) => {
            if(err) return console.error(err);
            this.api = api;

            api.setOptions({listenEvents : true, selfListen : true});
            this.services["bet"] = new BetService(api);
            this.services["thought"] = new ThoughtsService(api);
            api.listen(this.receiveMessage.bind(this));
        });
    }

    public async reload(){
        if(this.api === null)return;
        await new Promise(solver =>
            this.api.logout(err => {
                if(err)throw err;
                solver();
            })
        );
        this.services = {};
        this.login();

    }

    private receiveMessage(err, message : ListenInfo){
        if(err)return console.error(err);
        
        try{
            switch(message.type){
                case MessageType.Message : return this.handleMessageSent(message);
                case MessageType.MessageReaction : return this.handleReactionSent(message);
                case MessageType.Event : return this.handleEvent(message);
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


    private handleMessageSent(message : MessageInfo){
        let cleaned = message.body.replace(/\s+/g,' ');
        let splited = cleaned.split(' ');
        let firstChar = cleaned[0];
        if(firstChar !== '/')return;
        let firstWord = splited[0].substr(1);
        if(!this.services[firstWord])return;
        let service = this.services[firstWord];
        
        let secondWord = splited[1];
        let commands = service.commands();
        if(!secondWord || !commands[secondWord]){
            if(!commands["default"]){
                console.error("Command not found");
                return;
            }
            secondWord = "default";
        }

        return commands[secondWord]
                    .call(service, message)
                    .catch(er => console.error(er));
    }

    private handleReactionSent(message : MessageReactionInfo){
        Object.keys(this.services).map(k => this.services[k].reactions(message));

    }

    private handleEvent(message : EventInfo){
        Object.keys(this.services).map(k => this.services[k].events(message));
    }
    
}