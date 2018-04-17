
//<reference=path="types/FacebookChatApi.d.ts">

import * as login from 'facebook-chat-api';
import * as path from 'path';
import {MessageType} from './Enums';
import Messenger from './Messenger';

//Express part
import * as express from 'express';
import * as http from 'http';

const publicDir = path.join(__dirname, '../front/dist');
const app = express();
const msg = new Messenger(login);

app.get('/', (req, res )=> {
    res.sendFile(path.join(publicDir, 'index.html'));
});
app.use(express.static(publicDir));
app.post('/bot/restart',  (req, res, next) => {
    msg.reload()
        .then(() => {
            res.send({'success' : true});
        })
        .catch((err) => {
            res.send({'sucess' : false, err: err});
        });
});

app.use((req,res, next)=>{
    next();
});

const server = http.createServer(app);
server.listen(3000);
server.on('listening', () => {
    console.log('listening !');
})