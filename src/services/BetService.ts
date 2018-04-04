import Service from './Service';
import {Reaction} from '../Enums'
import {FacebookChatApi, Mention, SentMessage} from '../FacebookChatApi'

export default class BetService implements Service{

    private bets : {};
    private api : FacebookChatApi;

    constructor(api : FacebookChatApi){
        this.bets = {};
        this.api = api;
    }

    public reactions() : {[key : string] : (any) => boolean}{
        return {};
    }

    /**
     * list all the possible function that can be calle
     */
    public commands() : {[key : string] : (any) => boolean}{
        return {"start" : this.start, 
                "help" :  this.help,
                "finish" : this.finish,
                "stop" : this.finish,
                "end" : this.finish,
                "stats" : this.stats,
                "do" : this.doBet,
                "bet" : this.doBet};
    }

    private toRank(rank : number) : string{
        return rank == 1 ? "1er" : rank + "eme";
    }

    private toPoints(points : number) : string{
        return points == 1 ? "1 point" : points + " points";
    }

    private isTime(str : string) : boolean{
        return /^([01]?[0-9]|2[0-3])h[0-5]?[0-9]$/i.test(str);
    }

    private static splitTime(str : string) : number[]{
        return str.split(/h/ig).map(x=>+x);
    }

    private toReadableTime(date : Date) : string{
        let minutes : number = date.getMinutes();
        let minutesStr = minutes < 10 ? "0" + minutes : "" + minutes;
        return `${date.getHours()}h${minutesStr}`;
    }

    private sendMessage(str : string|SentMessage, threadId : string) : void{
        return this.api.sendMessage(str, threadId);
    }

    private distFrom(dateBase : Date, dateTest : Date) : number{
        return Math.abs(dateBase.getTime() - dateTest.getTime());
    }

    public start(message) : boolean{
        let betState = this.bets[message.threadID];
        if(betState){
            this.sendMessage("Les paris ont déjà commmencés !", message.threadID);
            return false;
        }

        var time = new Date();
        this.bets[message.threadID] =  {starting : time, players : {}, finished : false};
        
        this.sendMessage("Les paris sont ouverts vous avez 2 minutes pour parier !", message.threadID);
        setTimeout(() => {
            this.sendMessage("Fin des paris", message.threadID);
            this.bets[message.threadID].finished = true;
        }, 2/*minutes*/ * 60/*seconds*/ * 1000/*ms*/);
        return true;
    }

    public help(message) : boolean{
        let helpMessage = `Gestionnaire de paris
Pariez avec la commande '/bet do {time}'
'Time' peut être le nombre de minutes depuis le lancement du paris
Ou une heure exacte (10h11) par ex.
Si le format du paris n'est pas bon, vous en êtes informés
Sinon, le bot mettra un pouce sur votre message pour indiquer
que le paris a bien été pris en compte`;
        this.sendMessage(helpMessage, message.threadID);
        return true;
    }

    public stats(message) : boolean{
        let betState = this.bets[message.threadID];
        if(!betState){
            this.sendMessage("Les paris n'ont pas commencé", message.threadID);
            return false;
        } 
        
        let players = betState.players;
        if(players.length === 0){
            this.sendMessage("Personne n'a parié", message.threadID);
            return true;
        }

        let stats = ["Statistiques :", ...
            Object.keys(players)
                .map(p => ({id : p, name : players[p].name, bet : players[p].bet}))
                .sort((a,b) => this.distFrom(a.bet, betState.starting) - this.distFrom(b.bet, betState.starting) )
                .map(p => `${p.name} => ${this.toReadableTime(p.bet)}`)
        ];
        this.sendMessage(stats.join('\n'), message.threadID);
        return true;
    }

    public finish(message) : boolean{
        let endTime = new Date();
        let betState = this.bets[message.threadID];
        if(!betState){
             this.sendMessage("Les paris n'ont pas commencé", message.threadId);
             return false;
        }

        let mentions : Mention[] = [];
        let winners = [`Résultats (${this.toReadableTime(endTime)}):`,...        
            Object.keys(betState.players).map(k => {
                let data = betState.players[k];
                let tag = "@" + (data.name || "Unknown");
                mentions.push({tag : tag, id : k});
                return {id : k, name : data.name, bet : data.bet, score : this.distFrom(data.bet, endTime)};
            })
            .sort((a,b) => a.score - b.score)
            .map((p,i, arr) => `${this.toRank(i+1)}- @${p.name} (${this.toReadableTime(p.bet)}) : ${this.toPoints(arr.length - i)}`)
        ];

        this.sendMessage({body : winners.join('\n'), mentions : mentions}, message.threadID);

        return (delete this.bets[message.threadID]);
    }

    public doBet(message) : boolean{
        let betState = this.bets[message.threadID];
        if(!betState){
            this.sendMessage("Les paris ne sont pas ouverts!", message.threadID);
            return false;
        }
        if(betState.finished){
            this.sendMessage("Les paris sont terminés", message.threadID);
            return false;
        }

        let senderId = message.senderID;
        let bet = message.body.split(' ')[2];
        if(!bet)return;

        let betTime = new Date(betState.starting);
        if(this.isTime(bet)){
            let hm = BetService.splitTime(bet);
            betTime.setHours(hm[0], hm[1], 0, 0);
        }else{
            let localTime = Number.parseInt(bet);
            if(Number.isNaN(localTime) || !Number.isFinite(localTime) || localTime > (60 * 20)){
                this.sendMessage(`Paris incorrect : ${bet}`, message.threadID);
                return false;
            }
            betTime = new Date(betTime.getTime() + localTime * 60000);
        }

        betState.players[senderId] = betState.players[senderId] || {};
        betState.players[senderId].bet = betTime;
        return this.api.getThreadInfo(message.threadID, (err, ret) => {
            if(err)return console.error(err);
            let nicknames = ret.nicknames || {};
            if(!nicknames[senderId]){
                return this.api.getUserInfo(senderId, (err, userData) => {
                    if(err)return console.error(err);
                    betState.players[senderId].name = (userData[senderId]||{}).name || "Inconnu";
                    return this.api.setMessageReaction(Reaction.Like, message.messageID);
                });
            }

            betState.players[senderId].name = nicknames[senderId];
            return this.api.setMessageReaction(Reaction.Like, message.messageID);
        });
    }
}