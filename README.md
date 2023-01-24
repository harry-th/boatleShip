### This code is a far inferior than the refactored BoatleShip 2 but is here for a reference for it as it was essentially functional.
# BoatleShip  
** An enhanced battleship game **  
*that also requires a refactor and to rethink the server client relationship to maintain game integrity*  

Three character:  
### line:  
1. can fire the last two shots fired at him *overwrite orange ability*  
2. connect any two misses that are unobstructed in between by shots by you or your opponent on your home board(the one that contains your ships)  
### orange:  
1. protects the last square that he fired at, this square cannot be targeted by the opponent on the subsequent turn  
2. can 'bluff' when doing so you do not receive any information about the success or failure of your shots, although you can still protect squares with your first ability, for each shot fired by the opponent you add a stack of retaliation which can be activated to return 3 shots for each sent by your opponent  
*this also undoes the shots were done during the bluff*
*additionally there is a mechanic to 'call their bluff' which if done correctly (when the opponent is bluffing) set those shots done during the bluff as real but disengages retaliation.*  
*if you're thinking 'this is too complicated' you are correct*  
### corner:  
1. can place his boats around corners  
2. if you hit the head and rear of any boat the boat is sunk instantly  

## Other rules  
1. Every fourth turn each player receives an additional second shot for their turn, they can use their abilities twice on these turns except retaliation and 'make line.'  
2. When a bluff is called falsely, (they were not bluffing) on top of losing your turn your 'free shot' which you would generally receive on your fourth turn is consumed.  

##To try out this project  
Git clone the repo https://github.com/harry-th/boatleShip  
`npm i` to install the depdencies  
`ws`  
`node`  
`randomString`  
`react-cookie`  
`jose`  
and then  
`npm start` to run the client on localhost 3000  
`node server.js` within the `src` directory will run the websocket server  
You can now play with yourself between a browser on chrome and any other (if you have a second browser installed)
or between chrome and an incognito window  
I do have it hosted and plan to refine it   
