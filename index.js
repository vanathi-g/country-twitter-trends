require("dotenv").config();

const express = require('express');
const { request } = require("http");
const bodyParser = require('body-parser');
const cors = require('cors');
const url = require('url');
const Twitter = require('twitter');

const app = express();

var path = require('path');
app.use(express.static(path.join(__dirname, 'public')))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// TO PARSE REQUEST BODY
app.use(cors())

app.use(bodyParser.urlencoded({
    extended: true
}));

// Twitter API
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN
});

// SERVER
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started up!`)
});

// ROUTING
app.get('/', function (req, res) {
	res.render('home',{
		title: 'Home',
		mapbox_token: process.env.MAPBOX_TOKEN,
	});
});

app.get('/loc', function(req, res){
	const params = url.parse(req.url,true).query;

	client.get('trends/closest.json', {lat: params.lat, long: params.lng}, function(error, place, response) {
	  if(error) throw error;
	  const woeid = place[0].woeid;
	  client.get('trends/place.json', {id: woeid}, function(error, topics, response){
	  	let trends = topics[0].trends;
	  	trends.sort((a, b) => b.tweet_volume - a.tweet_volume)

	  	let content = `<ol>`
	  	for(let i=0; i<3; i++){
	  		content += `<li>${trends[i].name}</li>`
	  	}
	  	content += `</ol>`

	  	res.type('.html');
	  	res.send(content);
	  });
	});	
});