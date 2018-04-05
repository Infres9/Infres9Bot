import Service from './Service';
import {Reaction} from '../Enums'
import {FacebookChatApi, Mention, SentMessage, EventInfo, MessageReactionInfo, MessageInfo} from '../FacebookChatApi'
import {ScoreService}  from './ScoreService';
import {UserService} from './UserService';

export default class BetService implements Service{

    private bets : {};
    private scores : ScoreService;
    private nicknames : UserService

    constructor(private api : FacebookChatApi){
        this.bets = {};
        this.api = api;
        this.scores = new ScoreService();
        this.nicknames = new UserService(api);
    }
    
    public events() : {[key : string] : (info : EventInfo) => boolean}{
        return {};
    }

    public reactions() : {[key : string] : (info  : MessageReactionInfo) => boolean}{
        return {};
    }

    /**
     * list all the possible function that can be calle
     */
    public commands() : {[key : string] : (info : MessageInfo) => boolean}{
        return {"start" : this.start, 
                "help" :  this.help,
                "finish" : this.finish,
                "stop" : this.finish,
                "end" : this.finish,
                "stats" : this.stats,
                "do" : this.doBet,
                "bet" : this.doBet,
                "scores" : this.palmares,
                "palmares" : this.palmares,
            };
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

    private toReadableMinutes(date : Date) : string{
        let seconds = date.getSeconds();
        let secondsStr = seconds < 10 ? "0" + seconds : "" + seconds;
        return `${date.getMinutes()}:${secondsStr}`;
    }

    private toReadableTime(date : Date) : string{
        let minutes : number = date.getMinutes();
        let seconds = date.getSeconds();
        let minutesStr = minutes < 10 ? "0" + minutes : "" + minutes;
        return `${date.getHours()}h${minutesStr}`;
    }

    private sendMessage(str : string|SentMessage, threadId : string) : void{
        return this.api.sendMessage(str, threadId);
    }

    private distFrom(dateBase : Date, dateTest : Date) : number{
        return Math.abs(dateBase.getTime() - dateTest.getTime());
    }

    public start(message : MessageInfo) : boolean{
        let betState = this.bets[message.threadID];
        if(betState){
            this.sendMessage("Les paris ont déjà commmencés !", message.threadID);
            return false;
        }

        var time = new Date();
        this.bets[message.threadID] =  {starting : time, players : {}, finished : false};
        
        this.sendMessage("Les paris sont ouverts vous avez 2 minutes pour parier !", message.threadID);
        setTimeout(() => {
            if(this.bets[message.threadID]){
                this.sendMessage("Fin des paris", message.threadID);
                this.bets[message.threadID].finished = true;
            }
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

    public palmares(message) : boolean{
        let scores = this.scores.getScores(message.threadID);

        this.nicknames.getUserNames(message.threadID, Object.keys(scores))
                    .then(names => {
                        let palmares = ["Palmares :", ...
                            Object.keys(names)
                            .map(k => ({name : names[k], score : scores[k]}))
                            .sort((a,b) => b.score - a.score)
                            .map((k,i) => `${this.toRank(i+1)}- ${k.name} (${this.toPoints(k.score)})`)
                        ];
                        this.sendMessage(palmares.join("\n"), message.threadID);
                    })
                    .catch(err => console.error(err));
        return true;
    }

    public stats(message : MessageInfo) : boolean{
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

    public finish(message : MessageInfo) : boolean{
        let endTime = new Date();
        let betState = this.bets[message.threadID];
        if(!betState){
             this.sendMessage("Les paris n'ont pas commencé", message.threadID);
             return false;
        }

        let mentions : Mention[] = [];
        let timeGap = new Date(endTime.getTime() - betState.starting.getTime());
        let formattedTime = this.toReadableMinutes(timeGap);

        let winners = [`Résultats (${this.toReadableTime(betState.starting)}-${this.toReadableTime(endTime)} : ${formattedTime}):`,...        
            Object.keys(betState.players).map(k => {
                let data = betState.players[k];
                let tag = `@${data.name}`;
                mentions.push({tag : tag, id : k});
                return {id : k, name : data.name, bet : data.bet, score : this.distFrom(data.bet, endTime)};
            })
            .sort((a,b) => a.score - b.score)
            .map((p,i, arr) => {
                this.scores.incrementscore(message.threadID, p.id, arr.length - i);
                return `${this.toRank(i+1)}- @${p.name} (${this.toReadableTime(p.bet)}) : ${this.toPoints(arr.length - i)}`
            })
        ];
        this.scores.flush();

        this.sendMessage({body : winners.join('\n'), mentions : mentions}, message.threadID);

        return (delete this.bets[message.threadID]);
    }

    public doBet(message : MessageInfo) : boolean{
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
        this.nicknames.getUserName(message.threadID, message.senderID)
                        .then(s => {
                            betState.players[senderId].name = s;
                            this.api.setMessageReaction(Reaction.Like, message.messageID);
                        })
                        .catch(ex => console.error(ex));
        return true;
    }
}