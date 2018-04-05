import {FacebookChatApi, ThreadInfo, UserInfo} from '../FacebookChatApi'

interface UserData{
    [key : string] : string
}

interface ThreadData{
    [key : string] : UserData
}

export class UserService{   

    private threads : ThreadData;

    constructor(private api : FacebookChatApi){
        this.threads = {};
    }

    public async getUserNames(threadID : string, userIds : string[]) : Promise<{[key : string] : string}>{
        if(!this.threads[threadID]) {//get nicknames
            let thInfo = await this.threadInfoPromise(threadID);
            this.threads[threadID] = thInfo.nicknames;
        }
        let res  = {};
        for(let id of userIds){
            if(!this.threads[threadID][id]){
                let userInfo = await this.userInfoPromise(id);
                this.threads[threadID][id] = userInfo.name;
            }
            res[id] = this.threads[threadID][id];
        }
        return new Promise<{[key : string] : string}>(solver => solver(res));
    }

    public async getUserName(threadID : string, userId : string) : Promise<string>{
        if(!this.threads[threadID]) {//get nicknames
            let thInfo = await this.threadInfoPromise(threadID);
            this.threads[threadID] = thInfo.nicknames;
        }
        if(!this.threads[threadID][userId]){//get name
            let userInfo = await this.userInfoPromise(userId);
            this.threads[threadID][userId] = userInfo.name;
        }
        
        return new Promise<string>(solver => solver(this.threads[threadID][userId]));
    }

    public async updateUserNames(threadID : string) : Promise<void>{
            const infos : ThreadInfo = await this.threadInfoPromise(threadID);
            this.threads[threadID] = infos.nicknames;
    }


    public userName(threadID : string, userID : string) : string{
        if(!this.threads[threadID])return "Unkown thread";
        if(!this.threads[threadID][userID])return "Unkown user";
        return this.threads[threadID][userID];
    }

    private threadInfoPromise(threadID : string) : Promise<ThreadInfo>{
        return new Promise((solver : (info : ThreadInfo) => void)  => {
            this.api.getThreadInfo(threadID, (err, info) => solver(info) );
        });
    }

    private userInfoPromise(userId : string) : Promise<UserInfo>{
        return new Promise(solver => {
            this.api.getUserInfo(userId, (err,info) => solver(info))
        });
    }
}