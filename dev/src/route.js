		
	// Route --------------
	//=====================
	 
	Route = function (pattern, callback, priority){
		this._pattern = pattern;
		this._matchRegexp = isRegExp(pattern)? pattern : patternLexer.compilePattern(pattern);
		this.matched = new signals.Signal();
		if(callback) this.matched.add(callback);
		this._priority = priority || 0;
	};
	
	Route.prototype = {
		
		rules : void(0),
		
		match : function(request){
			return this._matchRegexp.test(request) && (isRegExp(this._pattern) || this._validateParams(request)); //if regexp no need to validate params
		},
		
		_validateParams : function(request){
			var rules = this.rules, 
				prop;
			for(prop in rules){
				if(rules.hasOwnProperty(prop)){ //filter prototype
					if(! this._isValidParam(request, prop) ) return false;
				}
			}
			return true;
		},
		
		_isValidParam : function(request, prop){
			var validationRule = this.rules[prop],
				values = this._getParamValuesObject(request),
				val = values[prop],
				isValid;
			
			if(isRegExp(validationRule)){
				isValid = validationRule.test(val);
			}else if(isArray(validationRule)){
				isValid = arrayIndexOf(validationRule, val) !== -1;
			}else if(isFunction(validationRule)){
				isValid = validationRule(val, request, values);
			}
			
			return isValid || false; //fail silently if validationRule is from an unsupported type
		},
		
		_getParamValuesObject : function(request){
			var ids = patternLexer.getParamIds(this._pattern),
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
			this.matched = this._pattern = this._matchRegexp = null;
		},
		
		toString : function(){
			return '[Route pattern:"'+ this._pattern +'", numListeners:'+ this.matched.getNumListeners() +']';
		}
		
	};
	