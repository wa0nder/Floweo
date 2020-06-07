//Floweo Editor


//Functionality - Module Factory is shared function resource
ModuleFactory.dropped = function(event,self){
	
	var dat = event.dataTransfer.getData('text/plain');
	console.log('dat: ', dat);
	var dat2 = dat.split('.');
	var obj = Obj_Mngr[ dat2[0] ];
	var action = dat2[1];
	
	if(dat2.length > 2){
		var tlft = dat2[2]; 
		var ttop = dat2[3];
	}
	
	switch(action){
		case 'resize':
					if( !parseFloat(obj.Element.style.left.split('px')[0]) ){ obj.Element.style.left = '0px'; }
					if( !parseFloat(obj.Element.style.top.split('px')[0]) ){ obj.Element.style.top = '0px'; }
					
					obj.Revise({Attributes:
									{
									'style.width':(event.pageX - parseFloat(obj.Element.style.left.split('px')[0])) + 'px',
									'style.height':(event.pageY - parseFloat(obj.Element.style.top.split('px')[0])) + 'px'
									}
								});
											
					break;
		case 'dragO':
					var toffleft = parseFloat( obj.Offsets['style.left'][1].Element.style.left.split('px')[0] ); //fix error here
					var tofftop = parseFloat( obj.Offsets['style.top'][1].Element.style.top.split('px')[0] );
					
					obj.Revise(
						{Offsets:
							{
							'style.left':[event.pageX - tlft - toffleft],
							'style.top':[event.pageY - ttop - tofftop] 
							}
						});
											
					obj.Offsets['style.left'][1].Revise(
													{Attributes:
														{
														'style.left':toffleft+'px', 
														'style.top':tofftop+'px'
														}
													});
					
					break;
		case 'drag':
					obj.Revise(
						{Attributes:
							{
							'style.left':(event.pageX-tlft) + 'px', 
							'style.top':(event.pageY-ttop) + 'px'
							}
						}); 
					break;
	}
};
ModuleFactory.setDragData = function(event,self){
	
	if(event.shiftKey){ 
		event.dataTransfer.setData('text/plain', self.Name + '.resize');
	}
	else{
		var tlft,ttop;
		
		(!self.Element.style.left) ? tlft = event.pageX : tlft = event.pageX - parseFloat(self.Element.style.left.split('px')[0]);
		(!self.Element.style.top) ? ttop = event.pageY : ttop = event.pageY - parseFloat(self.Element.style.top.split('px')[0]); 
		
		if(event.ctrlKey){ 
			event.dataTransfer.setData('text/plain', self.Name + '.dragO.' + tlft + '.' + ttop); 
		}
		else{
			event.dataTransfer.setData('text/plain', self.Name + '.drag.' + tlft + '.' + ttop); 
		}
	}
};

ModuleFactory.stopPropagation = function(event){ event.stopPropagation(); };

ModuleFactory.preventDefault = function(event){ event.preventDefault(); };

ModuleFactory.resize = function(event,self){ 
	self.Revise({Attributes:{'style.border':'3px dotted red'}}); 
};

ModuleFactory.restore = function(event,self){
	self.Revise({Attributes:{'style.border':'0px'}}); 
};

ModuleFactory.display = function(event,self){
	if(!self.Offsets['style.left']){ 
		alert(self.Element.style.left + " : " + self.Element.style.top); 
	}
	else{ 
		alert(
			self.Offsets['style.left'][0] + " : " + 
			self.Offsets['style.top'][0] + " : " + 
			self.Element.style.width + " : " + 
			self.Element.style.height); 
		}
};

