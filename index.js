
const login = require("facebook-chat-api");
const BetService = require('./src/BetService');
const config = require('./config');

const services = {};

login({email: config.FACEBOOK_MAIL, password: config.FACEBOOK_PWD}, (err,api) => {
    if(err) return console.error(err);

    services["bet"] = new BetService(api);
    api.listen(receiveMessage);
});

function getService(str){
    let first = str.split(' ')[0];
    let isValid = (!!first) && 
            first[0] == '/' && 
            Object.keys(services).some(s => s === first.substr(1));
    if(!isValid)return null;
    return services[first.substr(1)];
}


function receiveMessage(err, message){
    if(err)return console.error(err);

    let service = getService(message.body);
    if(service){
        var fnName = message.body.split(' ')[1];
        if(!fnName || !service[fnName])return;
        try{
            let res = service[fnName](message);
        }catch(ex){
            console.error("Failed to execute command " + message.body);
            console.error(ex.message);
        }
    }
}