//scraper js for hn site:

var request = require('request');
var express = require('express');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/hn',function(err){
					if(err){
						console.log("error mongodb connection");
					}else
					console.log("success");
				});
var hnSchema = mongoose.Schema({title : String,rank : Number,url : String,username : String,points : Number
								});

//model param1 Collection_name,param2 schemaname
var hnModel = mongoose.model('Entry',hnSchema);

//cheerio a jquery library for node
	request('https://news.ycombinator.com',function(error,response,htmlbody){
		var parsedResults=[];
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
//						console.log(rank);
						//single json object containg data
						// var metadata = {
						// 	title:title,
						// 	rank:parseInt(rank),
						// 	url:url,
						// 	username:username,
						// 	points:parseInt(pts)
						// };
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
							//console.log("Error in saving");
						//throw err;
					});

						//json array
						//parsedResults.push(metadata);
				//});
					
			});

				//Todo create mongo db to store data
				//create a cron job to automatically run task at needed time
				//console.log(parsedResults);
		}
	});