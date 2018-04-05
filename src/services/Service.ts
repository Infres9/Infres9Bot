import {FacebookChatApi, ThreadInfo, MessageInfo, MessageReactionInfo, EventInfo} from '../FacebookChatApi'

export default interface Service{

    commands() :{[key : string] : (info : MessageInfo) => boolean};

    reactions(reaction : MessageReactionInfo) : any;

    events(event : EventInfo) : any;
}