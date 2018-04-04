
import * as lowdb from 'lowdb';
import FileAdapter from 'lowdb/adapters/FileSync';

export default class ScoreService{

    private db : any;
    private scores : {};

    constructor(){
        const adapter = FileAdapter("db.json");
        this.db = lowdb(adapter);
        this.db.defaults({version : '1.0', 'threads' : this.scores})
                .write();
    }

    public incrementscore(threadId : string, userId : string) : void{
        if(!this.scores[threadId]){
            this.scores[threadId] = {};
        }

        if(!this.scores[threadId][userId]){
            this.scores[threadId][userId] = 0;
        }
        this.scores[threadId][userId]++;

    }

}