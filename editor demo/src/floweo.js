//February 20, 2011 - Revision 2 (March 10, 2011)

///////////////////
//Global Variables - are attached to the body element that is required for all html pages and serves as the viewport
var Globals = {
	ObjCntr : 0
}

/////////////////
//Module Factory
var ModuleFactory = {
	prnt2 : function(self){},//alert('hiya! : ' + self.Name);},
	
	prnt3 : function(){},//alert('ayih!');},

	prnt4 : function(event,self){},//alert('ayih!' + event.target.id);},
	
	moveIt : function(taskObj){
		
		var allIn = taskObj.inputs, 
			allOut = taskObj.targets, 
			eachOut;
			
		for(eachOut in allOut){} //this line is just to get the lbl of the hashed item in task.targets
		
		for(var eachIn in allIn){
			
			
			var bp = allOut[eachOut][1]; 
			var bpVal = bp;
			
			for(var it in bpVal){
				bpVal = bpVal[it]; 
				break;
			}
			
			if(taskObj.begin){ 
			
				for(var it in bpVal){ 
					bpVal[it] = taskObj.startVal + 'px'; 
				} 
				
				allOut[eachOut][0].Revise(bp); 
				taskObj.begin = 0; 
			}
			
			var css_obj = allIn[eachIn][0];
			var prop = allIn[eachIn][1];
			
			var currVal = parseFloat( css_obj[prop] );
			if(currVal < parseFloat(taskObj.endVal)){
				
				currVal = (currVal + 5) + 'px';
				
				for(var it in bpVal){ 
					bpVal[it] = currVal; 
				} 
				
				allOut[eachOut][0].Revise(bp);
			}
			else{ 
				taskObj.stop(); 
			}
		}
	}
};

//////////////////
//Timer Manager
Tsk_Mngr = {
	
	timer : null, //holds return value of setInterval()
	
	taskArray : {},
	
	addTask : function(taskObj){
		
		//add task to taskArray
		this.taskArray[taskObj.taskName] = taskObj;
		
		//start setInterval if not already started and pass launchTasks function as parameter to it
		if(!this.timer){ 
			this.timer = setInterval(this.launchTasks, .01);
		}
		
		//call onStart functions
		for(var evnt in taskObj.onStart){
			
			var temp = taskObj.onStart[evnt];
			temp[0][temp[1]]();
		}
	},
	
	removeTask : function(taskObj){
		
		//loop through functions linked onEnd event
		for(var evnt in taskObj.onEnd){
			
			var temp = taskObj.onEnd[evnt];
			temp[0][ temp[1] ]();
			
		}
		
		//remove task from taskArray
		delete this.taskArray[taskObj.taskName];
		
		//if taskArray is empty, stop setInterval
		var is_empty = (function(self){
							for(var i in self.taskArray){
								return false;
							}
							return true;
						})(this);
						
		if(is_empty){
			
			clearInterval(this.timer);
			
			this.timer = null;
		}
	},
	
	//function called by setInterval()
	launchTasks : function(){
		var self = Tsk_Mngr, tsk;
		
		for(var task in self.taskArray){
			
			tsk = self.taskArray[task];
			
			tsk.twnFnc[1](tsk);
			
			//call onFrame functions
			for(var evnt in tsk.onFrame){
				
				var temp = tsk.onFrame[evnt];
				temp[0][temp[1]]();
			}			
		}
	}
};

/////////////////
//Object Manager
var Obj_Mngr = {};

///////////////////
//Blueprint Object
function Blueprint() //{Element : "", Attributes : {name:""}, Render : ""}	
{
	this.Name = null;
	this.Element = null; 
	this.Attributes = {};
	this.Events = {};
	this.Render = {};
	this.Constraints = {};
	this.Offsets = {};
	this.DataObjs = {};
	this.Tasks = {};	//Tasks: {'taskName':{'inputs':{'input.property.Path':'ref',...}, startVal:"", endVal:"", 'twnFnc':['fncName','ref'], targets:{'output:property:value.path':'ref',...}, onStart:{}, onEnd:{}, onFrame:{Obj_Mngr.obj.Tasks.taskname.start:[calling context, reference]} },...}
	this.Behaviors = {}; //Behaviors: {'behaviorName':[], 'behaviorName2':[],...}
}