ModuleFactory.Builder = function(event,self){
	
	if(event.type == 'dblclick' && event.ctrlKey){
		//make every *DYNAMICALLY* created object unique!
		
		//Autogram for live edit - attach editor functionality
		var newAuto = new Autogram({
									Name:'Temp1', 
									Element:'p', 
									Attributes:{
										'style.position':'absolute',
										'draggable':'true'
									}, 
									Events:{
										'add':[
											['dragstart',['setDragData']], 
											['mouseover',['Builder']], 
											['mouseout',['Builder']], 
											['click',['Builder']],
											['dragenter',['stopPropagation', 'preventDefault'] ],
											['dragover',['stopPropagation', 'preventDefault'] ],
											['drop',['stopPropagation', 'preventDefault', 'dropped'] ]
										]
									},
									Render:{ 'document.body':'ref'} 
								});
		Build_Input(newAuto);
	}
	else if(event.type == 'mouseover'){
		Build_Input(self);
	}
	else if(event.type == 'mouseout'){
		ModuleFactory.deleteForms(event,self);
	}
	else if(event.type == 'click'){
		self.DataObjs['deleteForms']['Inputs'] = {};
	}
	
	function Build_Input(newAuto){
		
			//create blueprint that condenses repeated settings below
			var bldrbp = new Blueprint(); 
			bldrbp.Attributes = {
				'style.position':'absolute',
				'style.zIndex':3,
				'draggable':'true'
			}; 
			bldrbp.Events = {
				'add':[
					['dragstart',['setDragData']], 
					['dblclick',['display']] 
				]
			}; 
			bldrbp.Render = {'document.body': 'ref'};
			
			//create blueprint builder forms
			var blueprint_form = new Autogram({ 
										Name:'blueprint_form'+(Globals.ObjCntr+=1), 
										Attributes:{
											'className':'formDefault', 
											'style.left':event.pageX+'px', 
											'style.top':event.pageY + 'px'
										}, 
										Element:'form'
									});
									
			blueprint_form.Revise(bldrbp);
			
			var bp_legend = new Autogram({
									Name:'bp_legend'+(Globals.ObjCntr+=1), 
									Element:'legend', 
									Attributes:{
										'textContent':'Autogram Blueprint Builder',
										'style.fontWeight':'bold'
									}, 
									Offsets:{
										'style.left':[23,blueprint_form.Name], 
										'style.top':[18,blueprint_form.Name]
									} 
								});
			
			
			var bpStringy = JSON.stringify(newAuto.BPCopy, null, 2);	
			var name_input = new Autogram({ 
									Name:'name_form'+(Globals.ObjCntr+=1),
									Element:'textarea',									
									Attributes:{
										type:'text', 
										value:bpStringy, 
										'style.width':'291px', 
										'style.height':'232px'
									},
									Offsets:{
										'style.left':[77,blueprint_form.Name], 
										'style.top':[42,blueprint_form.Name]
									}, 
									//Render:{'workspace':'ref'},
									Events: {
										'add': [
											['mouseover',['expandTextArea']],
											['mouseout',['shrinkTextArea']]
										]
									}
								});
			
			var name_text = new Autogram({ 
									Name:'name_text'+(Globals.ObjCntr+=1), 
									Element:'p', 
									Attributes:{'textContent':'Specs:'},
									Offsets:{
										'style.left':[31,blueprint_form.Name], 
										'style.top':[32,blueprint_form.Name]
									} 
								});
											
			var name_btn = new Autogram({ 
								Name:'name_btn'+(Globals.ObjCntr+=1), 
								Element:'button', 
								Attributes:{
									'type':'button', 
									'textContent':'Set'
								},
								Offsets:{
									'style.left':[321,blueprint_form.Name], 
									'style.top':[283,blueprint_form.Name]
								}, 
								Events:{
									'add':[
										['click',['setValues']]
									]
								} 
							});
			var tb = new Blueprint(); 
			tb.DataObjs['setValues'] = {'Inputs':{}, 'Outputs':{}}; 
			tb.DataObjs['setValues']['Inputs'][name_input.Name] = name_input; 
			tb.DataObjs['setValues']['Outputs'][newAuto.Name] = newAuto;
			
			name_btn.Revise(tb);
			
			var save_btn = new Autogram({ 
									Name:'name_btn'+(Globals.ObjCntr+=1), 
									Element:'button', 
									Attributes:{
										'type':'button', 
										'textContent':'Save'
									},
									Offsets:{
										'style.left':[272,blueprint_form.Name], 
										'style.top':[283,blueprint_form.Name]
									}, 
									Events:{
										'add':[
											['click',['saveAuto']]
										]
									} 
								});
								
			var tb = new Blueprint(); 
			tb.DataObjs['saveAuto'] = {'Inputs':{}, 'Outputs':{}};
			tb.DataObjs['saveAuto']['Inputs'][newAuto.Name] = newAuto;
			save_btn.Revise(tb);
			
			var delete_btn = new Autogram({ 
									Name:'delete_btn'+(Globals.ObjCntr+=1), 
									Element:'button', 
									Attributes:{
										'type':'button', 
										'textContent':'Delete'
									},
									Offsets:{
										'style.left':[18,blueprint_form.Name], 
										'style.top':[283,blueprint_form.Name]
									}, 
									Events:{
										'add':[
											['click',['deleteForms']]
										]
									} 
								});
			
			var unload_btn = new Autogram({ 
									Name:'unload_btn'+(Globals.ObjCntr+=1), 
									Element:'button', 
									Attributes:{
										'type':'button', 
										'textContent':'Unload'
									},
									Offsets:{
										'style.left':[213,blueprint_form.Name], 
										'style.top':[283,blueprint_form.Name]
									}, 
									Events:{
										'add':[
											['click',['hideObject','deleteForms']]
										]
									} 
								});
								
			var tb = new Blueprint(); 
			tb.DataObjs['hideObject'] = {'Inputs':{}, 'Outputs':{}};
			tb.DataObjs['hideObject']['Inputs'][newAuto.Name] = newAuto;
			unload_btn.Revise(tb);
			
			
			var behavior_btn = new Autogram({
								Name: "behavior_btn"+(Globals.ObjCntr+=1),
								Element:'button',
								Attributes: {
									'type': 'button',
									'textContent':'Run Tasks'
								},
								Offsets: {
									'style.left':[130 ,blueprint_form.Name],
									'style.top':[283 ,blueprint_form.Name]
								},
								Events: {
									'add': [
										['click',['runBehaviors']]
									]
								}
							});
							
			var tb = new Blueprint(); 
			tb.DataObjs['runBehaviors'] = {'Inputs':{}, 'Outputs':{}};
			tb.DataObjs['runBehaviors']['Inputs'][newAuto.Name] = newAuto;
			behavior_btn.Revise(tb);
			
			var exit_btn = new Autogram({ 
								Name:'exit_btn'+(Globals.ObjCntr+=1), 
								Element:'button', 
								Attributes:{
									'type':'button', 
									'textContent':'Close'
								},
								Offsets:{
									'style.left':[365,blueprint_form.Name], 
									'style.top':[283,blueprint_form.Name]
								}, 
								Events:{
									'add':[
										['click',['deleteForms']]
									]
								}
							});
			
			
			//apply common specs through blueprint								
			bp_legend.Revise(bldrbp); 
			name_text.Revise(bldrbp); 
			name_btn.Revise(bldrbp); 
			exit_btn.Revise(bldrbp); 
			behavior_btn.Revise(bldrbp);
			save_btn.Revise(bldrbp); 
			delete_btn.Revise(bldrbp); 
			unload_btn.Revise(bldrbp);
			
			//name_input shouldn't get drag events
			bldrbp.Events = {};
			bldrbp.Attributes.draggable = false;
			
			name_input.Revise(bldrbp);
			
			//update results
			blueprint_form.Revise({
							Attributes:{
								'style.left':blueprint_form.Element.style.left, 
								'style.top':blueprint_form.Element.style.top
							}
						});
			
			//place reference to editor form objects inside autogram it was created for
			var tb = new Blueprint(); 
			tb.DataObjs['deleteForms'] = {'Inputs':{}, 'Outputs':{}};
			
			var tmp = tb.DataObjs['deleteForms']['Inputs'];
			tmp[blueprint_form.Name] = blueprint_form; 
			tmp[bp_legend.Name] = bp_legend; 
			tmp[name_input.Name] = name_input; 
			tmp[name_text.Name] = name_text; 
			tmp[name_btn.Name] = name_btn; 
			tmp[exit_btn.Name] = exit_btn; 
			tmp[save_btn.Name] = save_btn; 
			tmp[delete_btn.Name] = delete_btn; 
			tmp[unload_btn.Name] = unload_btn;
			tmp[behavior_btn.Name] = behavior_btn;
			
			newAuto.Revise(tb); 
			exit_btn.Revise(tb); 
			unload_btn.Revise(tb);
			
			tmp[newAuto.Name] = newAuto;
			
			delete_btn.Revise(tb);
		}
};

