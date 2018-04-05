import {FacebookChatApi, ThreadInfo, MessageInfo, MessageReactionInfo, EventInfo} from '../FacebookChatApi'

export default interface Service{

    commands() :{[key : string] : (info : MessageInfo) => boolean};

    reactions() : {[key : string] : (info : MessageReactionInfo) => boolean};

    events() : {[key : string] : (info : EventInfo) => boolean};
}