//////////////////
//Autogram Object
function Autogram(Bprint)	//Autogram Constructor
{
	this.Name = "";
	this.Element = null;
	this.Links = {};
	this.Events = {};						//Events:{'add/remove':[['eventType',['evtFunc', 'evtFunc2', ..]], [] ]} //all events are set to false (no capture) by default
	this.Constraints = {};
	this.Offsets = {};						//Offsets: {'attrName':[attrValue,obj.name]/delete}
	this.DataObjs = {};						//DataObjs: { OpName:{Inputs:{'objName':reference}, Outputs:{'objName':reference}} }
	this.Tasks = {};						//Tasks: {'taskName':taskObject, ... }
	this.Behaviors = {};					//Behaviors: {'behaviorName':behaviorObject, ...}
	this.BPCopy = new Blueprint();
	
	//set up Autogram with user specified settings
	if(Bprint){
		this.Revise(Bprint);
	}		
}
Autogram.prototype = {
	
	//Internal Functions
	//------------------
	_resolveProperty : function(element, attrChain)
	{
		var splt = attrChain.split('.'); //account for nested properties (style.height.etc...)
		var last = splt.pop();
		for(var i in splt){ element = element[ splt[i] ]; }
		return [element,last];
	},
	
	_updateAttrs : function(self, property, attrValue) //{name:["",{refname:delete,refname:ref}]}
	{
		//update local blueprint copy
		self.BPCopy.Attributes[property] = attrValue;
		
		//calculate final value using offset values and send this value to rest of function
		attrValue = this._resolveOffsets(self,property,attrValue);
		
		if( this._checkConstraints(self,property,attrValue) ){
			return; 
		}
		
		var ta = this._resolveProperty(self.Element, property);
		
		//apply attribute
		ta[0][ ta[1] ] = attrValue; 
		
		var linkedObjs = self.Links[property];
		for(var obj in linkedObjs){ //update attrs for object links
		
			if(linkedObjs[obj] == null){
				delete linkedObjs[obj]; 
				delete self.Links[property.split('.')[0]][obj];
			}
			else{ 
				var tpb = new Blueprint(); 
				tpb.Attributes[property] = attrValue;
				linkedObjs[obj].Revise(tpb); 
			}
		}	
	},
	
	_checkConstraints : function(self,property,attrValue)
	{
		//1. check attrValue against constraints
		//2. run attr assignment code if:
		//	2.a. there is no matching constraint
		//	2.b. the constraint exists and is 'i' (inclusive)
		//3. run constraint 'event' methods if constraint exists

		var iFlag = 0;
		var tmp = self.Constraints[property];
		
		if(tmp){
			if("_"+attrValue in tmp){
				
				if(tmp["_"+attrValue][1] == 'e'){ iFlag = 1; }
				
				//run methods
				for(var fname in tmp["_"+attrValue][2]){ 
				
					tmp["_"+attrValue][2][fname](self);
				}
			}
			
			var taNum = parseFloat(attrValue.split('px')[0]);
			for(var name in tmp){ //account for dynamic constraints and ranges
			
				if(tmp[name][0].Element){
					
					var ta = this._resolveProperty(tmp[name][0].Element,property);
					
					if(attrValue == ta[0][ ta[1] ]){
						
						if(tmp[name][1] == 'e'){ iFlag = 1; } 
						
						//run methods
						for(var fname in tmp[name][2]){ 
							tmp[name][2][fname](self); 
						}
					}
				}
				else if(tmp[name][0] instanceof Array){ //less than or greater than or greater than value 1 and less than value 2
				
					var rngArray = tmp[name][0];
					if( (rngArray[0] == "-" && taNum <= rngArray[1]) || (taNum >= rngArray[0] && rngArray[1] == "-") || (taNum >= rngArray[0] && taNum <= rngArray[1]) ){
						
						if(tmp[name][1] == 'e'){ iFlag = 1; }
						
						//run methods
						for(var fname in tmp[name][2]){
							tmp[name][2][fname](self); 
						}
					}
				}
			}
			
			if(iFlag){ 
				return 1; 
			}
		}
		
		return 0;
	},
	
	_resolveOffsets : function(self,property,attrValue)
	{
		if(property in self.Offsets){
			
			if(self.Offsets[property][0] == 'link'){ return attrValue; }
			
			var taNum = parseFloat(attrValue.split('px')[0]);
			
			return (taNum + self.Offsets[property][0]) + 'px'; 
		}
		
		return attrValue;
	},
	
	//External Functions
	//------------------
	updateObjList : function(self,refObj,property)
	{
		for(var lbl in refObj){
			
			if(refObj[lbl] == 'delete'){
				
				delete self.Links[property][lbl];
			}
			else{
				
				if( !(property in self.Links) ){ 
					self.Links[property] = {};
				}
				
				if(refObj[lbl] === 'ref'){ 
					refObj[lbl] = Obj_Mngr[lbl]; 
				}
				
				self.Links[property][lbl] = refObj[lbl];
			} 
		}
	},
	
	
	_parseName : function(Bluprnt){
		
		if(Bluprnt.Name){ //register object in manager 
		
			if(Bluprnt.Name != this.Name){ 
			
				delete Obj_Mngr[this.Name]; //if name change, delete old name reference and update html id property
				
				this.Name = Bluprnt.Name;
				
				this.BPCopy.Name = this.Name;
				
				Obj_Mngr[this.Name] = this;
				
				if(this.Element){ this.Element.id = this.Name; }	
			}				
		}
		else if(!Bluprnt.Name && this.Name == ""){ 
		
			throw new Error("Error! No Name Was Given For Autogram!"); 
		}
	},
	
	_parseElement : function(Bluprnt){
		
		//Parse Element specifications
		//1. Check to see if element is null in Blueprint and Autogram
		//	1.a if so, throw error!
		//	1.b if only Blueprint is null, retrieve element reference from autogram object
		//	1.c otherwise, set autogram reference to new Blueprint element
		if(Bluprnt.Element == null){
			
			if(this.Element == null) throw new Error("You haven't specified an element!");//return null;//alert("You haven't specified an element!"); return;}
			
			return this.Element;
		}
		else{
			
			if(this.Element && this.Element.parentNode){ 
				this.Element.parentNode.removeChild(this.Element);
			}
			
			this.Element = document.createElement(Bluprnt.Element);
			
			this.Element.id = this.Name; //link HTML with custom object system
			
			this.BPCopy.Element = Bluprnt.Element;
			
			return this.Element;
		}
	},
	
	_parseOffsets : function(Bluprnt){
		
		//2. Process Offsets
		if(Bluprnt.Offsets){ //Offsets: {'attrName':[attrValue,linked_objname]/delete}
		
			var offsets = Bluprnt.Offsets,
				tobj, 
				tobj2;
			for(var name in offsets){
				
				if(offsets[name] === 'delete'){
					
					tobj = this.Offsets[name][1];
					tobj2 = {}; 
					tobj2[this.Name] = 'delete';
					
					tobj.updateObjList(tobj,tobj2,name); 
					
					delete this.Offsets[name]; 
					delete this.BPCopy.Offsets[name];
				}
				else{
					
					if(!offsets[name][1] && !this.Offsets[name]){
						throw new Error('Please set offset value properly!'); 
					}
					
					if(!offsets[name][1]){ 
						tobj = this.Offsets[name][1]; 
					} 
					else{ //only update object list if setting new offset link
					
						if(typeof offsets[name][0] === 'string' && offsets[name][0] != 'link'){
							
							//allow editor to set offset values using strings
							offsets[name][0] = parseFloat(offsets[name][0]); 
						} 
						
						tobj = Obj_Mngr[ offsets[name][1] ];
						//console.log('tobj: ', tobj, ' : ', offsets[name][1]);
						tobj2 = {}; 
						tobj2[this.Name] = this;
						tobj.updateObjList(tobj,tobj2,name);
						
						if( this.Offsets[name] ){ //remove previous linked object when linking to another object
						
							var current = this.Offsets[name][1];
							if(current.Name != tobj.Name){
								
								tobj2 = {}; 
								tobj2[this.Name] = 'delete'; 
								current.updateObjList(current,tobj2,name); 
							} 
						} 
					}
					
					this.Offsets[name] = [offsets[name][0], tobj];
					this.BPCopy.Offsets[name] = [offsets[name][0], tobj.Name];
					
					//update newly linked object to see offsets updated in realtime
					var ta = this._resolveProperty(tobj.Element,name);
					
					var tbp = new Blueprint(); 
					tbp.Attributes[name] = ta[0][ ta[1] ]; 
					
					tobj.Revise(tbp);
				}
			}
		}
	},
	
	_parseConstraints : function(Bluprnt){
		
		//Parse Constraints (set constraints before setting attrs)
		//3. Copy/Delete Constraint Values in(to) Autogram Constraint object
		if(Bluprnt.Constraints) //Constraints : {"attrName" : {_'value/objref_value/value_range':[value/ref,'i/e', {funcName:funcRef, etc.}], '':[]}, ""}
		{
			var BP_sub = Bluprnt.Constraints;
			for(var attrName in BP_sub){
				
				if(BP_sub[attrName] == 'delete'){
					
					delete this.Constraints[attrName]; 
					delete this.BPCopy.Constraints[attrName]; 
				}
				else{
					
					if(!(attrName in this.Constraints)){ 
					
						this.Constraints[attrName] = {}; 
						this.BPCopy.Constraints[attrName] = {}; 
					}
					
					var bav = BP_sub[attrName];
					var BPCCav = this.BPCopy.Constraints[attrName];
					var cav = this.Constraints[attrName];
					
					for(var valueName in BP_sub[attrName]){
						
						if(bav[valueName] == 'delete'){
							
							delete cav[valueName]; 
							delete BPCCav[valueName]; 
						}
						else{
							
							//copy constraint values to local blueprint copy - FIX THIS SECTION!!!
							BPCCav[valueName] = [];
							if(typeof bav[valueName][0] == 'string'){ 
								bav[valueName][0] = Obj_Mngr[valueName.split('_').pop()]; 
							} //convert 'ref' back real reference
							
							BPCCav[valueName][0] = (bav[valueName][0] instanceof Autogram) ? 'ref' : bav[valueName][0];
							
							BPCCav[valueName][1] = bav[valueName][1]; 
							
							BPCCav[valueName][2] = {};
							
							//check for attached methods that user wants to delete and convert func refs to 'ref' string for bpcopy and vice versa to rebuild
							var tmp2 = bav[valueName][2];
							for(var fncname in tmp2){
								
								if(tmp2[fncname] == 'delete'){ 
								
									delete cav[valueName][2][fncname];
									delete BPCCav[valueName][2][fncname]; 
									delete tmp2[fncname]; 
								}
								else{ 
									BPCCav[valueName][2][fncname] = 'ref';
									tmp2[fncname] = ModuleFactory[fncname];
									//if(tmp2[fncname] == 'ref'){  }
								}
							}
							
							cav[valueName] = bav[valueName];
						}
					}
				}
			}
		}
	},
	
	_parseAttributes : function(Bluprnt){
		
		//Parse attributes
		//4. Loop through attributes and assign them to element reference
		//	3.a check to see what type in attribute array (or none for empty array)
		//		3.1 if string, either delete then recontinue loop or (update object link first!) then assign attribute name
		//		3.2 if object, either delete or add object links
		if(Bluprnt.Attributes){
			
			var BP_sub = Bluprnt.Attributes;
			for(var property in BP_sub){
				
				if(BP_sub[property] == 'delete'){
					
					this.Element.removeAttribute(property);
					delete this.BPCopy.Attributes[property];
					
					for(var inc in this.Links[property]){ //remove attrs for object links
						var tbb = new Blueprint(); 
						tbb.Attributes[property] = 'delete';
						this.Links[property][inc].Revise(tbb); 
					}
					
					continue;
				}
				
				this._updateAttrs(this,property,BP_sub[property]);
			}
		}
	},
	
	_parseRender : function(Bluprnt){
		
		//5. Attach autogram to 'surface' specified in Render
		if(Bluprnt.Render){
			
			var BP_sub = Bluprnt.Render;
			for(var surface in Bluprnt.Render){
				
				if(surface == 'document.body'){
					
					var surface_arr = surface.split('.');
					window[surface_arr[0]][surface_arr[1]].appendChild(this.Element); 
					this.BPCopy.Render[surface] = 'ref';
				}
				else{
					
					if(BP_sub[surface] == 'ref'){ BP_sub[surface] = Obj_Mngr[surface]; }
					
					BP_sub[surface].Element.appendChild(this.Element); 
					
					this.BPCopy.Render[BP_sub[surface].Name] = 'ref'; 
				}
			}
		}
	},
	
	_parseEvents : function(Bluprnt){
		
		//6. Process Event Listeners
		if(Bluprnt.Events){
			
			if(Bluprnt.Events.add){ //Events:{'add':[['click',['prnt4']]]}
			
				var BP_sub = Bluprnt.Events.add;
				for(var evt in BP_sub){
					
					//create event listener with module factory function that sets tranfser data to id/or uses target and loops through autogram event object
					var etype = BP_sub[evt];
					this.Element.addEventListener(etype[0], this.RunEvents,false);
					
					if(!(etype[0] in this.Events)){ this.Events[etype[0]] = {}; }
					
					for(var evtArray in etype[1]){
						
						//add all the methods to autogram event object and blueprint copy
						this.Events[ etype[0] ][ etype[1][evtArray] ] = ModuleFactory[ etype[1] [evtArray] ];
					}
				}
			}
			
			if(Bluprnt.Events.remove){ //Events:{'remove':[['click',['prnt4']]]}
			
				var BP_sub = Bluprnt.Events.remove;
				for(var evt in BP_sub){
					
					var etype = BP_sub[evt];
					if(etype.length == 1){
						delete this.Events[etype[0]]; 
						delete this.BPCopy.Events[etype[0]];
					}
					else{
						
						for(var evtArray in etype[1]){
							//remove individual methods for event listener
							delete this.Events[ etype[0] ][ etype[1][evtArray] ];
						}
						
						//use module factory function to remove event listener if autogram event object is empty
						var is_empty = (function(self){
											for(var i in self.Events[etype[0]]){ return false; }
											return true;
										})(this);
						
						if(is_empty){
							this.Element.removeEventListener(etype[0], this.RunEvents, false); 
							delete this.Events[ etype[0] ]; 
						}
					}
				}
			}
			
			//rebuild local blueprint copy
			var BP_sub = this.Events;
			this.BPCopy.Events.add = [];
			
			for(var evnt in BP_sub){
				
				var tmpArry = []; 
				
				for(var fnc in BP_sub[evnt]){ tmpArry.push(fnc); }
				
				this.BPCopy.Events.add.push( [evnt, tmpArry] );
			}
		}
	},
	
	_parseDataObjs : function(Bluprnt){
		
		//7. Process Linked Data Objects 
		if(Bluprnt.DataObjs){ //DataObjs: { OpName:{Inputs:{'objName':reference}, Outputs:{'objName':reference}} }
		
			var BP_sub = Bluprnt.DataObjs;
			for(var oname in BP_sub){ 
			
				this.DataObjs[oname] = {}; 
				this.BPCopy.DataObjs[oname] = {}; 
				
				for(var ioname in BP_sub[oname]){
					
					this.DataObjs[oname][ioname] = {}; 
					this.BPCopy.DataObjs[oname][ioname] = {};
					
					var BP_sub2 = BP_sub[oname][ioname];
					for(var lbl in BP_sub2){
						
						if(BP_sub2[lbl] == 'ref'){ 
							this.DataObjs[oname][ioname][lbl] = Obj_Mngr[BP_sub2[lbl]]; 
						}
						else{ 
							this.DataObjs[oname][ioname][lbl] = BP_sub2[lbl]; 
						}
						
						this.BPCopy.DataObjs[oname][ioname][lbl] = 'ref';
					}
				}
			}
		}
	},
	
	_parseTasks : function(Bluprnt){
		
		//8. Parse task profiles
		if(Bluprnt.Tasks){ //Tasks: {'taskName':{'inputs':{'input.property.Path':'ref',...}, startVal:"", endVal:"", 'twnFnc':['fncName','ref'], targets:{'output:property:value.path':'ref',...}, onStart:{}, onEnd:{}, onFrame:{Obj_Mngr.obj.Tasks.taskname.start:[calling context, reference]} },...}
		
			//loop through each task and:
			var tasks = Bluprnt.Tasks;
			for(var task in tasks){
				
				//update BPCopy with "primitive value" values (other values have to be deep copied)
				//check to see if BPCopy task exists already, if not, create it
				if( !(task in this.BPCopy.Tasks) ){ this.BPCopy.Tasks[task] = {}; }
				
				var sub3 = (task in this.Tasks) ? this.Tasks[task] : (this.Tasks[task] = new AGTask(task)); //else create it
				
				//loop through task profile
				var sub = tasks[task]; 
				var sub2 = this.BPCopy.Tasks[task];
				for(var tskpf in sub){
					
					if(tskpf == 'targets' || tskpf == 'events' || tskpf == 'inputs'){ 
						if(!(tskpf in sub2)){ sub2[tskpf] = {}; } 
						continue; 
					}
					
					if(tskpf == 'startVal' || tskpf == 'endVal'){ 
						sub2[tskpf] = sub[tskpf]; 
						sub3[tskpf] = sub[tskpf]; 
					}
					
					if(tskpf == 'twnFnc'){
						
						//update BPCopy
						sub2[tskpf] = [ sub[tskpf][0], 'ref' ];
						
						//rebuild references
						sub3[tskpf] = [ sub[tskpf][0] ];
						
						var to_add = (sub[tskpf][1] == 'ref') ? ModuleFactory[ sub[tskpf][0] ] : sub[tskpf][1];
						
						sub3[tskpf].push(to_add);
					}
				}
				
				sub = tasks[task].inputs; 
				for(var trgt in sub){
					
					if(sub[trgt] == 'delete'){ 
						delete sub3.inputs[trgt]; 
						delete sub2.inputs[trgt]; 
						continue; 
					}
					
					if(sub[trgt] == 'ref'){ //split, locate in obj mngr, etc.
					
						var tmp = trgt.split('.'); 
						var last = tmp.pop(); 
						var refr = Obj_Mngr[ tmp.shift() ];
						
						for(var i in tmp){ refr = refr[tmp[i]]; }
						
						sub[trgt] = [refr, last];
					}
					
					sub2.inputs[trgt] = 'ref'; 
					sub3.inputs[trgt] = [ sub[trgt][0], sub[trgt][1] ];
				}
				
				sub = tasks[task].targets;
				for(var trgt in sub){
					
					if(sub[trgt] == 'delete'){ 
						delete sub3.targets[trgt]; 
						delete sub2.targets[trgt]; 
						continue; 
					}
					
					if(sub[trgt] == 'ref'){ //split, locate in obj mngr, build blueprint, etc.
					
						var tmp = trgt.split(':'); //'tmpA:Attributes:style.height':'ref'
						
						var objRef = Obj_Mngr[tmp.shift()];
						
						var attr = tmp.shift();
						
						var bprint = {}; 
						
						bprint[attr] = {};	
						
						bprint[attr][tmp.shift()] = ""; //ISSUE HERE! THIS IS ONLY SUITABLE FOR SETTING TARGET CONTAINERS FOR ATTRIBUTE VALUES
						
						sub[trgt] = [objRef,bprint];
					}
					
					sub2.targets[trgt] = 'ref'; 
					sub3.targets[trgt] = [ sub[trgt][0], sub[trgt][1] ];
				}
				
				var tskEvents = function(onEvent){
					
					for(var fnc in sub){ //ModuleFactory.fncName, Obj_Mngr.obj.Tasks.taskname.start
					
						if( !(onEvent in sub2) ){ sub2[onEvent] = {}; }
						
						if(sub[fnc] == 'delete'){ 
							delete sub3[onEvent][fnc]; 
							delete sub2[onEvent][fnc]; 
							continue;
						}
						
						if(sub[fnc] == 'ref'){
							
							var str = fnc.split('.');
							var last = str.pop();
							var refch = window[str.shift()];
							
							for(var refr in str){
								
								console.log('_parseTasks, tskEvents(): ', refch);
								refch = refch[ str[refr] ];
							}
							
							sub[fnc] = [refch,last];
						}
						
						sub3[onEvent][fnc] = sub[fnc];
						sub2[onEvent][fnc] = 'ref';
					}
				};
				
				if(tasks[task].onStart){ 
					sub = tasks[task].onStart; 
					tskEvents('onStart'); 
				}
				
				if(tasks[task].onEnd){ 
					sub = tasks[task].onEnd; 
					tskEvents('onEnd'); 
				}
				
				if(tasks[task].onFrame){ 
					sub = tasks[task].onFrame; 
					tskEvents('onFrame'); 
				}
			}
		}
	},
	
	_parseBehaviors : function(Bluprnt){
		
		//9. Parse behavior profiles
		if(Bluprnt.Behaviors){ //Behaviors: {'behaviorName':[taskRef1, taskRef2,...], 'behaviorName2':[],}
		
			var behaviors = Bluprnt.Behaviors;
			for(var bname in behaviors){
				
				var bpname = behaviors[bname];
				var tArr = [];
				this.BPCopy.Behaviors[bname] = [];
				
				for(var tsk in bpname){
					
					this.BPCopy.Behaviors[bname].push( bpname[tsk] ); //for rebuilding later
					
					//this can only find Tasks that exist within current Autogram
					var to_add = (typeof bpname[tsk] === 'string') ? this.Tasks[ bpname[tsk] ] : bpname[tsk];
					
					tArr.push(to_add);
				}
				
				this.Behaviors[bname] = new AGBehavior(bname,tArr);
			}
		}
	},
	
	//only external function by default - ORDER OF PARSING BLUEPRINT INFO IS IMPORTANT!!
	Revise : function(Bluprnt){	
		
		this._parseName(Bluprnt);
		
		this._parseElement(Bluprnt);
		
		this._parseOffsets(Bluprnt);
		
		this._parseConstraints(Bluprnt);
		
		this._parseAttributes(Bluprnt);
		
		this._parseRender(Bluprnt);
		
		this._parseEvents(Bluprnt);
		
		this._parseDataObjs(Bluprnt);
		
		this._parseTasks(Bluprnt);
		
		this._parseBehaviors(Bluprnt);
	},
	
	RunEvents : function(event){
		
		self = Obj_Mngr[this.id];
		
		efunc = self.Events[event.type];
		
		for(var fnc in efunc){
			efunc[fnc](event,self); 
		}
	}
};

