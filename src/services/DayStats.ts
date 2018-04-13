import { currentId } from "async_hooks";


export default class DayStats {

    private stats  : {
        [key : string] : {
            currentDay : Date,
            currentValue : Date
        }
    };

    constructor(){
        this.stats = {};
    }

    private isSameDay(day1 : Date, day2 : Date) : boolean{
        return day1.getDate() == day2.getDate() &&
                day1.getMonth() == day2.getMonth() && 
                day1.getFullYear() == day2.getFullYear();
    }

    public addTime(threadID : string, increment : Date) : void{
        if(!this.stats[threadID]) this.stats[threadID] = {currentDay : new Date(), currentValue : new Date(0)};

        let addingTime = new Date();
        let mDay = this.stats[threadID].currentDay;
        if(!this.isSameDay(addingTime, mDay)){//store ?
            this.stats[threadID].currentDay = addingTime;
            this.stats[threadID].currentValue = new Date(0);
        }
        this.stats[threadID].currentValue = new Date(this.stats[threadID].currentValue.getTime() + increment.getTime());
    }

    public getTodaysTime(threadID : string) : Date{
        return this.stats[threadID].currentValue || new Date(0);
    }
}