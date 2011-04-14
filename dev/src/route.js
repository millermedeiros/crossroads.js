		
	// Route --------------
	//=====================
	
	function Route(pattern, callback){
		this._pattern = pattern; //maybe delete, used only for debug
		this._paramsId = patternLexer.getParamIds(pattern);
		this._matchRegexp = patternLexer.compilePattern(pattern);
		this.matched = new signals.Signal();
		if(callback) this.matched.add(callback);
	}
	
	Route.prototype = {
		
		match : function(request){
			return this._matchRegexp.test(request) && validateParams(this, request);
		},
		
		dispose : function(){
			crossroads.removeRoute(this);
		},
		
		_destroy : function(){
			this.matched.dispose();
			this.matched = this._pattern = this._paramsId = this._matchRegexp = null;
		}
		
	};
	
	function validateParams(route, request){
		var rules = route.rules,
			values = rules? getValuesObject(route, request) : null,
			rule;
		for(rule in rules){
			if(rules.hasOwnProperty(rule)){ //filter prototype
				if(! rules[rule].test(values[rule])) return false;
			}
		}
		return true;
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
	