function AGTask(name)
{
	this.taskName = name;
	this.begin = null;
	this.inputs = {};
	this.startVal = null; 		//relative, specific, etc.
	this.endVal = null;		//relative, specific, etc.
	this.twnFnc = null;
	this.targets = {};
	this.onStart = {};
	this.onEnd = {};
	this.onFrame = {};
}
AGTask.prototype = {
	
	start : function(){
	
		this.begin = 1; 
		
		Tsk_Mngr.addTask(this); 
	},
	
	stop : function(){ 
		this.begin = null;
		Tsk_Mngr.removeTask(this); 
	}, //trigger events},
	
	restart : function(){},
	
	reverse : function(){}
};

function AGBehavior(name, chain){
	
	this.behaviorName = name;
	this.taskChainRefs = chain; //So one can call start() on all created and parallel tasks (serial tasks are chained and call each other)
}
AGBehavior.prototype = {
	
	start : function(){ 
	
		var tc = this.taskChainRefs; 
		
		for(var each in tc){ tc[each].start(); } 
	}
};


function runAuto()
{
	var tmpC = new Autogram({
					Name:'tmpC', 
					Element:'div', 
					Attributes:{'style.left':'700px'}, 
					Render:{'document.body':document.body} 
				});

	var tmpBP = new Blueprint();
	tmpBP.Name = 'tmpA';
	tmpBP.Element = 'div';
	tmpBP.Attributes = {
			'className':'divish', 
			'style.left':'0px',
			'style.height':'300px', 
			'style.opacity':'0.5'
		};
	tmpBP.Render = {'document.body':document.body};
	var tmpA = new Autogram(tmpBP);
	
	var tmpB = new Autogram({
						Name:'tmpB', 
						Element:'div', 
						Offsets: {
							'className':['link',tmpA.Name], 
							'style.height':[200,tmpA.Name]
						}, 
						Attributes:{'style.left':'500px'}, 
						Render:{'document.body':document.body}, 
						Constraints:{
							'style.height':{
								'_300px_range':[[300,'-'],'i',{prnt2:'prnt2'}]
							}
						} 
					});
	//tmpB.Revise({Constraints:{'style.height':{'_300px':['300px','e',{prnt:'delete'}]}}});
	
	tmpC.Revise({
		Offsets:{
			'className':['link',tmpA.Name], 
			'style.height':['link',tmpA.Name]
		}, 
		Constraints:{
			'style.height':{
				'_tmpA':[tmpA,'i',{prnt3:'prnt3'}]
			}
		}
	});
	
	tmpBP = new Blueprint();
	tmpBP.Attributes = {'className':'divish', 'style.height':'600px'};
	tmpA.Revise(tmpBP);
	tmpBP = null;
	
	tmpA.Revise({Events:{'add':[['click',['prnt4','prnt3']]]}});
	//tmpA.Revise({Events:{'remove':[['click']]}});
	
	tmpA.Revise({ 
			Tasks:{
				'tester2': { 
					'inputs':{ 'tmpA.Element.style.height':'ref' }, 
					startVal:"100", 
					endVal:"500", 
					twnFnc:['moveIt','ref'], 
					targets:{'tmpA:Attributes:style.height':'ref'} 
				} 
			} 
		});
	
	tmpA.Revise({ 
			Tasks:{
				'tester': { 
					'inputs':{
						'tmpA.Element.style.left':'ref'
					}, 
					startVal:"100", 
					endVal:"900", 
					twnFnc:['moveIt','ref'], 
					targets:{'tmpA:Attributes:style.left':'ref'}
					//onEnd:{'Obj_Mngr.tmpA.Tasks.tester2.start':'ref'} 
				} 
			} 
		});
					
	//console.log(tmpA.Tasks);
	tmpA.Revise({ Behaviors:{'testING':['tester','tester2']} });
	tmpA.Behaviors.testING.start();
	//tmpA.Tasks.tester.start();
	//tmpA.Tasks.tester2.start();
	//console.log(Tsk_Mngr);
	
	console.log('tmpB links: ', tmpB.Links);
	console.log('tmpA links: ', tmpA.Links);
	console.log('tmpC links: ', tmpC.Links);
	
	tester = JSON.stringify(tmpB.BPCopy);
	tmpB.Element.parentNode.removeChild(tmpB.Element); delete Obj_Mngr[tmpB.Name]; tmpB = null;
	//console.log(tester);
	testy = JSON.parse(tester);
	//console.log(testy);
	testy.Name = 'tmppy';
	var hope = new Autogram(testy);
	//hope.Revise({Attributes:{'style.left':['900px']}});
	
	localStorage.clear();
	saveAll(Obj_Mngr);
}

