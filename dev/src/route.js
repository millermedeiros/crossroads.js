		
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
			return this._matchRegexp.test(request);
		},
		
		dispose : function(){
			crossroads.removeRoute(this);
		},
		
		_destroy : function(){
			this.matched.dispose();
			this.matched = this._pattern = this._paramsId = this._matchRegexp = null;
		}
		
	};
	