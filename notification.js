/* Client-side access to querystring name=value pairs
    Version 1.3
    28 May 2008

    License (Simplified BSD):
    http://adamv.com/dev/javascript/qslicense.txt
*/
function Querystring(qs) { // optionally pass a querystring to parse
    this.params = {};

    if (qs == null) qs = location.search.substring(1, location.search.length);
    if (qs.length == 0) return;

    // Turn <plus> back to <space>
    // See: http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.4.1
    qs = qs.replace(/\+/g, ' ');
    var args = qs.split('&'); // parse out name/value pairs separated via &

    // split out each name=value pair
    for (var i = 0; i < args.length; i++) {
        var pair = args[i].split('=');
        var name = decodeURIComponent(pair[0]);

        var value = (pair.length==2)
            ? decodeURIComponent(pair[1])
            : name;

        this.params[name] = value;
    }
}

Querystring.prototype.get = function(key, default_) {
    var value = this.params[key];
    return (value != null) ? value : default_;
}

Querystring.prototype.contains = function(key) {
    var value = this.params[key];
    return (value != null);
}
    
//Now starts the real code:
var qs = new Querystring();
function loadMe(){        
    title = qs.get("title");
    if(!title) title = "(Unknown Title)"
    document.getElementById('titlelink').innerHTML = title;
    
    url = qs.get("url");
    if(!url) url = "http://www.example.com";
    document.getElementById('titlelink').href = url;
    document.getElementById('bylinelink').href = url;
    
    post = qs.get("post");
    if(!post) post = "Unkown Post"
    document.getElementById('post').innerHTML = post;
    
    byline = qs.get("byline");
    if(!byline) byline = "Unkown Post";
    document.getElementById('bylinelink').innerHTML = byline;
    
}

loadMe();
$("body").on("click", ".close", function(){ window.close(); return true;});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-16826446-5']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

setTimeout(function(){window.close();}, 30000);