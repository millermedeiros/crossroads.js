		
	// Crossroads --------
	//====================
	
	crossroads = (function(){
		
		var _routes = [],
			_bypassed = new signals.Signal(),
			_routed = new signals.Signal();
		
		function addRoute(pattern, callback, priority){
			var route = new Route(pattern, callback, priority);
			sortedInsert(route);
			return route;
		}
		
		function sortedInsert(route){
			//simplified insertion sort
			var n = getNumRoutes();
			do { --n; } while (_routes[n] && route._priority <= _routes[n]._priority);
			_routes.splice(n+1, 0, route);
		}
		
		function getNumRoutes(){
			return _routes.length;
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
		
		function parse(request){
			request = request || '';
			var route = getMatchedRoute(request),
				params = route? getParamValues(request, route) : null;
			if(route){
				params? route.matched.dispatch.apply(route.matched, params) : route.matched.dispatch();
				_routed.dispatch(request, route, params);
			}else{
				_bypassed.dispatch(request);
			}
		}
		
		function getMatchedRoute(request){
			var i = getNumRoutes(), route;
			while(route = _routes[--i]){ //should be decrement loop since higher priorities are added at the end of array  
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
			parse : parse,
			bypassed : _bypassed,
			routed : _routed,
			getNumRoutes : getNumRoutes,
			toString : function(){
				return '[crossroads numRoutes:'+ getNumRoutes() +']';
			}
		};
		
	}());
	