if(!window["OpenAjax"]){
OpenAjax=new function(){
this.hub={};
var h=this.hub;
h.implementer="http://openajax.org";
h.implVersion="2.0.3";
h.specVersion="2.0";
h.implExtraData={};
var _1={};
h.libraries=_1;
var _2="org.openajax.hub.";
h.registerLibrary=function(_3,_4,_5,_6){
_1[_3]={prefix:_3,namespaceURI:_4,version:_5,extraData:_6};
this.publish(_2+"registerLibrary",_1[_3]);
};
h.unregisterLibrary=function(_7){
this.publish(_2+"unregisterLibrary",_1[_7]);
delete _1[_7];
};
};
OpenAjax.hub.Error={BadParameters:"OpenAjax.hub.Error.BadParameters",Disconnected:"OpenAjax.hub.Error.Disconnected",Duplicate:"OpenAjax.hub.Error.Duplicate",NoContainer:"OpenAjax.hub.Error.NoContainer",NoSubscription:"OpenAjax.hub.Error.NoSubscription",NotAllowed:"OpenAjax.hub.Error.NotAllowed",WrongProtocol:"OpenAjax.hub.Error.WrongProtocol"};
OpenAjax.hub.SecurityAlert={LoadTimeout:"OpenAjax.hub.SecurityAlert.LoadTimeout",FramePhish:"OpenAjax.hub.SecurityAlert.FramePhish",ForgedMsg:"OpenAjax.hub.SecurityAlert.ForgedMsg"};
OpenAjax.hub._debugger=function(){
};
OpenAjax.hub.ManagedHub=function(_8){
if(!_8||!_8.onPublish||!_8.onSubscribe){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._p=_8;
this._onUnsubscribe=_8.onUnsubscribe?_8.onUnsubscribe:null;
this._scope=_8.scope||window;
if(_8.log){
var _9=this;
this._log=function(_a){
try{
_8.log.call(_9._scope,"ManagedHub: "+_a);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
this._subscriptions={c:{},s:null};
this._containers={};
this._seq=0;
this._active=true;
this._isPublishing=false;
this._pubQ=[];
};
OpenAjax.hub.ManagedHub.prototype.subscribeForClient=function(_b,_c,_d){
this._assertConn();
if(this._invokeOnSubscribe(_c,_b)){
return this._subscribe(_c,this._sendToClient,this,{c:_b,sid:_d});
}
throw new Error(OpenAjax.hub.Error.NotAllowed);
};
OpenAjax.hub.ManagedHub.prototype.unsubscribeForClient=function(_e,_f){
this._unsubscribe(_f);
this._invokeOnUnsubscribe(_e,_f);
};
OpenAjax.hub.ManagedHub.prototype.publishForClient=function(_10,_11,_12){
this._assertConn();
this._publish(_11,_12,_10);
};
OpenAjax.hub.ManagedHub.prototype.disconnect=function(){
this._active=false;
for(var c in this._containers){
this.removeContainer(this._containers[c]);
}
};
OpenAjax.hub.ManagedHub.prototype.getContainer=function(_13){
var _14=this._containers[_13];
return _14?_14:null;
};
OpenAjax.hub.ManagedHub.prototype.listContainers=function(){
var res=[];
for(var c in this._containers){
res.push(this._containers[c]);
}
return res;
};
OpenAjax.hub.ManagedHub.prototype.addContainer=function(_15){
this._assertConn();
var _16=_15.getClientID();
if(this._containers[_16]){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
this._containers[_16]=_15;
};
OpenAjax.hub.ManagedHub.prototype.removeContainer=function(_17){
var _18=_17.getClientID();
if(!this._containers[_18]){
throw new Error(OpenAjax.hub.Error.NoContainer);
}
_17.remove();
delete this._containers[_18];
};
OpenAjax.hub.ManagedHub.prototype.subscribe=function(_19,_1a,_1b,_1c,_1d){
this._assertConn();
this._assertSubTopic(_19);
if(!_1a){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if(!this._invokeOnSubscribe(_19,null)){
this._invokeOnComplete(_1c,_1b,null,false,OpenAjax.hub.Error.NotAllowed);
return;
}
_1b=_1b||window;
var _1e=this;
function _1f(_20,_21,sd,_22){
if(_1e._invokeOnPublish(_20,_21,_22,null)){
try{
_1a.call(_1b,_20,_21,_1d);
}
catch(e){
OpenAjax.hub._debugger();
_1e._log("caught error from onData callback to Hub.subscribe(): "+e.message);
}
}
};
var _23=this._subscribe(_19,_1f,_1b,_1d);
this._invokeOnComplete(_1c,_1b,_23,true);
return _23;
};
OpenAjax.hub.ManagedHub.prototype.publish=function(_24,_25){
this._assertConn();
this._assertPubTopic(_24);
this._publish(_24,_25,null);
};
OpenAjax.hub.ManagedHub.prototype.unsubscribe=function(_26,_27,_28){
this._assertConn();
if(!_26){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._unsubscribe(_26);
this._invokeOnUnsubscribe(null,_26);
this._invokeOnComplete(_27,_28,_26,true);
};
OpenAjax.hub.ManagedHub.prototype.isConnected=function(){
return this._active;
};
OpenAjax.hub.ManagedHub.prototype.getScope=function(){
return this._scope;
};
OpenAjax.hub.ManagedHub.prototype.getSubscriberData=function(_29){
this._assertConn();
var _2a=_29.split(".");
var sid=_2a.pop();
var sub=this._getSubscriptionObject(this._subscriptions,_2a,0,sid);
if(sub){
return sub.data;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.ManagedHub.prototype.getSubscriberScope=function(_2b){
this._assertConn();
var _2c=_2b.split(".");
var sid=_2c.pop();
var sub=this._getSubscriptionObject(this._subscriptions,_2c,0,sid);
if(sub){
return sub.scope;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.ManagedHub.prototype.getParameters=function(){
return this._p;
};
OpenAjax.hub.ManagedHub.prototype._sendToClient=function(_2d,_2e,sd,_2f){
if(!this.isConnected()){
return;
}
if(this._invokeOnPublish(_2d,_2e,_2f,sd.c)){
sd.c.sendToClient(_2d,_2e,sd.sid);
}
};
OpenAjax.hub.ManagedHub.prototype._assertConn=function(){
if(!this.isConnected()){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
OpenAjax.hub.ManagedHub.prototype._assertPubTopic=function(_30){
if(!_30||_30===""||(_30.indexOf("*")!=-1)||(_30.indexOf("..")!=-1)||(_30.charAt(0)==".")||(_30.charAt(_30.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
OpenAjax.hub.ManagedHub.prototype._assertSubTopic=function(_31){
if(!_31){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _32=_31.split(".");
var len=_32.length;
for(var i=0;i<len;i++){
var p=_32[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
OpenAjax.hub.ManagedHub.prototype._invokeOnComplete=function(_33,_34,_35,_36,_37){
if(_33){
try{
_34=_34||window;
_33.call(_34,_35,_36,_37);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onComplete callback: "+e.message);
}
}
};
OpenAjax.hub.ManagedHub.prototype._invokeOnPublish=function(_38,_39,_3a,_3b){
try{
return this._p.onPublish.call(this._scope,_38,_39,_3a,_3b);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onPublish callback to constructor: "+e.message);
}
return false;
};
OpenAjax.hub.ManagedHub.prototype._invokeOnSubscribe=function(_3c,_3d){
try{
return this._p.onSubscribe.call(this._scope,_3c,_3d);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onSubscribe callback to constructor: "+e.message);
}
return false;
};
OpenAjax.hub.ManagedHub.prototype._invokeOnUnsubscribe=function(_3e,_3f){
if(this._onUnsubscribe){
var _40=_3f.slice(0,_3f.lastIndexOf("."));
try{
this._onUnsubscribe.call(this._scope,_40,_3e);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onUnsubscribe callback to constructor: "+e.message);
}
}
};
OpenAjax.hub.ManagedHub.prototype._subscribe=function(_41,_42,_43,_44){
var _45=_41+"."+this._seq;
var sub={scope:_43,cb:_42,data:_44,sid:this._seq++};
var _46=_41.split(".");
this._recursiveSubscribe(this._subscriptions,_46,0,sub);
return _45;
};
OpenAjax.hub.ManagedHub.prototype._recursiveSubscribe=function(_47,_48,_49,sub){
var _4a=_48[_49];
if(_49==_48.length){
sub.next=_47.s;
_47.s=sub;
}else{
if(typeof _47.c=="undefined"){
_47.c={};
}
if(typeof _47.c[_4a]=="undefined"){
_47.c[_4a]={c:{},s:null};
this._recursiveSubscribe(_47.c[_4a],_48,_49+1,sub);
}else{
this._recursiveSubscribe(_47.c[_4a],_48,_49+1,sub);
}
}
};
OpenAjax.hub.ManagedHub.prototype._publish=function(_4b,_4c,_4d){
if(this._isPublishing){
this._pubQ.push({t:_4b,d:_4c,p:_4d});
return;
}
this._safePublish(_4b,_4c,_4d);
while(this._pubQ.length>0){
var pub=this._pubQ.shift();
this._safePublish(pub.t,pub.d,pub.p);
}
};
OpenAjax.hub.ManagedHub.prototype._safePublish=function(_4e,_4f,_50){
this._isPublishing=true;
var _51=_4e.split(".");
this._recursivePublish(this._subscriptions,_51,0,_4e,_4f,_50);
this._isPublishing=false;
};
OpenAjax.hub.ManagedHub.prototype._recursivePublish=function(_52,_53,_54,_55,msg,_56){
if(typeof _52!="undefined"){
var _57;
if(_54==_53.length){
_57=_52;
}else{
this._recursivePublish(_52.c[_53[_54]],_53,_54+1,_55,msg,_56);
this._recursivePublish(_52.c["*"],_53,_54+1,_55,msg,_56);
_57=_52.c["**"];
}
if(typeof _57!="undefined"){
var sub=_57.s;
while(sub){
var sc=sub.scope;
var cb=sub.cb;
var d=sub.data;
var sid=sub.sid;
if(typeof cb=="string"){
cb=sc[cb];
}
cb.call(sc,_55,msg,d,_56);
sub=sub.next;
}
}
}
};
OpenAjax.hub.ManagedHub.prototype._unsubscribe=function(_58){
var _59=_58.split(".");
var sid=_59.pop();
if(!this._recursiveUnsubscribe(this._subscriptions,_59,0,sid)){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
};
OpenAjax.hub.ManagedHub.prototype._recursiveUnsubscribe=function(_5a,_5b,_5c,sid){
if(typeof _5a=="undefined"){
return false;
}
if(_5c<_5b.length){
var _5d=_5a.c[_5b[_5c]];
if(!_5d){
return false;
}
this._recursiveUnsubscribe(_5d,_5b,_5c+1,sid);
if(!_5d.s){
for(var x in _5d.c){
return true;
}
delete _5a.c[_5b[_5c]];
}
}else{
var sub=_5a.s;
var _5e=null;
var _5f=false;
while(sub){
if(sid==sub.sid){
_5f=true;
if(sub==_5a.s){
_5a.s=sub.next;
}else{
_5e.next=sub.next;
}
break;
}
_5e=sub;
sub=sub.next;
}
if(!_5f){
return false;
}
}
return true;
};
OpenAjax.hub.ManagedHub.prototype._getSubscriptionObject=function(_60,_61,_62,sid){
if(typeof _60!="undefined"){
if(_62<_61.length){
var _63=_60.c[_61[_62]];
return this._getSubscriptionObject(_63,_61,_62+1,sid);
}
var sub=_60.s;
while(sub){
if(sid==sub.sid){
return sub;
}
sub=sub.next;
}
}
return null;
};
OpenAjax.hub._hub=new OpenAjax.hub.ManagedHub({onSubscribe:function(_64,_65){
return true;
},onPublish:function(_66,_67,_68,_69){
return true;
}});
OpenAjax.hub.subscribe=function(_6a,_6b,_6c,_6d){
if(typeof _6b==="string"){
_6c=_6c||window;
_6b=_6c[_6b]||null;
}
return OpenAjax.hub._hub.subscribe(_6a,_6b,_6c,null,_6d);
};
OpenAjax.hub.unsubscribe=function(_6e){
return OpenAjax.hub._hub.unsubscribe(_6e);
};
OpenAjax.hub.publish=function(_6f,_70){
OpenAjax.hub._hub.publish(_6f,_70);
};
OpenAjax.hub.registerLibrary("OpenAjax","http://openajax.org/hub","2.0",{});
}
if(typeof OpenAjax==="undefined"){
window.OpenAjax={};
}
if(typeof OpenAjax.hub==="undefined"){
window.OpenAjax.hub={};
}
(function(){
OpenAjax.hub.IframeContainer=function(hub,_71,_72){
if(!hub||!_71||!_72||!_72.Container||!_72.Container.onSecurityAlert||!_72.IframeContainer||!_72.IframeContainer.parent||!_72.IframeContainer.uri||!_72.IframeContainer.tunnelURI){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _73=this;
var _74=_72.Container.scope||window;
var _75=false,_76=false,_77=false;
var _78={};
var _79;
var _7a;
var _7b;
var _7c;
var _7d=_72.IframeContainer.timeout||15000;
var _7e;
if(_72.Container.log){
var log=function(msg){
try{
_72.Container.log.call(_74,"IframeContainer::"+_71+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
this._init=function(){
hub.addContainer(this);
_7c=_d0();
_7b=_7f(_71,this);
_7a=_e1(_72,_74,log,_7c.type==="FIM"?6:null);
var _80={receiver:this,receiverId:_7b,securityToken:_7a,uri:_72.IframeContainer.uri,tunnelURI:_72.IframeContainer.tunnelURI,log:log};
if(_71!==_7b){
_80.name=_71;
}
_7c.addReceiver(_80);
_81();
_7c.postAdd(_7b,document.getElementById(_7b));
_82();
};
this.sendToClient=function(_83,_84,_85){
_86("pub",{t:_83,d:_84,s:_85});
};
this.remove=function(){
_87();
_7c.removeReceiver(_7b);
clearTimeout(_7e);
_88(_7b);
};
this.isConnected=function(){
return _75;
};
this.getClientID=function(){
return _71;
};
this.getPartnerOrigin=function(){
if(_75){
return _79;
}
return null;
};
this.getParameters=function(){
return _72;
};
this.getHub=function(){
return hub;
};
this.getIframe=function(){
return document.getElementById(_7b);
};
this.transportReady=function(_89,_8a,_8b,_8c){
if(!_8b){
if(_8c.securityAlert){
_8d(_8c.securityAlert);
}
return;
}
_79=_8c.partnerOrigin;
};
this.receiveMsg=function(msg){
switch(msg.m){
case "pub":
hub.publishForClient(this,msg.p.t,msg.p.d);
break;
case "sub":
var _8e="";
try{
_78[msg.p.s]=hub.subscribeForClient(this,msg.p.t,msg.p.s);
}
catch(e){
_8e=e.message;
}
_86("sub_ack",{s:msg.p.s,e:_8e});
break;
case "uns":
var _8f=_78[msg.p.s];
hub.unsubscribeForClient(this,_8f);
delete _78[msg.p.s];
_86("uns_ack",{s:msg.p.s});
break;
case "con":
_76=true;
_90();
break;
case "dis":
_82();
_87();
_86("dis_ack",null);
if(_72.Container.onDisconnect){
try{
_72.Container.onDisconnect.call(_74,this);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onDisconnect callback to constructor: "+e.message);
}
}
break;
}
};
this.securityAlert=function(_91){
_8d(_91);
};
function _81(){
var _92=document.createElement("iframe");
_92.id=_7b;
_92.name=_7b;
var _93=_72.IframeContainer.iframeAttrs;
if(_93){
for(var _94 in _93){
switch(_94){
case "id":
case "name":
log("Ignoring 'id' or 'name' property in 'iframeAttrs' -- "+"these attributes on the iframe are used for "+"internal purposes.");
break;
case "style":
for(var _95 in _93.style){
_92.style[_95]=_93.style[_95];
}
break;
default:
_92[_94]=_93[_94];
}
}
}
_92.style.visibility="hidden";
_92.src="javascript:\"<html></html>\"";
_72.IframeContainer.parent.appendChild(_92);
_92.src=_7c.getURI();
_72.IframeContainer.parent=null;
};
var _88=function(){
if(navigator.appName==="Microsoft Internet Explorer"){
return function(id){
var _96=document.getElementById(id);
_96.onreadystatechange=function(){
if(_96.readyState=="complete"){
_96.onreadystatechange=null;
_96.outerHTML="";
_96=null;
}
};
_96.src="";
};
}else{
return function(id){
var _97=document.getElementById(id);
_97.parentNode.removeChild(_97);
_97=null;
};
}
}();
function _86(_98,_99){
var _9a={m:_98,i:_7b,r:"..",t:_7a,p:_99};
_7c.sendMsg(_7b,_9a);
};
function _90(){
if(!_77||!_76){
return;
}
_75=true;
clearTimeout(_7e);
document.getElementById(_7b).style.visibility="visible";
_86("con_ack",null);
if(_72.Container.onConnect){
try{
_72.Container.onConnect.call(_74,_73);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onConnect callback to constructor: "+e.message);
}
}
};
function _87(){
if(_75){
_75=false;
document.getElementById(_7b).style.visibility="hidden";
for(var s in _78){
hub.unsubscribeForClient(_73,_78[s]);
}
_78={};
}
};
function _7f(id,_9b){
while(OpenAjax.hub.IframeContainer._containers[id]){
id+="_"+((32767*Math.random())|0).toString(16);
}
OpenAjax.hub.IframeContainer._containers[id]=_9b;
return id;
};
this._tunnelLoaded=function(_9c){
_9c.onunload=_9d;
_77=true;
_d7();
_90();
};
function _9d(){
if(_75&&!_d5){
_8d(OpenAjax.hub.SecurityAlert.FramePhish);
}
};
function _8d(_9e){
try{
_72.Container.onSecurityAlert.call(_74,_73,_9e);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onSecurityAlert callback to constructor: "+e.message);
}
};
function _82(){
_7e=setTimeout(function(){
_8d(OpenAjax.hub.SecurityAlert.LoadTimeout);
_73.receiveMsg=function(){
};
},_7d);
};
this._init();
};
OpenAjax.hub.IframeHubClient=function(_9f){
if(!_9f||!_9f.HubClient||!_9f.HubClient.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _a0=this;
var _a1=_9f.HubClient.scope||window;
var _a2=false;
var _a3=false;
var _a4={};
var _a5=0;
var _a6,_a7,_a8;
var _a9;
if(_9f.HubClient.log){
var log=function(msg){
try{
_9f.HubClient.log.call(_a1,"IframeHubClient::"+_a6+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
log=function(){
};
}
var _aa;
this._init=function(){
_aa=_d0();
_a8=_e1(_9f,_a1,log,_aa.type==="FIM"?6:null);
_a6=_aa.addReceiver({receiver:this,receiverId:"..",securityToken:_a8,log:log});
if(!_a6){
throw new Error(OpenAjax.hub.Error.WrongProtocol);
}
};
this.connect=function(_ab,_ac){
_ac=_ac||window;
if(_a3){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
if(_ab){
this._connectCallback={func:_ab,scope:_ac};
}
if(_a2){
_ad("con",null);
}else{
this._connectPending=true;
}
};
this.disconnect=function(_ae,_af){
_af=_af||window;
if(!_a3){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
_a3=false;
if(_ae){
this._disconnectCallback={func:_ae,scope:_af};
}
_ad("dis",null);
};
this.getPartnerOrigin=function(){
if(_a3){
return _a9;
}
return null;
};
this.getClientID=function(){
return _a6;
};
this.subscribe=function(_b0,_b1,_b2,_b3,_b4){
_b5();
_b6(_b0);
if(!_b1){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
_b2=_b2||window;
var _b7=""+_a5++;
_a4[_b7]={cb:_b1,sc:_b2,d:_b4,oc:_b3};
_ad("sub",{t:_b0,s:_b7});
return _b7;
};
this.publish=function(_b8,_b9){
_b5();
_ba(_b8);
_ad("pub",{t:_b8,d:_b9});
};
this.unsubscribe=function(_bb,_bc,_bd){
_b5();
if(!_bb){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if(!_a4[_bb]||_a4[_bb].uns){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
_bd=_bd||window;
_a4[_bb].uns={cb:_bc,sc:_bd};
_ad("uns",{s:_bb});
};
this.isConnected=function(){
return _a3;
};
this.getScope=function(){
return _a1;
};
this.getSubscriberData=function(_be){
_b5();
if(_a4[_be]){
return _a4[_be].d;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getSubscriberScope=function(_bf){
_b5();
if(_a4[_bf]){
return _a4[_bf].sc;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
this.getParameters=function(){
return _9f;
};
this.transportReady=function(_c0,_c1,_c2,_c3){
if(!_c2){
if(_c3.securityAlert){
_c4(_c3.securityAlert);
}
return;
}
_a7=_c0;
_a9=_c3.partnerOrigin;
_a2=true;
if(this._connectPending){
delete this._connectPending;
_ad("con",null);
}
};
this.receiveMsg=function(msg){
var _c5,_c6;
switch(msg.m){
case "pub":
_c5=msg.p.s;
if(_a4[_c5]&&!_a4[_c5].uns){
try{
_a4[_c5].cb.call(_a4[_c5].sc,msg.p.t,msg.p.d,_a4[_c5].d);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onData callback to subscribe(): "+e.message);
}
}
break;
case "sub_ack":
_c5=msg.p.s;
_c6=_a4[_c5].oc;
if(_c6){
try{
delete _a4[_c5].oc;
_c6.call(_a4[_c5].sc,_c5,msg.p.e==="",msg.p.e);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to subscribe(): "+e.message);
}
}
break;
case "uns_ack":
_c5=msg.p.s;
if(_a4[_c5]){
_c6=_a4[_c5].uns.cb;
if(_c6){
try{
_c6.call(_a4[_c5].uns.sc,_c5,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to unsubscribe(): "+e.message);
}
}
delete _a4[_c5];
}
break;
case "con_ack":
_a3=true;
if(this._connectCallback){
try{
this._connectCallback.func.call(this._connectCallback.scope,this,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to connect(): "+e.message);
}
delete this._connectCallback;
}
break;
case "dis_ack":
if(this._disconnectCallback){
try{
this._disconnectCallback.func.call(this._disconnectCallback.scope,this,true);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onComplete callback to disconnect(): "+e.message);
}
delete this._disconnectCallback;
}
break;
}
};
this.securityAlert=function(_c7){
_c4(_c7);
};
function _b5(){
if(!_a3){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
function _b6(_c8){
if(!_c8){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _c9=_c8.split(".");
var len=_c9.length;
for(var i=0;i<len;i++){
var p=_c9[i];
if((p==="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
function _ba(_ca){
if(!_ca||_ca===""||(_ca.indexOf("*")!=-1)||(_ca.indexOf("..")!=-1)||(_ca.charAt(0)==".")||(_ca.charAt(_ca.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
function _ad(_cb,_cc){
var _cd={m:_cb,i:_a7,t:_a8,p:_cc};
_aa.sendMsg("..",_cd);
};
function _c4(_ce){
try{
_9f.HubClient.onSecurityAlert.call(_a1,_a0,_ce);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from onSecurityAlert callback to constructor: "+e.message);
}
};
this._init();
};
OpenAjax.hub.IframeContainer._containers={};
OpenAjax.hub.IframeContainer._tunnelLoaded=function(){
var _cf=_d0();
var id=_cf.tunnelLoaded();
window.parent.parent.OpenAjax.hub.IframeContainer._containers[id]._tunnelLoaded(window);
};
OpenAjax.hub.IframeContainer._queryURLParam=function(_d1){
var _d2=new RegExp("[\\?&]"+_d1+"=([^&#]*)").exec(window.location.search);
if(_d2){
return decodeURIComponent(_d2[1].replace(/\+/g,"%20"));
}
return null;
};
OpenAjax.hub.IframeContainer._createTunnelIframe=function(uri){
var _d3=document.createElement("iframe");
_d3.src=uri;
document.body.appendChild(_d3);
_d3.style.position="absolute";
_d3.style.left=_d3.style.top="-10px";
_d3.style.height=_d3.style.width="1px";
_d3.style.visibility="hidden";
};
OpenAjax.hub.IframeContainer._getTargetWin=function(id){
if(typeof id==="undefined"||id===".."){
return window.parent;
}
id=String(id);
var _d4=window.frames[id];
if(_d4){
return _d4;
}
_d4=document.getElementById(id);
if(_d4&&_d4.contentWindow){
return _d4.contentWindow;
}
return null;
};
var _d5=false,_d6=false;
function _d7(){
if(_d6){
return;
}
_d8("unload",function(){
_d5=true;
},false);
_d6=true;
};
function _d8(_d9,_da,_db){
if(window.addEventListener){
window.addEventListener(_d9,_da,_db);
}else{
if(window.attachEvent){
window.attachEvent("on"+_d9,_da);
}
}
};
function _dc(_dd,_de,_df){
if(window.removeEventListener){
window.removeEventListener(_dd,_de,_df);
}else{
window.detachEvent("on"+_dd,_de);
}
};
var _e0;
function _d0(){
if(!_e0){
var t=window.postMessage?"PM":window.ActiveXObject?"NIX":"FIM";
_e0=new OpenAjax.hub.IframeContainer["_"+t]();
_e0.type=t;
}
return _e0;
};
function _e1(_e2,_e3,log,_e4){
if(!OpenAjax.hub.IframeContainer._prng){
var _e5=new Date().getTime()+Math.random()+document.cookie;
OpenAjax.hub.IframeContainer._prng=OpenAjax._smash.crypto.newPRNG(_e5);
}
var p=_e2.IframeContainer||_e2.IframeHubClient;
if(p&&p.seed){
try{
var _e6=p.seed.call(_e3);
OpenAjax.hub.IframeContainer._prng.addSeed(_e6);
}
catch(e){
OpenAjax.hub._debugger();
log("caught error from 'seed' callback: "+e.message);
}
}
var _e7=_e4||(p&&p.tokenLength)||6;
return OpenAjax.hub.IframeContainer._prng.nextRandomB64Str(_e7);
};
OpenAjax.hub.IframeContainer._PM=function(){
var _e8="openajax-2.0.2";
var _e9={};
var _ea,_eb;
var uri;
_d8("message",_ec,false);
this.addReceiver=function(_ed){
var _ee;
_e9[_ed.receiverId]={r:_ed.receiver};
if(_ed.receiverId===".."){
var pv=OpenAjax.hub.IframeContainer._queryURLParam("oahpv");
if(!pv||pv!==_e8){
return null;
}
var _ef=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
var _f0=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var _f1=OpenAjax.hub.IframeContainer._queryURLParam("oahn");
var _f2=OpenAjax.hub.IframeContainer._queryURLParam("oaht");
if(!_f0||!_f2||!_ef){
return null;
}
_ea=OpenAjax.hub.IframeContainer._queryURLParam("oahpm");
_f3();
var _f4=/^([a-zA-Z]+:\/\/[^\/?#]+).*/.exec(_ef)[1];
_e9[".."].o=_f4;
_e9[".."].m=_f5(_f4);
var _f6="oahi="+encodeURIComponent(_f0)+"&oaht="+_f2;
var _f7=_ef.split("#");
_f7[0]=_f7[0]+((_f7[0].indexOf("?")!=-1)?"&":"?")+_f6;
_ef=_f7.length===1?_f7[0]:_f7[0]+"#"+_f7[1];
OpenAjax.hub.IframeContainer._createTunnelIframe(_ef);
_ee={partnerOrigin:/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_f4)[1],securityToken:_f2};
setTimeout(function(){
_ed.receiver.transportReady(_f0,_f1,true,_ee);
},0);
return _f1||_f0;
}
if(typeof _ea==="undefined"){
_fe();
_f3();
}
_f4=/^([a-zA-Z]+:\/\/[^\/?#]+).*/.exec(_ed.uri)[1];
_e9[_ed.receiverId].o=_f4;
_e9[_ed.receiverId].m=_f5(_f4);
_ee={partnerOrigin:/^([a-zA-Z]+:\/\/[^:]+).*/.exec(_f4)[1]};
setTimeout(function(){
_ed.receiver.transportReady(_ed.receiverId,_ed.name,true,_ee);
},0);
_f6="oahpv="+encodeURIComponent(_e8)+"&oahi="+encodeURIComponent(_ed.receiverId)+(_ed.name?"&oahn="+encodeURIComponent(_ed.name):"")+"&oaht="+_ed.securityToken+"&oahu="+encodeURIComponent(_ed.tunnelURI)+"&oahpm="+_ea;
_f7=_ed.uri.split("#");
_f7[0]=_f7[0]+((_f7[0].indexOf("?")!=-1)?"&":"?")+_f6;
uri=_f7.length===1?_f7[0]:_f7[0]+"#"+_f7[1];
return null;
};
this.getURI=function(){
return uri;
};
this.postAdd=function(_f8,_f9){
};
this.sendMsg=function(_fa,_fb){
if(_e9[_fa]){
var _fc=OpenAjax.hub.IframeContainer._getTargetWin(_fa);
_eb(_fc,JSON.stringify(_fb),_e9[_fa].o);
}
return true;
};
this.tunnelLoaded=function(){
return OpenAjax.hub.IframeContainer._queryURLParam("oahi");
};
this.removeReceiver=function(_fd){
delete _e9[_fd];
};
function _fe(){
_ea="";
var hit=false;
function _ec(_ff){
if(_ff.data=="postmessage.test"){
hit=true;
if(typeof _ff.origin==="undefined"){
_ea+="d";
}
}
};
_d8("message",_ec,false);
window.postMessage("postmessage.test","*");
if(hit){
_ea+="s";
}
_dc("message",_ec,false);
};
function _f3(){
if(_ea.indexOf("s")===-1){
_eb=function(win,msg,_100){
win.postMessage(msg,_100);
};
}else{
_eb=function(win,msg,_101){
setTimeout(function(){
win.postMessage(msg,_101);
},0);
};
}
};
function _f5(_102){
if(_ea.indexOf("d")!==-1){
return (/^.+:\/\/([^:]+).*/.exec(_102)[1]);
}
return _102;
};
function _ec(_103){
try{
var data=JSON.parse(_103.data);
var id=data.r||data.i;
if(typeof id==="undefined"){
return;
}
if(!_e9[id]){
if(typeof data.m!=="undefined"&&typeof data.p!=="undefined"){
_e9[".."].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
}
return;
}
if(_e9[id].m!==(_103.origin||_103.domain)){
_e9[id].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
return;
}
_e9[id].r.receiveMsg(data);
}
catch(e){
return;
}
};
};
})();
OpenAjax.hub.IframeContainer._FIM=function(){
var _104={},_105={},_106={};
var uri;
OpenAjax.hub.IframeContainer._FIM.instances=_105;
this.addReceiver=function(args){
_104[args.receiverId]={r:args.receiver};
_106[args.receiverId]={initialized:false,queueOut:[],lib:null};
if(args.receiverId===".."){
return _107.call(this,args);
}
return _108.call(this,args);
};
this.getURI=function(){
return uri;
};
this.postAdd=function(_109,_10a){
return true;
};
this.sendMsg=function(_10b,data){
var msg=new _10c.SECommMessage();
switch(data.m){
case "con":
msg.type=_10c.SECommMessage.CONNECT;
msg.payload=window.location.href.split("#")[0];
break;
case "con_ack":
msg.type=_10c.SECommMessage.CONNECT_ACK;
break;
case "dis":
msg.type=_10c.SECommMessage.DISCONNECT;
break;
case "dis_ack":
msg.type=_10c.SECommMessage.DISCONNECT_ACK;
break;
case "pub":
if(data.p.s){
msg.type=_10c.SECommMessage.DISTRIBUTE;
msg.additionalHeader={s:data.p.s};
}else{
msg.type=_10c.SECommMessage.PUBLISH;
msg.additionalHeader={};
}
msg.topic=data.p.t;
if(typeof data.p.d==="string"){
msg.additionalHeader.f="S";
msg.payload=data.p.d;
}else{
msg.additionalHeader.f="J";
msg.payload=JSON.stringify(data.p.d);
}
break;
case "sub":
msg.type=_10c.SECommMessage.SUBSCRIBE;
msg.topic=data.p.t;
msg.additionalHeader={subId:data.p.s};
break;
case "sub_ack":
msg.type=_10c.SECommMessage.SUBSCRIBE_ACK;
msg.additionalHeader={subId:data.p.s,isOk:(data.p.e===""),err:data.p.e};
break;
case "uns":
msg.type=_10c.SECommMessage.UNSUBSCRIBE;
msg.additionalHeader={subId:data.p.s};
break;
case "uns_ack":
msg.type=_10c.SECommMessage.UNSUBSCRIBE_ACK;
msg.additionalHeader={subId:data.p.s};
break;
}
var c=_106[_10b];
if(c.initialized){
c.lib.send(msg.serialize());
}else{
c.queueOut.push(msg.serialize());
}
return true;
};
this.tunnelLoaded=function(){
new _10c.CommLib(false,window.parent.parent.OpenAjax.hub.IframeContainer._FIM.instances);
var hash=window.location.href.split("#")[1];
return decodeURIComponent(hash.substring(_10c._securityTokenOverhead+6).split(":")[0]);
};
this.removeReceiver=function(_10d){
delete _104[_10d];
delete _106[_10d];
delete _105[_10d];
};
function _108(args){
_105[args.receiverId]=new _10e(args.receiverId,args.log);
_104[args.receiverId].tok=args.securityToken;
_104[args.receiverId].uri=args.uri;
var name=args.name||args.receiverId;
uri=args.uri+"#"+_10c._protocolID+":100"+args.securityToken+args.securityToken+"000"+encodeURIComponent(args.receiverId)+":"+encodeURIComponent(name)+":"+encodeURIComponent(args.tunnelURI);
return null;
};
function _107(args){
var _10f=window.location.href.split("#");
if(!_10f[1]){
return null;
}
var _110=_10f[1].split(":",3);
var _111=_110[0];
if(_111!==_10c._protocolID){
return null;
}
var _112=_10f[0]+"#"+_10f[1].substring(_111.length+1);
window.location.replace(_112);
_10c._clientSecurityToken=args.securityToken;
_105[".."]=new _10e("..",args.log);
_106[".."].lib=new _10c.CommLib(true,_105);
return decodeURIComponent(_110[2]);
};
function _10e(_113,_114){
this.messageReceived=function(_115){
var _116={i:_113};
var msg=new _10c.SECommMessage();
msg.deserialize(_115);
switch(msg.type){
case _10c.SECommMessage.PUBLISH:
case _10c.SECommMessage.DISTRIBUTE:
_116.m="pub";
if(msg.additionalHeader){
_116.p={t:msg.topic,d:msg.payload};
if(msg.additionalHeader.f==="J"){
_116.p.d=JSON.parse(msg.payload);
}
if(msg.type===_10c.SECommMessage.DISTRIBUTE){
_116.p.s=msg.additionalHeader.s;
}
}
break;
case _10c.SECommMessage.SUBSCRIBE:
_116.m="sub";
if(msg.additionalHeader){
_116.p={t:msg.topic,s:msg.additionalHeader.subId};
}
break;
case _10c.SECommMessage.SUBSCRIBE_ACK:
_116.m="sub_ack";
if(msg.additionalHeader){
_116.p={s:msg.additionalHeader.subId,e:msg.additionalHeader.isOk?"":msg.additionalHeader.err};
}
break;
case _10c.SECommMessage.UNSUBSCRIBE:
_116.m="uns";
if(msg.additionalHeader){
_116.p={s:msg.additionalHeader.subId};
}
break;
case _10c.SECommMessage.UNSUBSCRIBE_ACK:
_116.m="uns_ack";
if(msg.additionalHeader){
_116.p={s:msg.additionalHeader.subId};
}
break;
case _10c.SECommMessage.CONNECT:
_116.m="con";
break;
case _10c.SECommMessage.CONNECT_ACK:
_116.m="con_ack";
break;
case _10c.SECommMessage.DISCONNECT:
_116.m="dis";
break;
case _10c.SECommMessage.DISCONNECT_ACK:
_116.m="dis_ack";
break;
}
_104[_113].r.receiveMsg(_116);
};
this.initializationFinished=function(_117,_118,_119,_11a,_11b,_11c,_11d){
var c=_106[_113];
var rec=_104[_113];
var args={partnerOrigin:/^([a-zA-Z]+:\/\/[^\/?#:]+).*/.exec(_119)[1]};
if(_113===".."){
args.debug=_11d;
}else{
if(_11a!==rec.tok||_119!==rec.uri){
this.handleSecurityError(_10c.SecurityErrors.TOKEN_VERIFICATION_FAILED);
return false;
}
_114("Tunnel commLib initialization finished. Processing outgoing queue. Security token: "+_11a);
c.lib=_11c;
}
c.initialized=true;
while(c.queueOut.length>0){
c.lib.send(c.queueOut.shift());
}
rec.r.transportReady(_117,_118,true,args);
return true;
};
this.handleSecurityError=function(_11e){
_104[_113].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
};
this.log=function(msg){
_114(msg);
};
};
if(typeof OpenAjax._smash=="undefined"){
OpenAjax._smash={};
}
var _10c=OpenAjax._smash;
_10c._protocolID="openajax-2.0.2";
_10c._securityTokenLength=6;
_10c._securityTokenOverhead=null;
_10c._computeOtherTokenConstants=function(){
_10c._securityTokenOverhead=2*_10c._securityTokenLength;
};
_10c._computeOtherTokenConstants();
_10c.SecurityErrors={INVALID_TOKEN:0,TOKEN_VERIFICATION_FAILED:1,TUNNEL_UNLOAD:2,COMPONENT_LOAD:3};
_10c.SECommMessage=function(){
this.type=null;
this.topic=null;
this.additionalHeader=null;
this.payload=null;
var _11f="y";
var _120="t";
var _121="h";
var _122="p";
this.serialize=function(){
var _123=_11f+"="+this.type;
if(this.topic!=null){
var _124=encodeURIComponent(this.topic);
var _125="&"+_120+"="+_124;
_123+=_125;
}
if(this.additionalHeader!=null){
var _126=encodeURIComponent(JSON.stringify(this.additionalHeader));
var _127="&"+_121+"="+_126;
_123+=_127;
}
if(this.payload!=null){
var _128=encodeURIComponent(this.payload);
var _129="&"+_122+"="+_128;
_123+=_129;
}
return _123;
};
this.deserialize=function(_12a){
var _12b=_12a.split("&");
for(var i=0;i<_12b.length;i++){
var _12c=_12b[i].split("=");
switch(_12c[0]){
case _11f:
this.type=_12c[1];
break;
case _120:
this.topic=decodeURIComponent(_12c[1]);
break;
case _121:
var _12d=decodeURIComponent(_12c[1]);
this.additionalHeader=JSON.parse(_12d);
break;
case _122:
this.payload=decodeURIComponent(_12c[1]);
break;
}
}
};
};
_10c.SECommMessage.CONNECT="con";
_10c.SECommMessage.CONNECT_ACK="cac";
_10c.SECommMessage.DISCONNECT="xcon";
_10c.SECommMessage.DISCONNECT_ACK="xac";
_10c.SECommMessage.PUBLISH="pub";
_10c.SECommMessage.DISTRIBUTE="dis";
_10c.SECommMessage.SUBSCRIBE="sub";
_10c.SECommMessage.UNSUBSCRIBE="uns";
_10c.SECommMessage.SUBSCRIBE_ACK="sac";
_10c.SECommMessage.UNSUBSCRIBE_ACK="uac";
_10c.SECommMessage.ERROR="err";
_10c.CommLib=function(_12e,_12f){
var INIT="1";
var ACK="2";
var PART="3";
var END="4";
var that=this;
var _130=100;
var _131=4000;
var _132=6;
var ack=0;
var _133=null;
var _134=null;
var _135=null;
var _136=null;
var _137=null;
var _138=null;
var _139=null;
var _13a=[];
var msn=0;
var _13b="";
var _13c=null;
var _13d=null;
var _13e=null;
var _13f=null;
var _140=null;
var _141=null;
var logQ=[];
var _142=false;
this.send=function(_143){
if(_138==null){
log("Trying to send without proper initialization. Message will be discarded. "+_143);
return;
}
log("Sending: "+_143);
var _144=_143;
var _145=_131-_132-_10c._securityTokenOverhead-_138.length;
var _146=_144;
while(_146.length>0){
var part=_146.substr(0,_145);
_146=_146.substr(_145);
if(_146==0){
_13a.push({type:END,payload:part});
}else{
_13a.push({type:PART,payload:part});
}
}
};
function _147(){
if(_148()){
if(_149()){
if(_14a()){
_14b();
}
}
}
if(_14c()){
_14d();
}
};
function _14c(){
if(_137.type==ACK){
return true;
}
if((_137.msn==_134.ackMsn)&&(_134.ack==1)){
return true;
}
log("Waiting for ACK : "+_137.msn);
return false;
};
function _14e(){
msn++;
if(msn==100){
msn=0;
}
if(msn<10){
return "0"+msn;
}
return ""+msn;
};
function _148(){
var _14f=window.location.href.split("#");
if(_14f.length==2){
var _150=_14f[1];
if(_150!=""&&_150!=_133){
_133=_150;
return true;
}
}
return false;
};
function _149(){
var type=_133.substr(0,1);
var msn=_133.substr(1,2);
var _151=3;
var _152=_133.substr(_151,_10c._securityTokenLength);
_151+=_10c._securityTokenLength;
var _153=_133.substr(_151,_10c._securityTokenLength);
_151+=_10c._securityTokenLength;
var ack=_133.substr(_151,1);
_151+=1;
var _154=_133.substr(_151,2);
_151+=2;
var _155=_133.substr(_151);
log("In : Type: "+type+" msn: "+msn+" tokenParent: "+_152+" tokenChild: "+_153+" ack: "+ack+" msn: "+_154+" payload: "+_155);
_134={type:type,msn:msn,tokenParent:_152,tokenChild:_153,ack:ack,ackMsn:_154,payload:_155};
return true;
};
function _14a(){
if(_134.type!=INIT&&(_134.tokenParent!=_13d||_134.tokenChild!=_13e)){
log("Security token error: Invalid security token received. The message will be discarded.");
_156(_10c.SecurityErrors.INVALID_TOKEN);
return false;
}
return true;
};
function _14b(){
ack=1;
if(_134.type!=INIT&&_12e&&_137.type==INIT&&_134.ack=="1"&&_137.msn==_134.ackMsn){
_141.initializationFinished(_13f,_140,_138,_13d,_13e,null,_142);
}
switch(_134.type){
case INIT:
_157();
break;
case ACK:
_158();
break;
case PART:
_159();
break;
case END:
_15a();
break;
}
_135=_134;
};
function _157(){
var _15b=_134.payload.split(":");
_13f=decodeURIComponent(_15b[0]);
_140=decodeURIComponent(_15b[1]);
_138=decodeURIComponent(_15b[2]);
_13d=_134.tokenParent;
_13e=_134.tokenChild;
if(_12e){
_13e=_10c._clientSecurityToken;
var _15c="3827816c-f3b1-11db-8314-0800200c9a66";
var _15d=document.createElement("iframe");
var _15e=encodeURIComponent(window.location.href.split("#")[0]);
var _15f=encodeURIComponent(_13f)+":"+encodeURIComponent(_140)+":"+_15e;
_15d.src=_138+"#100"+_13d+_13e+"100"+_15f;
_15d.name=_15c;
_15d.id=_15c;
document.body.appendChild(_15d);
_15d.style.position="absolute";
_15d.style.left=_15d.style.top="-10px";
_15d.style.height=_15d.style.width="1px";
_15d.style.visibility="hidden";
ack=0;
_139=window.frames[_15c];
_137={type:INIT,msn:"00",tokenParent:_13d,tokenChild:_13e,ack:"0",ackMsn:"00",payload:_15f};
_141=_12f[".."];
_142=_15b[3]&&_15b[3]==="debug";
}else{
_139=window.parent;
_141=_12f[_13f];
var _160=_141.initializationFinished(_13f,_140,_138,_13d,_13e,that);
if(!_160){
ack=0;
}
_137={type:INIT,msn:"00",tokenParent:_13d,tokenChild:_13e,ack:"0",ackMsn:"00",payload:(encodeURIComponent(_13f)+":"+encodeURIComponent(_140)+":"+encodeURIComponent(window.location.href.split("#")[0]))};
}
if(_139==null){
log("Init failed.");
}
};
function _158(){
ack=0;
};
function _159(){
_13b+=_134.payload;
};
function _15a(){
_13b+=_134.payload;
log("Received: "+_13b);
_141.messageReceived(_13b);
_13b="";
};
function _14d(){
if(_13a.length==0&&ack==1){
_13a.push({type:ACK,payload:""});
}
if(_13a.length!=0){
_136=_13a.shift();
_136.tokenParent=_13d;
_136.tokenChild=_13e;
_136.msn=_14e();
_136.ack="1";
_136.ackMsn=_135.msn;
ack=0;
_161();
}
};
function _161(){
var url=_138+"#"+_136.type+_136.msn+_136.tokenParent+_136.tokenChild+_136.ack+_136.ackMsn+_136.payload;
_139.location.replace(url);
_137=_136;
log("Out: Type: "+_136.type+" msn: "+_136.msn+" tokenParent: "+_136.tokenParent+" tokenChild: "+_136.tokenChild+" ack: "+_136.ack+" msn: "+_136.ackMsn+" payload: "+_136.payload);
};
function _156(_162){
clearInterval(_13c);
_141.handleSecurityError(_162);
};
function log(msg){
if(_141){
while(logQ.length>0){
_141.log(logQ.shift());
}
_141.log(msg);
}else{
logQ.push(msg);
}
};
_13c=setInterval(_147,_130);
};
};
OpenAjax.hub.IframeContainer._NIX=function(){
var _163="openajax-2.0.2";
var _164="GRPC____NIXVBS_wrapper";
var _165="GRPC____NIXVBS_get_wrapper";
var _166="GRPC____NIXVBS_handle_message";
var _167="GRPC____NIXVBS_create_channel";
var _168=10;
var _169=500;
var _16a={};
var _16b=0;
var uri;
if(typeof window[_165]!=="unknown"){
window[_166]=function(data){
window.setTimeout(function(){
_16c(JSON.parse(data));
},0);
};
window[_167]=function(name,_16d,_16e){
if(_16f(name)===_16e){
_16a[name].nix_channel=_16d;
_170(name,true,"nix");
}
};
var _171="Class "+_164+"\n "+"Private m_Intended\n"+"Private m_Auth\n"+"Public Sub SetIntendedName(name)\n "+"If isEmpty(m_Intended) Then\n"+"m_Intended = name\n"+"End If\n"+"End Sub\n"+"Public Sub SetAuth(auth)\n "+"If isEmpty(m_Auth) Then\n"+"m_Auth = auth\n"+"End If\n"+"End Sub\n"+"Public Sub SendMessage(data)\n "+_166+"(data)\n"+"End Sub\n"+"Public Function GetAuthToken()\n "+"GetAuthToken = m_Auth\n"+"End Function\n"+"Public Sub CreateChannel(channel, auth)\n "+"Call "+_167+"(m_Intended, channel, auth)\n"+"End Sub\n"+"End Class\n"+"Function "+_165+"(name, auth)\n"+"Dim wrap\n"+"Set wrap = New "+_164+"\n"+"wrap.SetIntendedName name\n"+"wrap.SetAuth auth\n"+"Set "+_165+" = wrap\n"+"End Function";
try{
window.execScript(_171,"vbscript");
}
catch(e){
throw new Error("Failed to create NIX VBScript object");
}
}
this.addReceiver=function(args){
_16a[args.receiverId]={r:args.receiver};
if(args.receiverId===".."){
return _172.call(this,args);
}
return _173.call(this,args);
};
this.getURI=function(){
return uri;
};
this.postAdd=function(_174,_175){
try{
var _176=window[_165](_174,_16a[_174].authToken);
OpenAjax.hub.IframeContainer._getTargetWin(_174).opener=_176;
}
catch(e){
return false;
}
return true;
};
this.sendMsg=function(_177,data){
if(_177===".."){
data.t=_16a[_177].authToken;
}
try{
if(_16a[_177]){
_16a[_177].nix_channel.SendMessage(JSON.stringify(data));
}
}
catch(e){
return false;
}
return true;
};
this.tunnelLoaded=function(){
var id=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var _178=OpenAjax.hub.IframeContainer._queryURLParam("oaht1");
var _179=OpenAjax.hub.IframeContainer._queryURLParam("oaht2");
var _17a=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
window.parent.parent.OpenAjax.hub.IframeContainer._NIX._receiveTunnelMsg(id,_178,_179,_17a);
return id;
};
this.removeReceiver=function(_17b){
delete _16a[_17b];
if(_17b===".."){
if(_17c){
clearInterval(_17c);
_17c=null;
}
}
};
function _17d(){
var _17e=_16a[".."].nix_channel;
if(_17e){
return;
}
if(++_16b>_168){
_170("..",false,"nix");
return;
}
if(!_17e&&window.opener&&"GetAuthToken" in window.opener){
_17e=window.opener;
var _17f=_16f("..");
if(_17e.GetAuthToken()==_17f){
_17e.CreateChannel(window[_165]("..",_17f),_17f);
_16a[".."].nix_channel=_17e;
window.opener=null;
_170("..",true,"nix");
return;
}
}
window.setTimeout(function(){
_17d();
},_169);
};
function _16f(_180){
if(!_16a[_180].authToken&&_180===".."){
_16a[".."].authToken=OpenAjax.hub.IframeContainer._queryURLParam("oaht");
}
return _16a[_180].authToken;
};
function _170(_181,_182,_183,_184){
if(!_16a[_181]){
return;
}
var rec=_16a[_181];
var _185=_181===".."?OpenAjax.hub.IframeContainer._queryURLParam("oahi"):_181;
if(!_182){
var _186;
if(_184){
_186={securityAlert:_184};
}
rec.r.transportReady(_185,null,false,_186);
return;
}
rec["ready_"+_183]=true;
if(rec.ready_nix&&rec.ready_fim){
_186={partnerOrigin:_16a[_181].partnerOrigin};
rec.r.transportReady(_185,null,true,_186);
}
};
function _16c(data){
var id=data.r||data.i;
if(!_16a[id]){
return;
}
if(_16f(id)!==data.t){
_16a[id].r.securityAlert(OpenAjax.hub.SecurityAlert.ForgedMsg);
return;
}
_16a[id].r.receiveMsg(data);
};
function _173(args){
_16a[args.receiverId].authToken=args.securityToken;
var _187="oahpv="+encodeURIComponent(_163)+"&oahi="+encodeURIComponent(args.receiverId)+(args.name?"&oahn="+encodeURIComponent(args.name):"")+"&oaht="+args.securityToken+"&oahu="+encodeURIComponent(args.tunnelURI);
var _188=args.uri.split("#");
_188[0]=_188[0]+((_188[0].indexOf("?")!=-1)?"&":"?")+_187;
uri=_188.length===1?_188[0]:_188[0]+"#"+_188[1];
return null;
};
function _172(args){
var pv=OpenAjax.hub.IframeContainer._queryURLParam("oahpv");
if(!pv||pv!==_163){
return null;
}
_17d();
var id=OpenAjax.hub.IframeContainer._queryURLParam("oahi");
var name=OpenAjax.hub.IframeContainer._queryURLParam("oahn");
var _189=_16f("..");
var _18a=args.securityToken;
var _18b=OpenAjax.hub.IframeContainer._queryURLParam("oahu");
if(!id||!_189||!_18b){
return null;
}
_16a[".."].childAuthToken=_18a;
_16a[".."].partnerOrigin=/^([a-zA-Z]+:\/\/[^\/?#:]+).*/.exec(_18b)[1];
var _18c="oahi="+encodeURIComponent(id)+"&oaht1="+_189+"&oaht2="+_18a+"&oahu="+encodeURIComponent(window.location.href);
var _18d=_18b.split("#");
_18d[0]=_18d[0]+((_18d[0].indexOf("?")!=-1)?"&":"?")+_18c;
var uri=_18d.length===1?_18d[0]:_18d[0]+"#"+_18d[1];
OpenAjax.hub.IframeContainer._createTunnelIframe(uri);
_17c=setInterval(_18e,100);
return name||id;
};
OpenAjax.hub.IframeContainer._NIX._receiveTunnelMsg=function(_18f,_190,_191,_192){
if(_16a[_18f].authToken!==_190){
_170(_18f,false,"fim","OpenAjax.hub.SecurityAlert.FramePhish");
return;
}
document.getElementById(_18f).src=_192+"#"+_191;
_16a[_18f].partnerOrigin=/^([a-zA-Z]+:\/\/[^\/?#:]+).*/.exec(_192)[1];
_170(_18f,true,"fim");
};
var _17c;
function _18e(){
var _193=window.location.href.split("#");
if(_193.length===2){
clearInterval(_17c);
_17c=null;
if(_193[1]===_16a[".."].childAuthToken){
_170("..",true,"fim");
return;
}
_170("..",false,"fim","OpenAjax.hub.SecurityAlert.FramePhish");
}
};
};
if(typeof OpenAjax._smash=="undefined"){
OpenAjax._smash={};
}
OpenAjax._smash.crypto={"strToWA":function(str,_194){
var bin=Array();
var mask=(1<<_194)-1;
for(var i=0;i<str.length*_194;i+=_194){
bin[i>>5]|=(str.charCodeAt(i/_194)&mask)<<(32-_194-i%32);
}
return bin;
},"hmac_sha1":function(_195,_196,_197){
var ipad=Array(16),opad=Array(16);
for(var i=0;i<16;i++){
ipad[i]=_195[i]^909522486;
opad[i]=_195[i]^1549556828;
}
var hash=this.sha1(ipad.concat(this.strToWA(_196,_197)),512+_196.length*_197);
return this.sha1(opad.concat(hash),512+160);
},"newPRNG":function(_198){
var that=this;
if((typeof _198!="string")||(_198.length<12)){
alert("WARNING: Seed length too short ...");
}
var _199=[43417,15926,18182,33130,9585,30800,49772,40144,47678,55453,4659,38181,65340,6787,54417,65301];
var _19a=[];
var _19b=0;
function _19c(_19d){
return that.hmac_sha1(_199,_19d,8);
};
function _19e(_19f){
var _1a0=_19c(_19f);
for(var i=0;i<5;i++){
_19a[i]^=_1a0[i];
}
};
_19e(_198);
return {"addSeed":function(seed){
_19e(seed);
},"nextRandomOctets":function(len){
var _1a1=[];
while(len>0){
_19b+=1;
var _1a2=that.hmac_sha1(_19a,(_19b).toString(16),8);
for(i=0;(i<20)&(len>0);i++,len--){
_1a1.push((_1a2[i>>2]>>(i%4))%256);
}
}
return _1a1;
},"nextRandomB64Str":function(len){
var _1a3="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var _1a4=this.nextRandomOctets(len);
var _1a5="";
for(var i=0;i<len;i++){
_1a5+=_1a3.charAt(_1a4[i]&63);
}
return _1a5;
}};
},"sha1":function(){
var _1a6=function(x,y){
var lsw=(x&65535)+(y&65535);
var msw=(x>>16)+(y>>16)+(lsw>>16);
return (msw<<16)|(lsw&65535);
};
var rol=function(num,cnt){
return (num<<cnt)|(num>>>(32-cnt));
};
function _1a7(t,b,c,d){
if(t<20){
return (b&c)|((~b)&d);
}
if(t<40){
return b^c^d;
}
if(t<60){
return (b&c)|(b&d)|(c&d);
}
return b^c^d;
};
function _1a8(t){
return (t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;
};
return function(_1a9,_1aa){
_1a9[_1aa>>5]|=128<<(24-_1aa%32);
_1a9[((_1aa+64>>9)<<4)+15]=_1aa;
var W=Array(80);
var H0=1732584193;
var H1=-271733879;
var H2=-1732584194;
var H3=271733878;
var H4=-1009589776;
for(var i=0;i<_1a9.length;i+=16){
var a=H0;
var b=H1;
var c=H2;
var d=H3;
var e=H4;
for(var j=0;j<80;j++){
W[j]=((j<16)?_1a9[i+j]:rol(W[j-3]^W[j-8]^W[j-14]^W[j-16],1));
var T=_1a6(_1a6(rol(a,5),_1a7(j,b,c,d)),_1a6(_1a6(e,W[j]),_1a8(j)));
e=d;
d=c;
c=rol(b,30);
b=a;
a=T;
}
H0=_1a6(a,H0);
H1=_1a6(b,H1);
H2=_1a6(c,H2);
H3=_1a6(d,H3);
H4=_1a6(e,H4);
}
return Array(H0,H1,H2,H3,H4);
};
}()};
if(!this.JSON){
JSON={};
}
(function(){
function f(n){
return n<10?"0"+n:n;
};
if(typeof Date.prototype.toJSON!=="function"){
Date.prototype.toJSON=function(key){
return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z";
};
String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){
return this.valueOf();
};
}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,_1ab=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,_1ac,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"},rep;
function _1ad(_1ae){
_1ab.lastIndex=0;
return _1ab.test(_1ae)?"\""+_1ae.replace(_1ab,function(a){
var c=meta[a];
return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
})+"\"":"\""+_1ae+"\"";
};
function str(key,_1af){
var i,k,v,_1b0,mind=gap,_1b1,_1b2=_1af[key];
if(_1b2&&typeof _1b2==="object"&&typeof _1b2.toJSON==="function"){
_1b2=_1b2.toJSON(key);
}
if(typeof rep==="function"){
_1b2=rep.call(_1af,key,_1b2);
}
switch(typeof _1b2){
case "string":
return _1ad(_1b2);
case "number":
return isFinite(_1b2)?String(_1b2):"null";
case "boolean":
case "null":
return String(_1b2);
case "object":
if(!_1b2){
return "null";
}
gap+=_1ac;
_1b1=[];
if(Object.prototype.toString.apply(_1b2)==="[object Array]"){
_1b0=_1b2.length;
for(i=0;i<_1b0;i+=1){
_1b1[i]=str(i,_1b2)||"null";
}
v=_1b1.length===0?"[]":gap?"[\n"+gap+_1b1.join(",\n"+gap)+"\n"+mind+"]":"["+_1b1.join(",")+"]";
gap=mind;
return v;
}
if(rep&&typeof rep==="object"){
_1b0=rep.length;
for(i=0;i<_1b0;i+=1){
k=rep[i];
if(typeof k==="string"){
v=str(k,_1b2);
if(v){
_1b1.push(_1ad(k)+(gap?": ":":")+v);
}
}
}
}else{
for(k in _1b2){
if(Object.hasOwnProperty.call(_1b2,k)){
v=str(k,_1b2);
if(v){
_1b1.push(_1ad(k)+(gap?": ":":")+v);
}
}
}
}
v=_1b1.length===0?"{}":gap?"{\n"+gap+_1b1.join(",\n"+gap)+"\n"+mind+"}":"{"+_1b1.join(",")+"}";
gap=mind;
return v;
}
};
if(typeof JSON.stringify!=="function"){
JSON.stringify=function(_1b3,_1b4,_1b5){
var i;
gap="";
_1ac="";
if(typeof _1b5==="number"){
for(i=0;i<_1b5;i+=1){
_1ac+=" ";
}
}else{
if(typeof _1b5==="string"){
_1ac=_1b5;
}
}
rep=_1b4;
if(_1b4&&typeof _1b4!=="function"&&(typeof _1b4!=="object"||typeof _1b4.length!=="number")){
throw new Error("JSON.stringify");
}
return str("",{"":_1b3});
};
}
if(typeof JSON.parse!=="function"){
JSON.parse=function(text,_1b6){
var j;
function walk(_1b7,key){
var k,v,_1b8=_1b7[key];
if(_1b8&&typeof _1b8==="object"){
for(k in _1b8){
if(Object.hasOwnProperty.call(_1b8,k)){
v=walk(_1b8,k);
if(v!==undefined){
_1b8[k]=v;
}else{
delete _1b8[k];
}
}
}
}
return _1b6.call(_1b7,key,_1b8);
};
cx.lastIndex=0;
if(cx.test(text)){
text=text.replace(cx,function(a){
return "\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
});
}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){
j=eval("("+text+")");
return typeof _1b6==="function"?walk({"":j},""):j;
}
throw new SyntaxError("JSON.parse");
};
}
})();
OpenAjax.hub.InlineContainer=function(hub,_1b9,_1ba){
if(!hub||!_1b9||!_1ba||!_1ba.Container||!_1ba.Container.onSecurityAlert){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._params=_1ba;
this._hub=hub;
this._id=_1b9;
this._onSecurityAlert=_1ba.Container.onSecurityAlert;
this._onConnect=_1ba.Container.onConnect?_1ba.Container.onConnect:null;
this._onDisconnect=_1ba.Container.onDisconnect?_1ba.Container.onDisconnect:null;
this._scope=_1ba.Container.scope||window;
if(_1ba.Container.log){
var that=this;
this._log=function(msg){
try{
_1ba.Container.log.call(that._scope,"InlineContainer::"+_1b9+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
this._connected=false;
this._subs=[];
this._subIndex=0;
hub.addContainer(this);
};
OpenAjax.hub.InlineContainer.prototype.getHub=function(){
return this._hub;
};
OpenAjax.hub.InlineContainer.prototype.sendToClient=function(_1bb,data,_1bc){
if(this.isConnected()){
var sub=this._subs[_1bc];
try{
sub.cb.call(sub.sc,_1bb,data,sub.d);
}
catch(e){
OpenAjax.hub._debugger();
this._client._log("caught error from onData callback to HubClient.subscribe(): "+e.message);
}
}
};
OpenAjax.hub.InlineContainer.prototype.remove=function(){
if(this.isConnected()){
this._disconnect();
}
};
OpenAjax.hub.InlineContainer.prototype.isConnected=function(){
return this._connected;
};
OpenAjax.hub.InlineContainer.prototype.getClientID=function(){
return this._id;
};
OpenAjax.hub.InlineContainer.prototype.getPartnerOrigin=function(){
if(this._connected){
return window.location.protocol+"//"+window.location.hostname;
}
return null;
};
OpenAjax.hub.InlineContainer.prototype.getParameters=function(){
return this._params;
};
OpenAjax.hub.InlineContainer.prototype.connect=function(_1bd,_1be,_1bf){
if(this._connected){
throw new Error(OpenAjax.hub.Error.Duplicate);
}
this._connected=true;
this._client=_1bd;
if(this._onConnect){
try{
this._onConnect.call(this._scope,this);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onConnect callback to constructor: "+e.message);
}
}
this._invokeOnComplete(_1be,_1bf,_1bd,true);
};
OpenAjax.hub.InlineContainer.prototype.disconnect=function(_1c0,_1c1,_1c2){
if(!this._connected){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
this._disconnect();
if(this._onDisconnect){
try{
this._onDisconnect.call(this._scope,this);
}
catch(e){
OpenAjax.hub._debugger();
this._log("caught error from onDisconnect callback to constructor: "+e.message);
}
}
this._invokeOnComplete(_1c1,_1c2,_1c0,true);
};
OpenAjax.hub.InlineContainer.prototype.subscribe=function(_1c3,_1c4,_1c5,_1c6,_1c7){
this._assertConn();
this._assertSubTopic(_1c3);
if(!_1c4){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var _1c8=""+this._subIndex++;
var _1c9=false;
var msg=null;
try{
var _1ca=this._hub.subscribeForClient(this,_1c3,_1c8);
_1c9=true;
}
catch(e){
_1c8=null;
msg=e.message;
}
_1c5=_1c5||window;
if(_1c9){
this._subs[_1c8]={h:_1ca,cb:_1c4,sc:_1c5,d:_1c7};
}
this._invokeOnComplete(_1c6,_1c5,_1c8,_1c9,msg);
return _1c8;
};
OpenAjax.hub.InlineContainer.prototype.publish=function(_1cb,data){
this._assertConn();
this._assertPubTopic(_1cb);
this._hub.publishForClient(this,_1cb,data);
};
OpenAjax.hub.InlineContainer.prototype.unsubscribe=function(_1cc,_1cd,_1ce){
this._assertConn();
if(typeof _1cc==="undefined"||_1cc==null){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var sub=this._subs[_1cc];
if(!sub){
throw new Error(OpenAjax.hub.Error.NoSubscription);
}
this._hub.unsubscribeForClient(this,sub.h);
delete this._subs[_1cc];
this._invokeOnComplete(_1cd,_1ce,_1cc,true);
};
OpenAjax.hub.InlineContainer.prototype.getSubscriberData=function(_1cf){
this._assertConn();
return this._getSubscription(_1cf).d;
};
OpenAjax.hub.InlineContainer.prototype.getSubscriberScope=function(_1d0){
this._assertConn();
return this._getSubscription(_1d0).sc;
};
OpenAjax.hub.InlineContainer.prototype._invokeOnComplete=function(func,_1d1,item,_1d2,_1d3){
if(func){
try{
_1d1=_1d1||window;
func.call(_1d1,item,_1d2,_1d3);
}
catch(e){
OpenAjax.hub._debugger();
this._client._log("caught error from onComplete callback: "+e.message);
}
}
};
OpenAjax.hub.InlineContainer.prototype._disconnect=function(){
for(var _1d4 in this._subs){
this._hub.unsubscribeForClient(this,this._subs[_1d4].h);
}
this._subs=[];
this._subIndex=0;
this._connected=false;
};
OpenAjax.hub.InlineContainer.prototype._assertConn=function(){
if(!this._connected){
throw new Error(OpenAjax.hub.Error.Disconnected);
}
};
OpenAjax.hub.InlineContainer.prototype._assertPubTopic=function(_1d5){
if((_1d5==null)||(_1d5=="")||(_1d5.indexOf("*")!=-1)||(_1d5.indexOf("..")!=-1)||(_1d5.charAt(0)==".")||(_1d5.charAt(_1d5.length-1)==".")){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
};
OpenAjax.hub.InlineContainer.prototype._assertSubTopic=function(_1d6){
if(!_1d6){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
var path=_1d6.split(".");
var len=path.length;
for(var i=0;i<len;i++){
var p=path[i];
if((p=="")||((p.indexOf("*")!=-1)&&(p!="*")&&(p!="**"))){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
if((p=="**")&&(i<len-1)){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
}
};
OpenAjax.hub.InlineContainer.prototype._getSubscription=function(_1d7){
var sub=this._subs[_1d7];
if(sub){
return sub;
}
throw new Error(OpenAjax.hub.Error.NoSubscription);
};
OpenAjax.hub.InlineHubClient=function(_1d8){
if(!_1d8||!_1d8.HubClient||!_1d8.HubClient.onSecurityAlert||!_1d8.InlineHubClient||!_1d8.InlineHubClient.container){
throw new Error(OpenAjax.hub.Error.BadParameters);
}
this._params=_1d8;
this._onSecurityAlert=_1d8.HubClient.onSecurityAlert;
this._scope=_1d8.HubClient.scope||window;
this._container=_1d8.InlineHubClient.container;
if(_1d8.HubClient.log){
var that=this;
this._log=function(msg){
try{
_1d8.HubClient.log.call(that._scope,"InlineHubClient::"+that._container.getClientID()+": "+msg);
}
catch(e){
OpenAjax.hub._debugger();
}
};
}else{
this._log=function(){
};
}
};
OpenAjax.hub.InlineHubClient.prototype.connect=function(_1d9,_1da){
this._container.connect(this,_1d9,_1da);
};
OpenAjax.hub.InlineHubClient.prototype.disconnect=function(_1db,_1dc){
this._container.disconnect(this,_1db,_1dc);
};
OpenAjax.hub.InlineHubClient.prototype.getPartnerOrigin=function(){
return this._container.getPartnerOrigin();
};
OpenAjax.hub.InlineHubClient.prototype.getClientID=function(){
return this._container.getClientID();
};
OpenAjax.hub.InlineHubClient.prototype.subscribe=function(_1dd,_1de,_1df,_1e0,_1e1){
return this._container.subscribe(_1dd,_1de,_1df,_1e0,_1e1);
};
OpenAjax.hub.InlineHubClient.prototype.publish=function(_1e2,data){
this._container.publish(_1e2,data);
};
OpenAjax.hub.InlineHubClient.prototype.unsubscribe=function(_1e3,_1e4,_1e5){
this._container.unsubscribe(_1e3,_1e4,_1e5);
};
OpenAjax.hub.InlineHubClient.prototype.isConnected=function(){
return this._container.isConnected();
};
OpenAjax.hub.InlineHubClient.prototype.getScope=function(){
return this._scope;
};
OpenAjax.hub.InlineHubClient.prototype.getSubscriberData=function(_1e6){
return this._container.getSubscriberData(_1e6);
};
OpenAjax.hub.InlineHubClient.prototype.getSubscriberScope=function(_1e7){
return this._container.getSubscriberScope(_1e7);
};
OpenAjax.hub.InlineHubClient.prototype.getParameters=function(){
return this._params;
};