ModuleFactory.expandTextArea = function(event,self){
	var width = self.Element.style.width;
	var height = self.Element.style.height;
	
	self.Element.style.width = parseInt(width.split('px')[0]) + 100 + 'px';
	self.Element.style.height = parseInt(height.split('px')[0]) + 100 + 'px';
	
	self.Element.style.zIndex += 1;
}

ModuleFactory.shrinkTextArea = function(event,self){
	var width = self.Element.style.width;
	var height = self.Element.style.height;
	
	self.Element.style.width = parseInt(width.split('px')[0]) - 100 + 'px';
	self.Element.style.height = parseInt(height.split('px')[0]) - 100 + 'px';
	
	self.Element.style.zIndex -= 1;
}

ModuleFactory.hideObject = function(event,self){
	
	var tmp = self.DataObjs['hideObject']['Inputs'];
	
	for(var ag in tmp){ 
		tmp[ag].Element.parentNode.removeChild(tmp[ag].Element); 
		delete Obj_Mngr[tmp[ag].Name]; 
	}
};

ModuleFactory.setValues = function(event,self){
	
	var lp = self.DataObjs['setValues']['Inputs']; 
	var lp2 = self.DataObjs['setValues']['Outputs'];
	
	
	
	for(var lbl in lp){ 
	
		for(var lbl2 in lp2){
			
			//json parse to turn into object
			lp2[lbl2].Revise( JSON.parse(lp[lbl].Element.value) );
			
			//update editor edit box
			lp[lbl].Revise({Attributes: {
								value: JSON.stringify(lp2[lbl2].BPCopy, null, 2) 
							}
						}); 
			
			//just get first value (bad design here)
			break;
		}
	}
};

