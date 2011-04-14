		
	// Route --------------
	//=====================
	
	function Route(pattern, callback, priority){
		this._pattern = pattern; //maybe delete, used only for debug
		this._paramsId = patternLexer.getParamIds(pattern);
		this._matchRegexp = patternLexer.compilePattern(pattern);
		this.matched = new signals.Signal();
		if(callback) this.matched.add(callback);
		this._priority = priority || 0;
	}
	
	Route.prototype = {
		
		rules : void(0),
		
		match : function(request){
			return this._matchRegexp.test(request) && validateParams(this, request);
		},
		
		dispose : function(){
			crossroads.removeRoute(this);
		},
		
		_destroy : function(){
			this.matched.dispose();
			this.matched = this._pattern = this._paramsId = this._matchRegexp = null;
		},
		
		toString : function(){
			return '[Route pattern:"'+ this._pattern +'", numListeners:'+ this.matched.getNumListeners() +']';
		}
		
	};
	
	function validateParams(route, request){
		var rules = route.rules,
			values = rules? getValuesObject(route, request) : null,
			prop;
		for(prop in rules){
			if(rules.hasOwnProperty(prop)){ //filter prototype
				if(! validateRule(rules[prop], values[prop], values, request) ) return false;
			}
		}
		return true;
	}
	
	function validateRule(rule, val, values, request){
		switch(toString(rule)){
			case '[object RegExp]':
				return rule.test(val);
			case '[object Array]':
				return arrayIndexOf(rule, val) !== -1;
			case '[object Function]':
				return rule(val, request, values);
			default:
				return false; //not sure if it should throw an error or just fail silently...
		}
	}
	
	function getValuesObject(route, request){
		var ids = route._paramsId,
			values = patternLexer.getParamValues(request, route._matchRegexp),
			o = {}, 
			n = ids.length;
		while(n--){
			o[ids[n]] = values[n];
		}
		return o;
	}
	