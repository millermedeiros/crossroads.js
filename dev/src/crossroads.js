		
	// Crossroads --------
	//====================
	
	crossroads = (function(){
		
		var _routes = [],
			_bypassed = new signals.Signal();
		
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
		
		function getRouteIndex(route){
			return arrayIndexOf(_routes, route);
		}
		
		function removeAllRoutes(){
			var n = getNumRoutes();
			while(n--){
				_routes[n]._destroy();
			}
			_routes.length = 0;
		}
		
		function getNumRoutes(){
			return _routes.length;
		}
		
		function parse(request){
			var route = getMatchedRoute(request),
				params = route? getParamValues(request, route) : null;
			if(route){ 
				params? route.matched.dispatch.apply(route.matched, params) : route.matched.dispatch();
			}else{
				_bypassed.dispatch(request);
			}
		}
		
		function getMatchedRoute(request){
			var i = 0, route;
			while(route = _routes[i++]){ //should be increment loop to match routes attached before first
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
			parse : parse,
			bypassed : _bypassed,
			getNumRoutes : getNumRoutes,
			toString : function(){
				return '[crossroads numRoutes:'+ getNumRoutes() +']';
			}
		};
		
	}());
	