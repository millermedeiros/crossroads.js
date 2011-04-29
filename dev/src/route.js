		
	// Route --------------
	//=====================
	
	//expose Route even not being very useful outside crossroads chain to enable better unit tests 
	Route = crossroads.Route = function (pattern, callback, priority){
		var isRegExpPattern = isRegExp(pattern);
		this._pattern = pattern;
		this._paramsId = isRegExpPattern? [] : patternLexer.getParamIds(pattern);
		this._matchRegexp = isRegExpPattern? pattern : patternLexer.compilePattern(pattern);
		this.matched = new signals.Signal();
		if(callback) this.matched.add(callback);
		this._priority = priority || 0;
	};
	
	Route.prototype = {
		
		rules : void(0),
		
		match : function(request){
			return this._matchRegexp.test(request) && (isRegExp(this._pattern) || this.validateParams(request)); //if regexp no need to validate params
		},
		
		validateParams : function(request){
			var rules = this.rules,
				values = rules? this._getValuesObject(request) : null,
				prop;
			for(prop in rules){
				if(rules.hasOwnProperty(prop)){ //filter prototype
					if(! isValidRule(rules[prop], values[prop], values, request) ) return false;
				}
			}
			return true;
		},
		
		_getValuesObject : function(request){ //TODO: refactor, ugly code and shouldn't be here.
			var ids = this._paramsId,
				values = patternLexer.getParamValues(request, this._matchRegexp),
				o = {}, 
				n = ids.length;
			while(n--){
				o[ids[n]] = values[n];
			}
			return o;
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
	
	function isValidRule(rule, val, values, request){
		if (isRegExp(rule)) {
			return rule.test(val);
		} else if (isArray(rule)) {
			return arrayIndexOf(rule, val) !== -1;
		} else if (isFunction(rule)) {
			return rule(val, request, values);
		} else {
			return false; //XXX: not sure if it should throw an error or just fail silently...
		}
	}