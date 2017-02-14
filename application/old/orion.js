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

    function OrionService(n){
        RED.nodes.createNode(this,n);
        this.name = n.name;
//        this.api = n.api;
//        if (/\/$/.test(this.api)) {
//            this.api = this.api.substring(this.api.length-1);
//        }
//        this.valid = /^https?:\/\/.*/.test(this.api) && this.credentials.key;
//        if (!this.valid) {
//            if (!this.credentials.key) {
//                this.error("Missing api key");
//            }
//            if (!/^https?:\/\/.*/.test(this.api)) {
//                this.error("Missing api url");
//            }
//        }
    }

    RED.nodes.registerType("orion-service",OrionService,{
    	credentials: {
			user: {type:"text"},
			password: {type: "password"}
		}
    });

    function OrionTrigger(n){
        RED.nodes.createNode(this,n);        
        this.service = RED.nodes.getNode(n.service);
        if (!this.service || !this.service.valid) {
            return;
        }
        var node = this;

//        if (n.edit) {
//          node.log('Deploying Orion Trigger: ' + n.namespace + '/' + n.trigger);
//          node.status({fill:"yellow",shape:"dot",text:"deploying"});
//
//          var params = n.params.filter(function (param) {
//            return param.key !== '';
//          })
//
//          var trigger = { 
//            parameters: params
//          };
//
//          this.service.client.triggers.update({triggerName: n.trigger, namespace: n.namespace, trigger: trigger})
//            .then(function (res) {
//              node.status({});
//            })
//            .catch(function (err) {
//              node.status({fill:"red", shape:"dot", text:"deploy failed"});
//              node.error(err.message, err.message);
//            });
//        }
//
//
//        this.on('input', function(msg) {
//            var namespace = node.namespace || msg.namespace;
//            var trigger = node.trigger || msg.trigger;
//
//            if (!namespace) {
//                return node.error("No namespace provided",msg);
//            } else if (!trigger) {
//                return node.error("No trigger provided",msg);
//            }
//            node.status({fill:"yellow",shape:"dot",text:"invoking"});
//
//            var params = msg.payload;
//            if (typeof params !== "object") {
//              params = {};
//            }
//
//            node.service.client.triggers.invoke({triggerName: trigger, namespace: namespace, params: params})
//              .then(function (res) {
//                node.status({});
//              })
//              .catch(function (err) {
//                node.status({fill:"red", shape:"dot", text:"failed"});
//                node.error(err.message, err.message);
//              });
//        })
    }

    RED.nodes.registerType("orion-trigger",OrionTrigger);

    function OrionAction(n){
        RED.nodes.createNode(this,n);
        this.service = RED.nodes.getNode(n.service);
        if (!this.service || !this.service.valid) {
            return;
        }

        var node = this;

//        if (n.edit) {
//          node.log('Deploying OpenWhisk Action: ' + n.namespace + '/' + n.action);
//          node.status({fill:"yellow",shape:"dot",text:"deploying"});
//
//          var params = n.params.filter(function (param) {
//            return param.key !== '';
//          })
//
//          var action = { 
//            exec: { kind: 'nodejs', code: n.func },
//            parameters: params
//          };
//
//          this.service.client.actions.update({actionName: n.action, namespace: n.namespace, action: action})
//            .then(function (res) {
//              node.status({});
//            })
//            .catch(function (err) {
//              node.status({fill:"red", shape:"dot", text:"deploy failed"});
//              node.error(err.message, err.message);
//            });
//        }
//
//        this.on('input', function(msg) {
//            var namespace = node.namespace || msg.namespace;
//            var action = node.action || msg.action;
//
//            if (!namespace) {
//                return node.error("No namespace provided",msg);
//            } else if (!action) {
//                return node.error("No action provided",msg);
//            }
//
//            node.status({fill:"yellow",shape:"dot",text:"running"});
//
//            var params = msg.payload;
//            if (typeof params !== "object") {
//              params = {};
//            }
//            node.service.client.actions.invoke({actionName: action, namespace: namespace, blocking: true, params: params})
//              .then(function (res) {
//                msg.data = res;
//                msg.payload = res.response.result;
//                node.status({});
//                node.send(msg);
//              })
//              .catch(function (err) {
//                node.status({fill:"red", shape:"dot", text:"failed"});
//                node.error(err.message, err.message);
//              });
//        })

    }
    RED.nodes.registerType("orion-action",OrionAction);
}
