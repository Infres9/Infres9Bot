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

    public updateUserNickname(threadID : string, userId : string, nwNickname : string){
        if(!this.threads[threadID])this.threads[threadID] = {};
        this.threads[threadID][userId] = nwNickname;
    }

    public async getUserNames(threadID : string, userIds : string[]) : Promise<{[key : string] : string}>{
        if(!this.threads[threadID]) {//get nicknames
            let thInfo = await this.threadInfoPromise(threadID);
            this.threads[threadID] = thInfo.nicknames;
        }
        let res  = {};
        let names = await this.usersInfosPromise(userIds);
        for(let id of userIds){
            if(!this.threads[threadID][id]){
                this.threads[threadID][id] = names[id].name;
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
            console.log(userInfo);
            this.threads[threadID][userId] = userInfo.name;
        }
        
        return new Promise<string>(solver => solver(this.threads[threadID][userId]));
    }

    private threadInfoPromise(threadID : string) : Promise<ThreadInfo>{
        return new Promise((solver : (info : ThreadInfo) => void)  => {
            this.api.getThreadInfo(threadID, (err, info) => solver(info) );
        });
    }

    private usersInfosPromise(userIds : string[]) : Promise<{[key : string] : UserInfo}>{
        return new Promise(solver => {
            this.api.getUserInfo(userIds, (err,info) => solver(info));
        });
    }

    private userInfoPromise(userId : string) : Promise<UserInfo>{
        return new Promise(solver => {
            this.api.getUserInfo(userId, (err,info) => solver(info[userId]))
        });
    }
}