ModuleFactory.saveAuto = function(event,self){
	
	var inputs = self.DataObjs['saveAuto']['Inputs'];
	for(var ag in inputs){
		ModuleFactory.saveObject(inputs[ag]);
	}
};

ModuleFactory.loadAuto = function(event,self){
	
	console.log('self: ', self);
	
	var inputs = self.DataObjs['loadAuto']['Inputs'];
	for(var ag in inputs){ 
		ModuleFactory.loadObject( inputs[ag].Element.value ); 
	}
};

ModuleFactory.deleteForms = function(event,self){
	
	var t = self.DataObjs['deleteForms']['Inputs'];
	
	for(var obj in t){ 
		ModuleFactory.deleteThisObj( t[obj] ); 
	}
};

ModuleFactory.deleteThisObj = function(obj){ 

	localStorage.removeItem(obj.Name); 
	
	obj.Element.parentNode.removeChild(obj.Element); 
	
	delete Obj_Mngr[obj.Name]; 
	
	//update linked objects offset values to reflect deletion change
	var tbp, oLk;  
	for(var key in obj.Links){
		
		tbp = new Blueprint(); 
		tbp.Offsets[key] = 'delete';
		oLk = obj.Links[key];
		
		//loop through objects and remove offset values
		for(var autog in oLk){ 
			oLk[autog].Revise(tbp); 
		}
	}
	return null;  
};

ModuleFactory.runBehaviors = function(event,self){
	
	var t = self.DataObjs['runBehaviors']['Inputs'];
	
	for(var obj in t){
		
		var behaviors = t[obj].Behaviors;
		
		for(var key in behaviors){
			behaviors[key].start();
		}
	}
	
	
}

ModuleFactory.saveObject = function(agram){
	localStorage[agram.Name] = JSON.stringify(agram.BPCopy); 
};

ModuleFactory.loadObject = function(agName){
	
	console.log("local_storage: ", localStorage[agName]);
	
	var json = localStorage[agName];
	
	if(json === undefined){
		console.log("ERROR: Object not found.");
		return;
	}
	
	var ag = new Autogram( JSON.parse(json).BPCopy );
	
	ModuleFactory.addEditorAttributes(ag);
	
	return ag;
};

