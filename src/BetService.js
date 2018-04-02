
function isTime(str){
    return /^([01]?[0-9]|2[0-3])h[0-5]?[0-9]$/i.test(str);
}

function toHoursMinutes(str){
    return str.split(/h/ig).map(x=>+x);
}

function isInRange(date1, date2){
    return (new Date( Math.abs(date1 - date2) )).getMinutes() < 1;
}

function toReadableTime(date){
    let minutes = date.getMinutes();
    if(minutes < 10) minutes = "0"+ minutes;
    return `${date.getHours()}h${minutes}`;
}

module.exports = class{

    constructor(api){
        this.bets = {};
        this.api = api;
    }

    sendMessage(str, threadId){
        return this.api.sendMessage(str, threadId);
    }

    start(message){
        let betState = this.bets[message.threadID];
        if(betState)return this.sendMessage("Les paris ont déjà commmencés !", message.threadID);

        var time = new Date();
        this.bets[message.threadID] =  {starting : time, players : {}};
        
        return this.sendMessage("Les paris sont ouverts !", message.threadID);
    }

    help(message){
        let helpMessage = `Gestionnaire de paris
Pariez avec la commande '/bet do {time}'
'Time' peut être le nombre de minutes depuis le lancement du paris
Ou une heure exacte (10h11) par ex.
Si le format du paris n'est pas bon, vous en êtes informés
Sinon, le bot mettra un pouce sur votre message pour indiquer
que le paris a bien été pris en compte`;
        this.sendMessage(helpMessage, message.threadID);
    }

    stats(message){
        let betState = this.bets[message.threadID];
        if(!betState)return this.sendMessage("Les paris n'ont pas commencé", message.threadID);
        
        let stats = ["Statistiques :"];
        let plrs = betState.players;
        let keys = Object.keys(plrs);

        if(!keys.length){
            stats.push("Personne n'a parié");
        }else{
            keys.map(p => {
                p = plrs[p];
                stats.push(`${p.name} a parié ${toReadableTime(p.bet)}`);
            });
        }
        return this.sendMessage(stats.join('\n'), message.threadID);
    }



    end(message){
        let endTime = new Date();
        let betState = this.bets[message.threadID];
        if(!betState)return this.sendMessage("Les paris n'ont pas commencé", message.threadId);
        
        let winners = [`Résultats (${toReadableTime(betState.starting)}):`];
        let mentions = [];
        Object.keys(betState.players).map(k => {
            let time = betState.players[k].bet;
            let tag = "@" + (betState.players[k].name || "Unknown");
            mentions.push({tag : tag, id : k});
            if(isInRange(time, betState.starting)){
                winners.push(`${tag}(${toReadableTime(time)}) : GAGNANT`);
            }else{
                winners.push(`${tag}(${toReadableTime(time)}) : PERDU`);
            }
        });
        this.sendMessage({body : winners.join('\n'), mentions : mentions}, message.threadID);

        return (delete this.bets[message.threadID]);
    }

    do(message){
        let betState = this.bets[message.threadID];
        if(!betState)return this.sendMessage("Les paris ne sont pas ouverts!", message.threadID);

        let senderId = message.senderID;
        let bet = message.body.split(' ')[2];
        if(!bet)return;

        let betTime = new Date(betState.starting);
        if(isTime(bet)){
            let hm = toHoursMinutes(bet);
            betTime.setHours(hm[0], hm[1], 0, 0);
        }else if(!isNaN(bet|0)){
            betTime.setMinutes(betTime.getMinutes() + (bet|0));
        }else{
            return this.sendMessage(`Paris incorrect : ${bet}`, message.threadID);
        }

        betState.players[senderId] = betState.players[senderId] || {};
        betState.players[senderId].bet = betTime;
        return this.api.getThreadInfo(message.threadID, (err, ret) => {
            if(err)return console.error(err);
            let nicknames = ret.nicknames || {};
            if(!nicknames[senderId]){
                return this.api.getUserInfo(senderId, (err, userData) => {
                    if(err)return console.error(err);
                    betState.players[senderId] = (userData[senderId]||{}).name || "Inconnu";
                    return this.api.setMessageReaction(':like:', message.messageID);
                });
            }

            betState.players[senderId].name = nicknames[senderId];
            return this.api.setMessageReaction(':like:', message.messageID);
        });
    }
}