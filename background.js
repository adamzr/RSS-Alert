//Global object
var RN = {}
window.RN = RN;

//Interval that we use to check feeds
RN.interval = 30000;

//Maximum length of list of seen posts
RN.MAX_SEEN_LENGTH = 1000;

//Load the Google Feeds API
google.load("feeds", "1");

//Load the list of posts we've seen  
chrome.storage.sync.get("seen", function(items){
    if(items.seen){
        RN.seen = items.seen;
    } else {
        RN.seen = [];
    }
})

// Map of notification IDs to the URLs to open when they are clicked
RN.notificationToUrl = {};

//Add a post to the list of posts we've seen
function addSeen(id){
    RN.seen.push(id);
    while(JSON.stringify(RN.seen).length > chrome.storage.sync.QUOTA_BYTES_PER_ITEM){
        RN.seen.shift();
    }
    chrome.storage.sync.set({"seen": RN.seen});
}

//Load a list of feed URLs we're monitoring
chrome.storage.sync.get("feedURLs", function(items){
    if(items["feedURLs"]){
        RN.feedURLs = items["feedURLs"];
    } else if(localStorage["feedURLs"]){
        RN.feedURLs = JSON.parse(localStorage["feedURLs"]);
    } else {
        RN.feedURLs = [];
    }
})

//List of feeds
RN.feeds = [];

//Initialize the list of feeds
function initializeFeeds(){
    for(index in RN.feedURLs){
        RN.feeds.push(new google.feeds.Feed(RN.feedURLs[index]));
    }
}

//Add a feed to the list of feeds we are monitoring
function addFeed(feedURL){
    feedURL = feedURL.trim();
    RN.feeds.push(new google.feeds.Feed(feedURL));
    RN.feedURLs.push(feedURL);
    if(RN.feedURLs.length > 100000){
        RN.feedURLs.splice(0, RN.feedURLs.length - 100000);
    }
    chrome.storage.sync.set({"feedURLs": RN.feedURLs});
}

//Remove a feed from the list of feeds we are monitoring
function removeFeed(feedURL){
    RN.feedURLs = RN.feedURLs.filter(function(element){ return (element !== feedURL);});
    RN.feeds = RN.feeds.filter(function(element){ return (element.O !== feedURL);});
    chrome.storage.sync.set({"feedURLs": RN.feedURLs});
}

//Check a feed for new posts (feed onLoad callback)
function onFeedLoad(result){
    console.log("Checking feed...");
    if(!result.error){
        var container = document.getElementById("feed");
        for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            //If we have not seen this post
            if(RN.seen.indexOf(entry.link) < 0){
                sendNotification(entry, result.feed);
                addSeen(entry.link);
            }
        }
    }
    else{
        console.error("There was an error loading the feed.")
    }
}

//Send a notification about a new post (feed entry)
function sendNotification(entry, feed){
    chrome.notifications.create('',{
        title: entry.title,
        type: 'basic',
        iconUrl: '128.png',
        message: strip(entry.content).trim(),
        contextMessage: feed.title,
        isClickable: true
    }, function(notificationID){
        RN.notificationToUrl[notificationID] = entry.link;
    });
}

function strip(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}
      
//The index of the feed in the feed list to check on the next run
RN.feedIndex = 0;

//Load a feed and check it for new posts
function loadFeed(){
    if(RN.feeds.length > 0){
        var current = RN.feeds[RN.feedIndex];
        current.load(onFeedLoad);
        RN.feedIndex = (RN.feedIndex + 1) % RN.feeds.length;
    }
    //Run again next interval
    setTimeout(loadFeed, RN.interval);
}

function onNotificationClick(notificationID){
    chrome.tabs.create({url: RN.notificationToUrl[notificationID]});
}

//Initialize the feeds and start the regular monitoring
function start(){
    initializeFeeds();
    loadFeed();
    chrome.notifications.onClicked.addListener(onNotificationClick);
    console.log("Started checking feeds...");
}

//Once the Google Feeds API starts check the feeds
google.setOnLoadCallback(start);

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-16826446-5']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();