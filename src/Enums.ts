
export enum LogLevel{
    Silly = "silly",
    Verbose = "verbose",
    Info = "info",
    Http = "http",
    Warn = "warn",
    Error = "error",
    Silent = "silent"
}

export enum MessageType{
    Message = "message",
    Event = "event",
    Typ =  "typ",
    Read = "read",
    ReadReceipt = "read_receipt",
    MessageReaction = "message_reaction",
    Presence = "presence"
}

export enum AttachmentType{
    Sticker = "sticker",
    File = "file",
    Photo = "photo",
    AnimatedImage = "animated_image",
    Video = "video",
    Audio = "audio",
    Share = "share"
}

export  enum LogMessateType{
    Subscribe = "log:subscribe",
    Unsubscribe = "log:unsubscribe",
    ThreadName = "log:thread-name",
    ThreadColor = "log:thread-color",
    ThreadIcon = "log:thread-icon",
    UserNickname = "log:user-nickname"
}

export enum PresenceStatus{
    Idle = 0,
    Online = 2
}

export enum Reaction{
    Love = ":love:",
    Haha = ":haha:",
    Wow = ":wow:",
    Cry = ":cry:",
    Angry = ":angry:",
    Like = ":like:",
    DisLike = ":dislike:"
}