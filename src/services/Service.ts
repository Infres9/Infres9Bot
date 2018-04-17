
export default interface Service{

    commands() :{[key : string] : (info : MessageInfo) => Promise<boolean>};

    reactions(reaction : MessageReactionInfo) : any;

    events(event : EventInfo) : any;
}