/*jslint onevar:true, undef:true, newcap:true, regexp:true, bitwise:true, maxerr:50, indent:4, white:false, nomen:false, plusplus:false */
	
	var crossroads = (function(){
		
		var _routes = [];
				
		function getNumRoutes(){
			return _routes.length;
		}
		
		function getRouteIndex(route){
			var n = getNumRoutes();
			//Array.indexOf doesn't work on IE 6-7
			while(--n){
				if(_routes[n] === route) return n;
			}
			return -1;
		}
		
		function addRoute(pattern, callback){
			var route = new Route(pattern, callback);
			_routes.push(route);
			return route;
		}
		
		function removeRoute(route){
			var i = getRouteIndex(route);
			if(i >= 0) _routes.splice(i, 1);
			route._destroy();
		}
		
		function removeAllRoutes(){
			//TODO: dispose routes
			_routes.length = 0;
		}
		
		function parse(request){
			var route = getMatchedRoute(request),
				params = route? getParamValues(request, route) : null;
			if(route){ 
				params? route.matched.dispatch.apply(route.matched, params) : route.matched.dispatch();
			}
		}
		
		function getMatchedRoute(request){
			var i = 0, route;
			while(route = _routes[i++]){
				if(route.match(request)) return route;
			}
			return null;
		}
		
		function getParamValues(request, route){
			return patternLexer.getParamValues(request, route._matchRegexp);
		}
		
		//API
		return {
			_routes : _routes,
			addRoute : addRoute,
			removeRoute : removeRoute,
			removeAllRoutes : removeAllRoutes,
			parse : parse
		};
		
	}());
	
		
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
			this.matched = null;
		}
		
	};
	