ModuleFactory.addEditorAttributes = function(agram){
	
	agram.Revise({
				Attributes: {
					'style.position':'absolute',
					'draggable':'true'
				}, 
				Events: {
					'add':[
							['dragstart',['setDragData']], 
							['mouseover',['resize','Builder']], 
							['mouseout',['restore','Builder']], 
							['click',['Builder']],
							['dragenter',['stopPropagation', 'preventDefault'] ],
							['dragover',['stopPropagation', 'preventDefault'] ],
							['drop',['stopPropagation', 'preventDefault', 'dropped'] ]
						]
					}
			})
}

ModuleFactory.removeEditorAttributes = function(agram){
	
	agram.Revise({
			Attributes:{
				'style.position':'delete',
				'draggable':'delete'
			}, 
			Events:{
				'remove':[
					['dragstart',['setDragData']], 
					['mouseover',['resize','Builder']], 
					['mouseout',['restore','Builder']], 
					['click',['Builder']],
					['dragenter',['stopPropagation', 'preventDefault'] ],
					['dragover',['stopPropagation', 'preventDefault'] ],
					['drop',['stopPropagation', 'preventDefault', 'dropped'] ]
				]
			}
		}); 
	
	return agram;
}

ModuleFactory.saveAll = function(ObjMngr){
	
	for(var agram in ObjMngr){
		
		//remove editor functionality
		ModuleFactory.removeEditorAttributes(ObjMngr[agram]);
										
		//save
		localStorage[ObjMngr[agram].Name] = JSON.stringify(ObjMngr[agram].BPCopy);
	}
};

ModuleFactory.loadAll = function(){
	var len = localStorage.length, 
		tArr = [], 
		rArr = [];
		
	for(var i=0; i<len; i++){
		
		var ag = JSON.parse( localStorage[localStorage.key(i)] );
		
		tArr.push(ag);
		
		//fill out some autogram info so autograms can build out linked refs
		rArr.push( new Autogram({
						Name:ag.Name, 
						Element:ag.Element, 
						Attributes:ag.Attributes, 
						Events:ag.Events
					}) 
				);
	}
	
	//finish building autograms and attach to editor agrams
	var tmpag;
	for(var i in tArr){
		
		rArr[i].Revise({
				Constraints:tArr[i].Constraints, 
				Offsets:tArr[i].Offsets, 
				Render:tArr[i].Render, 
				DataObjs:tArr[i].DataObjs, 
				Tasks:tArr[i].Tasks,
				Behaviors:tArr[i].Behaviors
			});
		
		//attach editor functionality
		rArr[i].Revise({
				Attributes:{
					'style.position':'absolute',
					'draggable':'true'
				}, 
				Events:{
					'add':[
						['dragstart',['setDragData']], 
						['mouseover',['Builder']], 
						['mouseout',['Builder']], 
						['click',['Builder']],
						['dragenter',['stopPropagation', 'preventDefault'] ],
						['dragover',['stopPropagation', 'preventDefault'] ],
						['drop',['stopPropagation', 'preventDefault', 'dropped'] ]
					]
				}
			}); 
	}
	rArr = null; tArr = null;
};

ModuleFactory.showStorage = function(event,self){
	var stor_text = new Autogram({
							Name:'stor_text', 
							Element:'p',
							Attributes:{
								"style.position":"absolute",
								"draggable":"true", 
								'style.background':'#25383C', 
								'style.color':'white', 
								'style.border':'3px dotted red', 
								'style.padding':'3px', 
								'style.opacity':'0.7'
							},
							Render:{"workspace":"ref"},
							Offsets:{
								'style.left':[3,self.Name], 
								'style.top':[10,self.Name]
							} 
						});
						
	var len = localStorage.length,
		msg = "";
		
	for(var i=0; i<len; i++){
		msg += "Object " + (i+1) + " : " + localStorage.key(i) + "<br />"; 
	}
	
	stor_text.Revise({Attributes: {'innerHTML':msg} });
	
	//add newly created form to form that generated it so it can be modified later by "parent" form
	var tb = new Blueprint(); 
	
	tb.DataObjs['hideStorage'] = {'Inputs':{}, 'Outputs':{}};
	tb.DataObjs['hideStorage']['Inputs'][stor_text.Name] = stor_text;
	
	self.Revise(tb);
};

ModuleFactory.hideStorage = function(event,self){
	
	var t = self.DataObjs['hideStorage']['Inputs'];
	
	for(var obj in t){
		ModuleFactory.deleteThisObj(t[obj]);
	}
};	

