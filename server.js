// server.js
// where your node app starts

// init project
var express = require('express');
var bp = require('body-parser');
var app = express();
var urlR = require('url');
var dns = require('dns');
var mongo = require('mongodb').MongoClient;
var urlM = 'mongodb://root:urlL1st@ds051893.mlab.com:51893/urlshortener';
var shorturl;
var urlN;
var insertDoc = {
        'oldUrl': "",
        'newUrl': ""
      };
var redirect = [];
function generateUrl(){
        var date = new Date();
        urlN = 'https://urlsshortms.glitch.me/api/shortened/' + date.getTime().toString();
        return urlN;
      }


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(bp.urlencoded({extended: true}));
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
//https://www.quora.com/How-do-I-get-an-input-from-an-HTML-textbox-and-store-it-in-a-variable-in-Node-js
//https://stackoverflow.com/questions/17797025/why-does-a-form-with-one-text-input-submit-on-enter-while-one-with-two-text-inpu
//https://codeforgeek.com/2014/09/handle-get-post-request-express-4/    helped
app.post('/api/shorturl/', function(req, res){
  let url = req.body.url;
  dns.lookup(url, (err, address, family) => {
    let final = {
      'err': err,
      'address': address,
      'family': family
    };
    if (err == null){
      //finder function
      mongo.connect(urlM, function(err, client){
      if (err) throw err;
      //get id of last one, add one to it
      var db = client.db('urlshortener');
      var urlList = db.collection('urlList');
      //finder function end
      generateUrl();
        insertDoc = {
        'oldUrl': url,
        'newUrl': urlN
      };
      //insert doc end  
      urlList.insert(insertDoc);
        //proceduralgeneratorofurls
      client.close(function(err, insertDoc){
      if (err) throw err;
      insertDoc = {
        'oldUrl': url,
        'newUrl': urlN
      };     
      res.end(JSON.stringify(insertDoc));
      });
    });
      //res.end(JSON.stringify(insertDoc));
    } else{
      res.end('Please enter a valid address');
    }
  });
});
app.use('/api/shortened/', function(req, res){
  //use find function to find document with the field name of the shorturl, then redirect to it
  var id = urlR.parse(req.url);
  var lookup = 'https://urlsshortms.glitch.me/api/shortened/' + id.pathname.substring(1);
  mongo.connect(urlM, function(err, client){
    if (err) throw err;
    var db = client.db('urlshortener');
    var urlList = db.collection('urlList');
    urlList.find({'newUrl': lookup}).toArray(function(err, data){
      console.log(data[0].oldUrl);
      //res.end('<!doctype html><html><form method="get" action="' + dud + '"><button type="submit">CLICK TO GO</button></form></html>');
      redirect.push(data[0].oldUrl);
      //res.end('<!doctype html><html><form method="get" action ="' + redirect[0] + '"><input type="submit">CLICK!</input></form></html>');
      res.end('<!doctype html><div><p style="text-align: center; font-family: Verdana">' + redirect[0] + '</p></div>');
      return redirect;
    });
    client.close();
});

});




app.use(function(req, res){
    res.sendFile(__dirname + '/views/404.html');
});
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
