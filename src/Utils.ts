

/**
 * Turns a date from a date object to 'HH:mm'
 * @param date the date to translate
 */ 
export function toReadableMinutes(date : Date) : string{
    let seconds = date.getSeconds();
    let secondsStr = seconds < 10 ? "0" + seconds : "" + seconds;
    return `${date.getMinutes()}:${secondsStr}`;
}

/**
 * turns a date object to readable minutes (mm:ss)
 * @param date the date to translate
 */
export function toReadableTime(date : Date) : string{
    let minutes : number = date.getMinutes();
    let seconds = date.getSeconds();
    let minutesStr = minutes < 10 ? "0" + minutes : "" + minutes;
    return `${date.getHours()}h${minutesStr}`;
}

/**
 * wether a given string represent a time
 * @param str the string to test (<HH>h<MM>)
 */
export function isTime(str : string) : boolean{
    return /^([01]?[0-9]|2[0-3])h[0-5]?[0-9]$/i.test(str);
}

/**
 * a number to a rank (1 => 1er, otherwise eme)
 * @param rank the rank number (positive number)
 */
export function toRank(rank : number) : string{
    return rank == 1 ? "1er" : rank + "eme";
}

/**
 * Handle the plural of points
 * @param points number of points (positive number)
 */
export function toPoints(points : number) : string{
    return points == 1 ? "1 point" : points + " points";
}

/**
 * split a string (hh:mm) to an array containing
 * the hours and the minutes
 * @param str string to split
 */
export function splitTime(str : string) : number[]{
    return str.split(/h/ig).map(x=>+x);
}

/**
 * the time distance between two date
 * @param dateBase first date
 * @param dateTest second date
 */
export function distBetween(dateBase : Date, dateTest : Date) : number{
    return Math.abs(dateBase.getTime() - dateTest.getTime());
}