function FlowEditor()
{
	
	var workspace = new Autogram({ 
							Name : 'workspace', 
							Element : 'div', 
							Attributes : {
								className:'editor', 
								'style.left':'0px', 
								'style.top':'0px', 
								textContent:'Floweo Editor v.1.0'
							},
							Events : {
								'add':[ 
									['dblclick',['Builder']],
									['dragenter',['stopPropagation', 'preventDefault'] ],
									['dragover',['stopPropagation', 'preventDefault'] ],
									['drop',['stopPropagation', 'preventDefault', 'dropped'] ] 
								]
							},
							Render : {'document.body':document.body} 
						});
							
	var load_form = new Autogram({
							Name:'load_form', 
							Element:'input', 
							Attributes:{
								'style.position':'absolute', 
								'style.left':'135px',
								'style.top':'2px'
							}, 
							Render:{'workspace':'ref'}, 
							Events:{
								'add':[
									['mouseover',['showStorage']],
									['mouseout',['hideStorage']]
								]
							} 
						});
	var load_btn = new Autogram({ 
							Name:'load_btn', 
							Element:'button', 
							Attributes:{
								'style.left':'296px', 
								'style.top':'2px', 
								'style.position':'absolute',
								'draggable':'true', 
								'type':'button', 
								'textContent':'Load'},
							Events:{
								'add':[
									['dragstart',['setDragData']], 
									['dblclick',['display']], 
									['click',['loadAuto']]
								]
							},
							Render:{'workspace':'ref'} 
						});
								
	var tb = new Blueprint(); 
	tb.DataObjs['loadAuto'] = {'Inputs':{}, 'Outputs':{}};
	tb.DataObjs['loadAuto']['Inputs'][load_form.Name] = load_form;
	
	load_btn.Revise(tb);
	
	createDemoObjects();
	
	ModuleFactory.loadAll();
}

function createDemoObjects(){
	
	//create autogram with object literal in Blueprint format
	var tmpC = new Autogram({ 
					Name:'tmpC',
					Element:'div', 
					Attributes:{'style.left':'700px'}, 
					Render:{'document.body':'ref'} 
				});
	
	//create sample Blueprint
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
					'_tmpA':[
						tmpA, 'i', {prnt3:'prnt3'}
						]
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
	//tmpA.Behaviors.testING.start();
	//tmpA.Tasks.tester.start();
	//tmpA.Tasks.tester2.start();
	//console.log(Tsk_Mngr);
	
	//Test saving the blueprint from an autogram as a JSON string
	tester = JSON.stringify(tmpB.BPCopy);
	
	//removing from screen
	tmpB.Element.parentNode.removeChild(tmpB.Element); 
	
	delete Obj_Mngr[tmpB.Name]; 
	
	tmpB = null;
	

	//convert back to JSON object
	testy = JSON.parse(tester);
	
	testy.Name = 'tmppy';
	
	var hope = new Autogram(testy);
	//hope.Revise({Attributes:{'style.left':['900px']}});
	
	ModuleFactory.addEditorAttributes(hope);
	ModuleFactory.addEditorAttributes(tmpA);
	ModuleFactory.addEditorAttributes(tmpC);
}

//collision detection and automatic behavior (e.g. self-animation)
//Editor Documentation:
//1. load objects
//	1.1. while looking up references in object manager, check if they exist, if not throw error
//2. attach to them editor interaction capability
//	2.1. interactions:
//		1. drag/drop
//		2. resize
//		3. get description of object
//		4. modify properties and behavior of object
//	2.2 steps to achieve 2.1
//		1. during loading, create new editor autogram for every object
//			1.4 display object properties in dynamic div with drag/drop
//				1.4.1. new object and existing object builder wizards
//				1.4.2. new object, display properties sequentially
//				1.4.3. existing object, display all current properties 
//save all or individual objects
// 1. (SOLVED) upon saving, store position coordinates and parentNode render surface in object not in editor drag container - editor functionality is simply added to object and removed upon saving
//	1.1. (SOLVED) convert all references to string names to be looked up in object manager
//	1.2. (SOLVED) save even HTML element data so only a single file is needed to create object on in any broswer instead of requiring html page + metaobject file