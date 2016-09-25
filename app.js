"use strict";
var Twit = require('twit');
const util = require('util'); 
const tokens  = require('./tokens.json');
const riddles  = require('./riddles.json');



var MAIN_ACCOUNT = "DavPointLi";
var client = new Twit(tokens);
console.log("//Booting...");


/** lib **/

function removeMention(str){
	var tweetArray=str.split(" ");
	tweetArray.some(function(each, index){
		if(each[0]=="@"){
			tweetArray.splice(0, index+1);
		}
	});
	return 	tweetArray.join(" ");
}

function truncate140(inputString,mention){
    var lastString=inputString;
    var arrayString=[];
    while(lastString.length>140){
        console.log("While");
        var trimmedString = lastString.substr(0, 140-mention.length);
        trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
        console.log(trimmedString);
        arrayString.push(mention+" "+trimmedString);
        lastString=lastString.substr(trimmedString.length,lastString.length);
    }
    arrayString.push(mention+" "+lastString);
    return arrayString;
    
}

function oneOf(arrayRandom){
	return arrayRandom[Math.floor(Math.random()*arrayRandom.length)];
}


/****/


function tweet(data){
    client.post('statuses/update', data, function(err, data, response) {
      if(err){
          console.log('error when sending tweet', err);
          console.log('tweet :', data.user.screen_name, data.text);
      }else{
          console.log('tweet ->', data.user.screen_name, data.text);
      }
    });
}


function game(){
    var riddle=riddles[Math.floor((Math.random()*parseInt(Object.keys(riddles).length)))];
    console.log(util.inspect(riddle));
    
    tweet({status: "New #EmojiRiddle:\r"+riddle[1]});
    
    
    var stream = client.stream("user", {"with": "user"});
    stream.on("tweet", function(data) {
        if(!data.text || data.retweeted_status || !data.user || data.user.screen_name === MAIN_ACCOUNT){
            return;
        }
        console.log('tweet <-', data.user.screen_name, data.text);
        if(removeMention(data.text)==riddle[0]){
            tweet({
              status: "@"+data.user.screen_name+" GG !",
              in_reply_to_status_id: data.id_str
            });
            this.stop();
        }else{
            console.log(removeMention(data.text)+"!="+riddle[0]);
        }


    });
}



game();

console.log("//Booted");