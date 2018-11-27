///////////////////////////////////////////////////////////////////////
// Software: ActionBotManager                                        //
// Version:  1.0                                                     //
// Date:     2018-11-21                                              //
// Author:   Haboubi Anis                                            //
// Licence:  Copyright © 2018-2020, All Rights Reserved.             //
// Description:  Bot twitter pour Keysource                          //
///////////////////////////////////////////////////////////////////////
var Twit = require('twit')
var colors= require("colors");
var debug=false;
var T = new Twit({
    consumer_key:         ''
  , consumer_secret:      ''
  , access_token:         ''
  , access_token_secret:  ''
})

//
//  tweet 'hello world!'
//
// T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
//   console.log(data)
// })
// This is the URL of a search for the latest tweets on the #hashtag.
var hastagSearch = { q: ["#blockchain,#bitcoin,#crypto"], count: 10, result_type: 'popular',lang:'fr' }

//Promises

// Mention
var mention= new Promise((resolve,reject)=>{
  T.get('statuses/mentions_timeline', { count: 25 },  (err,data)=> {
        if(!err){
          resolve(data);
        }else{
          reject(err);
        }
      })
  
})
// RetweetLatest
var retweetLatest= new Promise((resolve,reject)=>{
  var screen_table=["#blockchain,#bitcoin,#crypto"]
  screen_table.forEach(function(screen_row){
    var hastagSearch = { q: screen_row, count: 1000, result_type: 'recent',lang:'fr' }
    T.get('search/tweets', hastagSearch, (err, data)=> {
        if(!err){
          resolve(data);
        }else{
          reject(err);
        }
      })
    })
})

// RT Tweet Status timeline 
var retweetstatus= new Promise((resolve,reject)=>{
      T.get('search/tweets', hastagSearch, (err, data)=>  {
        if(!err){
          resolve(data);
        }else{
          reject(err);
        }
      })
})

// User Timeline
var user_timeline= new Promise((resolve,reject)=>{

  var screen_table=["Elsa_Trujillo_","bitcoinpointfr","CryptoFR","PowerHasheur","Bloch_R","BlocsNews","gregory_raymond","Pierr_Person","jfavier92300"]

  screen_table.forEach(function(screen_row){
      T.get('statuses/user_timeline', { screen_name: screen_row, count:7  }, (err, data)=> {
        if(!err){
          resolve(data);
        }else{
          reject(err);
        }
      })
    })
})

// favorited
var favorited= new Promise((resolve,reject)=>{
    T.get('search/tweets', hastagSearch, (err,data)=> {
        
        if(!err){
          resolve(data);
        }else{
          reject(err);
        }
      })
  
})



function Actionbot(){
  retweetLatest.then((data)=>{
    var tweets = data.statuses
    tweets.forEach(function(tweet){

    // ...then we grab the ID of the tweet we want to retweet...
    var retweetId = tweet.id_str
    // ...and then we tell Twitter we want to retweet it!
    var tweetuser=tweet.user;
      if(tweet.retweet_count>=40 && !tweet.retweeted_status && !tweet.favorited){

        T.post('statuses/retweet/' + retweetId, {}, tweeted)  
        console.log("#################" .green)
        console.log('I retweet a tweet:'+ tweet.text)
        console.log("#################" .green)

      }
      if(tweet.retweet_count>=70 && !tweetuser.following && !tweetuser.follow_request_sent && tweetuser.screen_name!="blocksroad"){

        T.post('friendships/create', {user_id:tweet.user.id_str,follow:true}, tweeted)  

        console.log("###########################################################" .green)
        console.log('I follow this user @'+tweetuser.screen_name+' --> '+tweetuser.name )
        console.log("###########################################################" .green)

      }
    })

  })



  // mention.then((data)=>{
  //   data.forEach(function(tweet){

  //     // Who is this in reply to?
  //     var reply_to = tweet.in_reply_to_screen_name
  //     // Who sent the tweet?
  //     var name = tweet.user.screen_name
  //     // What is the text?
  //     var txt = tweet.text

  //     // Ok, if this was in reply to me
  //     // Replace blocksroad with your own twitter handle
  //     console.log(tweet)
  //     if (reply_to === 'blocksroad') {

  //       // Get rid of the @ mention
  //       txt = txt.replace(/@blocksroad/g, '')

  //       // Start a reply back to the sender
  //       var reply = '@' + name + ' ' + ', Thanks for the mention :-)  Have a nice day !  42 is always the answer'
  //       console.log("#################" .yellow)
  //       console.log("I tweet the reply:"+reply)
  //       console.log("#################" .yellow)

  //       // Post that tweet!
  //       // T.post('statuses/update', { status: reply }, tweeted)
  //     }
  //   });
  // })



  user_timeline.then((data)=>{
    data.forEach(function(tweet){
      // console.log(tweet);
        var screen_table=["blockchain","bitcoin","crypto"]
        screen_table.forEach(function(raw){
          var filter = (tweet.text).indexOf(raw);
          if(filter!=-1){
            var tweet_id    = tweet.id_str;
            if(!tweet.retweeted){
              console.log("#################" .green)
              T.post('statuses/retweet',{ id:tweet_id }, tweeted);
              console.log('I was RT this tweet: '+ tweet.text)
              console.log("#################" .green)
            }
            if(!tweet.favorited){
              console.log("#################" .green)
              T.post('favorites/create', { id: tweet_id },tweeted);
              console.log('I was favorited this tweet: '+ tweet.text)
              console.log("#################" .green)

            }
          }
        })
    })

  })


// BUG
favorited.then((data)=>{
  // If our search request to the server had no errors...
  var tweets = data.statuses
  tweets.forEach(function(tweet){
    // console.log(tweet)
    if (!tweet.retweeted  && !tweet.favorited && tweet.user.screen_name!="blocksroad" || !tweet.retweeted_status) {


      // ...then we grab the ID of the tweet we want to retweet...
      var retweetId = tweet.id_str
      var text = tweet.text
      // ...and then we tell Twitter we want to retweet it!
      T.post('favorites/create', { id: retweetId },tweeted);
        //Tweet Favoris!
        console.log("###########################" .green)
        console.log('I was favorited this tweet: '+ text)
        console.log("###########################" .green)

    }
  })

})
}



