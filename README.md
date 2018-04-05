# Infres9Bot

Bot used for various things in messenger.
Before being able to use this bot, you must set the `FACEBOOK_MAIL` environnement variable end `FACEBOOK_PWD`, these two variables will be used to connect the bot to facebook 

Betting
-------

Bet about the time it will take for something to happen (like how much time one takes to go somewhere ...)

The commands are the following :

`/bet start` : to start a new betting session

`/bet finish` : to finish a betting session

`/bet do (number|time)` bet on the time it will take (or input directly the time of the end)

`/bet palmares` : see who's got the most point out of all the betting sesions

So let's take an example to see how to use this betting system. Say one goes somewhere, and you and your friend want to bet on how much it will take for this person to do the trip. You first need to start the betting session, to indicate the departure time of the person. Then, you must bet within 2 minutes (otherwise you can change your bet forever, and that would be cheating!). You can change your bet before the 2 minutes time limit. When the personn is back, finish the bet session. The rank is based on how close the bet is to the arrival time.

Have fun !


Credits
-------
[facebook-chat-api](https://github.com/Schmavery/facebook-chat-api)

[lowdb](https://github.com/typicode/lowdb)


Licence
-------
MIT Licence