function saveObject(agram){ 
	localStorage[agram.Name] = JSON.stringify(agram.BPCopy); 
};

function loadObject(agName){ 
	return new Autogram( JSON.parse(localStorage[agName]) ); 
};

function saveAll(ObjMngr){
	
	for(var agram in ObjMngr){ 
		console.log('agram: ', ObjMngr[agram]);
		localStorage[ObjMngr[agram].Name] = JSON.stringify(ObjMngr[agram].BPCopy);
	}
}

function loadAll(){
	
	var len = localStorage.length, 
		tArr = [], 
		rArr = [], 
		index;
		
	for(var i=0; i<len; i++){
		
		index = tArr.push( JSON.parse( localStorage[localStorage.key(i)] ) ) - 1;
		
		rArr.push( new Autogram({
							Name:tArr[index].Name, 
							Element:tArr[index].Element, 
							Attributes:tArr[i].Attributes,
							Events:tArr[index].Events
						}) 
				); //fill out some autogram info so autograms can build out linked refs
	}
	
	for(var i in tArr){
		
		rArr[i].Revise({
			Constraints:tArr[i].Constraints, 
			Offsets:tArr[index].Offsets, 
			Render:tArr[i].Render
		}); 
	} //finish building autograms
	
	rArr = null; 
	tArr = null;
}