// Try to retweet something as soon as we run the program...
// retweetLatest()
// favorited();
// mention();
// user_timeline();
// ...and then every hour after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
// setInterval(retweetLatest, 1000 * 60 * 12)
Actionbot();
setInterval(function(){Actionbot()
 }, 1000 * 60 * 50);



//FUNCTION


// Make sure it worked!
function tweeted (err, reply) {
  if (err !== undefined) {
    console.log(err)
  } else {
    console.dir(reply)
  }
}

function favorited (){

    T.get('search/tweets', hastagSearch, function (error, data) {
      var tweets = data.statuses
      for (var i = 0; i < 1; i++) {
        // console.log(tweets[i].text)
      }
      // If our search request to the server had no errors...
      if (!error && data.statuses[0].retweeted==false && data.statuses[0].lang=="fr") {
        // ...then we grab the ID of the tweet we want to retweet...
        var retweetId = data.statuses[0].id_str
        var text = data.statuses[0].text
        console.dir(data);
        // ...and then we tell Twitter we want to retweet it!
        T.post('favorites/create', { id: retweetId },tweeted);
          //Tweet Favoris!
          console.log("###########################" .green)
          console.log('I was favorited this tweet: '+ text)
          console.log("###########################" .green)

      }
      // However, if our original search request had an error, we want to print it out here.
      else {
        if (debug) {
          console.log('There was an error with your hashtag search:', error)
        }
      }
    })


}

function user_timeline(){
  var screen_table=["Bloch_R","BlocsNews","gregory_raymond"]
  screen_table.forEach(function(screen_row){

    T.get('statuses/user_timeline', { screen_name: screen_row, count: 5 }, function(err, data, response) {
        if(!err){
          data.forEach(function(tweet){
            if(!tweet.retweeted_status && !tweet.favorited){
              var screen_table=["blockchain","bitcoin","crypto"]
              screen_table.forEach(function(raw){
                var filter = (tweet.text).indexOf(raw);
                if(filter!=-1){
                  console.log("#################" .green)
                  // console.log(tweet);
                  var tweet_id    = tweet.id_str;
                  T.post('favorites/create', { id: tweet_id },tweeted);
                    //Tweet Favoris!
                  console.log('I was favorited this tweet: '+ tweet.text)
                  console.log("#################" .green)
                }
              })
            }
          })
        }
    })
  })

}
function retweetstatus () {
  T.get('search/tweets', hastagSearch, function (error, data) {
    var tweets = data.statuses
    for (var i = 0; i < tweets.length; i++) {
      console.log(tweets[i].text)
    }
    // If our search request to the server had no errors...
    if (!error) {
      // ...then we grab the ID of the tweet we want to retweet...
      var retweetId = data.statuses[0].id_str
      // ...and then we tell Twitter we want to retweet it!
      T.post('statuses/retweet/' + retweetId, {}, tweeted)
    }
    // However, if our original search request had an error, we want to print it out here.
    else {
      if (debug) {
        console.log("#################" .red)
        console.log('There was an error with your hashtag search:', error)
        console.log("#################" .red)

      }
    }
  })
}

// This function finds the latest tweet with the #hashtag, and retweets it.
function retweetLatest () {
  var screen_table=["#blockchain,#bitcoin,#crypto"]
  screen_table.forEach(function(screen_row){
  var hastagSearch = { q: screen_row, count: 1000, result_type: 'recent',lang:'fr' }

    T.get('search/tweets', hastagSearch, function (error, data) {
      var tweets = data.statuses
      for (var i = 0; i < tweets.length; i++) {
        console.log(tweets[i].text)

      }
      // If our search request to the server had no errors...
      if (!error) {
        // ...then we grab the ID of the tweet we want to retweet...
        var retweetId = data.statuses[0].id_str
        // ...and then we tell Twitter we want to retweet it!
        if(data.statuses[0].retweet_count>=100){
        T.post('statuses/retweet/' + retweetId, {}, tweeted)  
        console.log("#################" .green)
        console.log('I retweet a tweet:'+data.statuses[0].text)
        console.log("#################" .green)

        }
      }
      // However, if our original search request had an error, we want to print it out here.
      else {
        if (debug) {
          console.log("############################################" .red)
          console.log('There was an error with your hashtag search:', error)
          console.log("#############################################" .red)

        }
      }
    })
  })
}

