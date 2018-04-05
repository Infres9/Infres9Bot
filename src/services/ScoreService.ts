
import * as lowdb from 'lowdb';
import * as FileAdapter from 'lowdb/adapters/FileSync';

interface ThreadScore{
    [key : string] : {[key : string] : number}
}

interface ServiceData{
    version : string,
    threads : ThreadScore
}

export class ScoreService{

    private db : any;
    private scores : ServiceData;

    constructor(){
        const adapter = new FileAdapter("db.json");
        this.db = lowdb(adapter);
        this.db.defaults({version : '1.0', 'threads' : {}})
                .write();
        this.scores = {
            version : this.db.get('version').value(),
            threads : this.db.get('threads').value()
        };
    }

    public getScores(threadId : string) : {[key: string] : number}{
        return this.scores.threads[threadId] || {};
    }

    public incrementscore(threadId : string, userId : string, increment : number = 1) : number{
        let scores = this.scores.threads;
        if(!scores[threadId]){
            scores[threadId] = {};
        }

        if(!scores[threadId][userId]){
            scores[threadId][userId] = 0;
        }
        return scores[threadId][userId] += increment;
    }

    public flush() : void{
        this.db.set('threads', this.scores.threads).write();
    }

}