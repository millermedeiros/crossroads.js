	
	// Helpers -----------
	//====================
	
	function arrayIndexOf(arr, val){
		var n = arr.length;
		//Array.indexOf doesn't work on IE 6-7
		while(n--){
			if(arr[n] === val) return n;
		}
		return -1;
	}
	
	
	// Crossroads --------
	//====================
	
	var crossroads = (function(){
		
		var _routes = [];
				
		function getNumRoutes(){
			return _routes.length;
		}
		
		function getRouteIndex(route){
			return arrayIndexOf(_routes, route);
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
			var n = getNumRoutes();
			while(n--){
				_routes[n]._destroy();
			}
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
				if(route.match(request)){
					return route;
				}
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
	