//scraper js for hn site:
//require modules
var request = require('request');
var express = require('express');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

var express = require('express'),
	http = require('http');
var app = express();
var server = http.createServer(app);

//use mongoose to connect to mongo db and create hn db
mongoose.connect('mongodb://localhost/hn',function(err){
					if(err){
						console.log("error mongodb connection");
					}else
					console.log("success");
				});
//create schema
var hnSchema = mongoose.Schema({title : String,rank : Number,url : String,username : String,points : Number
								});

//model param1 Collection_name,param2 schemaname
//collection is entries which has hnschema
var hnModel = mongoose.model('Entry',hnSchema);

//cheerio a jquery library for node
	request('https://news.ycombinator.com',function(error,response,htmlbody){
		var parsedResults = [];
		if(response.statusCode == 200 && !error){
				var $ = cheerio.load(htmlbody);
				//get all span class deadmark then get next item which is href 
				$('span.deadmark').each(function(index,elt){
						var a = $(this).next();
						var url = a.attr('href');
						var title = a.text();
						var rank = a.parent().parent().text();
						var subtext = a.parent().parent().next().children('.subtext').children();
						var pts = $(subtext).eq(0).text();
						var username = $(subtext).eq(1).text();
						//var comments = $(subtext).eq(2).text();
						var scrapedData = new hnModel({
							title : title,
							rank : parseInt(rank),
							url : url,
							username : username,
							points : parseInt(pts)
						});
						scrapedData.save(function(err){
							if(err){
								throw err;
							}
					});
	
			});
		}
	});
//Remove previous stored entries
hnModel.remove().exec();
//REST GET
app.get('/top',function(req,res){
	hnModel.find({},function(err,docs){
		res.json(docs);
	});	
});

//REST GET news id 
// app.get('/id',function(req,res){
// 	hnModel.findOne({rank:'1'},function(err,docs){
// 		res.json(docs);
// 	});
// });
app.listen(3000);
