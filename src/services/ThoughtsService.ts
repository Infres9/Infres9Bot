import Service from "./Service";
import { IncomingMessage } from "http";
import { get } from "https";

export default class ThoughtsService implements Service {

    private quotes : any[] = null;

    constructor(private api : FacebookChatApi){
    }

    commands(): { [key: string]: (info: MessageInfo) => Promise<boolean>; } {
        return {
            "default" : this.thought
        };
    }
    reactions(reaction: MessageReactionInfo) {
    }
    
    events(event: EventInfo) {
    }

    public async thought(message : MessageInfo): Promise<boolean>{
        if(this.quotes  == null){
            let data =  await new Promise<any>(solver => {
                get('https://www.reddit.com/r/showerthoughts.json', (res) => {
                    let data = '';
                    res.on("data", recv => data += recv.toString());
                    res.on("end", () => {
                        solver(JSON.parse(data));
                    });
                }).end();
            });
            this.quotes = data.data.children;
        }
        let randomQuote = this.quotes[Math.floor(Math.random()*this.quotes.length)];
        await this.api.sendMessage("_" + randomQuote.data.title + "_ - " + randomQuote.data.author, message.threadID);
        return true;
    }
}