/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
	"use strict";
	var http = require("follow-redirects").http;
	var https = require("follow-redirects").https;
	var urllib = require("url");
	var when = require('when');

	var LIMIT = 30;
	var TIMEOUT = 30000;//30 seconds?
	
	function getToken(node, n) {
		var tokenUrl = "https://" + n.url + "/token";
		var opts = urllib.parse(tokenUrl);

		opts.method = "POST";
		opts.headers = {};
		opts.headers['content-type'] = "application/json";
		opts.headers["Accept"] = "application/json";
		var payload = JSON.stringify({	
					"username": n.user,
					"password": n.password
				});

		opts.headers['content-length'] = payload.length;

		return when.promise(function(resolve,reject) {
			if(n.token){
				resolve(n.token);
			}
			var token = "";
			var req = (https).request(opts, function(res) {
				(node.ret === "bin") ? res.setEncoding('binary') : res.setEncoding('utf8');

				res.on('data',function(chunk) {
					token += chunk;
				});

				res.on('end',function() {
					resolve(token);
				});
			});

			req.setTimeout(TIMEOUT, function() {
				var err_msg = "Request timeout";
				node.error(err_msg);
				reject(err_msg);
				node.status({fill:"red",shape:"ring",text:err_msg});
				node.send({payload: err_msg + " : " + tokenUrl, statusCode: 408});
			});
			
			req.on('error',function(err) {
				reject(err);
				node.status({fill:"red",shape:"ring",text:err.code});
				node.send({payload: err.toString() + " : " + tokenUrl, statusCode: err.code});
			});

			req.write(payload);
			req.end();            
		});
	}

	function queryContext(node, n, myurl, token, payload){
		node.status({fill:"blue",shape:"dot",text:"Querying data"});
		
		return when.promise(function(resolve,reject) {
			var url = myurl + "/v1/queryContext?limit=" + n.limit + "&details=on";
			payload = JSON.stringify(payload);
			
			var opts = urllib.parse(url);
			opts.method = "POST";
			opts.headers = {};
			opts.headers['content-type'] = "application/json";
			opts.headers["Accept"] = "application/json";
			opts.headers["X-Auth-Token"] = token;
			opts.headers['content-length'] = payload.length;
			var msg = {};

            // http request with query parameters
			var req = ((/^https/.test(url))?https:http).request(opts,function(res) {
				(node.ret === "bin") ? res.setEncoding('binary') : res.setEncoding('utf8');
				msg.statusCode = res.statusCode;
				msg.payload = "";
				res.on('data',function(chunk) {
					msg.payload += chunk;
				});
				res.on('end',function() {
					
					if(res.statusCode === 200){
						node.status({});
						resolve(msg);
					}else{
						reject(msg);
						node.status({fill:"red",shape:"ring",text:res.statusCode});
					}
				});
			});
			req.on('error', function(err) {
				reject(err);
			});

			req.write(payload);
			req.end();
		});
	}

	function validateInput(node, n){
		var err = null;
		if (!n.url || !n.port) {
			err = "Mising url or port";
		}

		n.port = n.port * 1;			

		if(!((n.password && n.user) || n.token)){
			err = "Missing orion credentials";
		}

		if(err){
			throw err;
		}

		// remove http or https from url
		if (n.url.indexOf("http://") >= 0){
			n.url = n.url.substring(7);
		}else if(n.url.indexOf("https://") >= 0){
			n.url = n.url.substring(8);
		}

		n.attributes = n.attributes || [];
		if(n.attributes.constructor !== Array){
			n.attributes = (n.attributes || "").split(",");
	        for (var i=0; i < n.attributes.length; i++) {
	        	n.attributes[i] = n.attributes[i].trim();
	        }
		}
	}

	function processInput(node, n, msg){
		n.url = n.url || msg.url;
		n.port = n.port || msg.port;
		n.enid = n.enid || msg.enid || ".*";
		n.entype = n.entype || msg.entype;
		n.limit = n.limit || msg.limit || LIMIT;
		n.attributes = n.attributes || msg.attributes;
		n.token = node.credentials && node.credentials.token || msg.credentials && msg.credentials.token;
		n.user = node.credentials && node.credentials.user || msg.credentials && msg.credentials.user;
		n.password = node.credentials && node.credentials.password || msg.credentials && msg.credentials.password;
		n.ispattern = n.ispattern || msg.ispattern || false;
		n.includeattr = n.includeattr || msg.includeattr;
		
		n.rtype = n.rtype || msg.rtype;
		n.rvalue = n.rvalue || msg.rvalue;
		
		if (n.rtype && !n.rvalue){
			n.rvalue = "entity::type";
		}
	}
	
	function preparePayload(n){
		var payload = {
						"entities": [
						    {
						    	"type": n.entype,
						    	"isPattern": n.ispattern,
						    	"id": n.enid
						    }
						],
						"attributes": n.attributes
				};

		if(n.rtype && n.rvalue){
			payload.restriction = {
				"scopes": [
				           	{
				        	   "type": n.rtype,
				        	   "value": n.rvalue
				           	}
				          ]
			};
		}
		
		return payload;
	}

	function formatOutput(node, n, msg){
		var json = JSON.parse(msg.payload);
		var contextResponses = json.contextResponses;
		var payload = [];
		
		contextResponses.forEach(function(entry) {

			var contextElement = entry.contextElement;
			delete contextElement.isPattern;
			if(!n.includeattr){
                node.log("cleaning contextElement.attributes: " + JSON.stringify(contextElement.attributes));
                contextElement.attributes.forEach(function(entry) {
                    node.log("deleting: " + JSON.stringify(entry.metadatas));
				    delete entry.metadatas;
                });
			}
		    payload.push(contextElement);
		});
		
		msg.payload = payload;
	}
	
	function Orion(n) {
		RED.nodes.createNode(this,n);

		this.on("input",function(msg) {
			var node = this;
			
            // process input from UI and input pipe
			processInput(this, n, msg);

            //validate mandatory fields
			validateInput(this, n);

            // create json payload for context request
			var payload = preparePayload(n);
			
			try {
				getToken(node, n).then(
					function(token){
						queryContext(node, n, "http://" + n.url + ":" + n.port, token, payload).then(
							function(msg){
								formatOutput(node, n, msg);
								node.send(msg);
							},
							function(reason){
								node.error("failed to query, reason: " + reason.payload);
							}
						);
				});				
			} catch(err) {
				node.error(err,msg);
				node.send({payload: err.toString(), statusCode: err.code});
			}
		});
	}

    // register node
	RED.nodes.registerType("fiware orion",Orion,{
		credentials: {
			user: {type:"text"},
			password: {type: "password"},
			token: {type:"text"}
		}
	});
}
