
import {LogLevel, 
        AttachmentType, 
        MessageType, 
        LogMessateType,
        PresenceStatus,
        Reaction} from './Enums';

/**
 * Credentials for the login
 */
interface Credentials{
    email : string;
    password : string;
}

interface Options{
    logLevel? : LogLevel;
    selfListen? : boolean;
    listenEvents? : boolean,
    pageId? : number,
    updatePresence? : boolean,
    forceLogin? : boolean
}

interface ThreadInfo{
    threadId : number,
    participantsIDs : string[],
    name : string;
    nicknames : {[key:string] : string}|null,
    unreadCount : number,
    messageCount : number,
    imageSrc : string|null,
    isGroup : boolean,
    isSubscribed : boolean,
    emoji : string,
    color : string,
    adminIDs : string[]
}

interface UserInfo{
    name : string,
    firstName : string,
    vanity : string,
    thumbSrc : string,
    profileUrl : string,
    gender : string,
    isFriend : boolean,
    isBirthday : boolean,
    searchTokens : string,
    alternateName : string
}


interface StickerAttachment{
    type : AttachmentType.Sticker,
    ID : string,
    url : string,
    packID : string,
    spriteUrl : string,
    spriteUrl12x : string,
    width : number,
    height : number,
    caption : string,
    description : string,
    frameCount : number,
    frameRate : number,
    framesPerRow : number,
    framesPerCol : number
}

interface FileAttachment{
    type : AttachmentType.File
    ID : string,
    filename : string,
    url : string,
    isMalicious : boolean,
    contentType : string
}

interface PhotoAttachment{
    type : AttachmentType.Photo,
    ID : string,
    filename : string,
    thumbnailUrl : string,
    previewUrl : string,
    previewWidth : number,
    previewHeight : number,
    largePreviewUrl : string,
    largetPreviewWidth : number,
    largetPreviewHeight : number
}

interface AnimatedImageAttachment{
    type : AttachmentType.AnimatedImage,
    ID : string,
    filename : string,
    previewUrl : string,
    previewWidth : number,
    previewHeight : number,
    url : string,
    width : number,
    height : number
}

interface VideoAttachment{
    type : AttachmentType.Video,
    ID : string,
    filename : string,
    previewUrl : string,
    previewWidth : number,
    previewHeight: number,
    url : string,
    width : number,
    height : number,
    duration : number,
    videoType : string
}

interface AudioAttachment{
    type : AttachmentType.Audio,
    ID : string,
    filename : string,
    audioType : string,
    duration : number,
    url : string,
    isVoiceMail : boolean
}

interface ShareAttachment{
    type : AttachmentType.Share,
    ID : string,
    url : string,
    title : string,
    description : string,
    source : string,
    image : string,
    width : number,
    height : number,
    playable : string,
    duration : number,
    playableUrl : string,
    subattachments : object,
    properties : object
}

type Attachment = StickerAttachment | FileAttachment | PhotoAttachment | AnimatedImageAttachment | VideoAttachment | AudioAttachment | ShareAttachment;

interface MessageInfo{
    type : MessageType.Message,
    attachment : Attachment
    body : string,
    isGroup : boolean,
    mentions : {[key : string] : string},
    messageID : string,
    senderID : string,
    threadID : string,
    isUnread : boolean,
}


interface EventInfo{
    type : MessageType.Event,
    author : string,
    logMessageBody : string,
    logMessageData : any,
    logMessageType : LogMessateType,
    threadID : string,
}

interface TypInfo{
    type : MessageType.Typ,
    from : string,
    fromMobile : boolean,
    isTyping : boolean,
    threadID : string,
}

interface ReadInfo{
    type : MessageType.Read,
    threadID : string,
    time : Date
}

interface ReadReceiptInfo{
    type : MessageType.ReadReceipt,
    reader : string,
    threadID : string,
    time : Date
}

interface MessageReactionInfo{
    type : MessageType.MessageReaction,
    messageID : string,
    reaction : string,
    senderID : string,
    threadID :  string,
    timestamp : number,
    userID  : string
}

interface PresenceInfo{
    type : MessageType.Presence,
    statuses : PresenceStatus,
    timestamp : number,
    userID : string
}

interface Mention{
    tag : string,
    id : string
}

interface SentMessage{
    body? : string,
    sticker? : string,
    attachment? : any,
    url? : string,
    emoji? : string,
    mentions : Mention[]
}

interface SentMessageInfo{
    threadID : string,
    messageID : string,
    timestamp : number
}


type ListenInfo = MessageInfo | EventInfo | TypInfo | ReadInfo | ReadReceiptInfo | PresenceInfo | MessageReactionInfo;

interface FacebookChatApi{

    addUserToGroup(userId : string, threadId : string, callback? : (err) => any);

    getThreadInfo(threadId : string, callback? : (err,info : ThreadInfo) => any);

    getUserInfo(userId : string|string[], callback? : (err, info : {[key:string] :UserInfo}) => any);

    listen(callback : (err, info : ListenInfo) => void);

    logout(callack : (err) => void);

    markAsRead(threadID : string, callback? : (err) => void);

    sendMessage(message : string|SentMessage, threadID : string, callback? : (err, info : SentMessageInfo) => void);

    setMessageReaction(reaction : Reaction, messageID : string, callback? : (err) => void);

    setOptions(options : Options);
}