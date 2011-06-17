        
    // Crossroads --------
    //====================
    
    crossroads = (function(){
        
        var _crossroads = {

            _routes : [],
            
            bypassed : new signals.Signal(),
            
            routed : new signals.Signal(),

            addRoute : function(pattern, callback, priority){
                var route = new Route(pattern, callback, priority);
                sortedInsert(route);
                return route;
            },
            
            removeRoute : function(route){
                var i = getRouteIndex(route);
                if(i >= 0) this._routes.splice(i, 1);
                route._destroy();
            },
            
            removeAllRoutes : function(){
                var n = this.getNumRoutes();
                while(n--){
                    this._routes[n]._destroy();
                }
                this._routes.length = 0;
            },
            
            parse : function(request){
                request = request || '';
                var route = getMatchedRoute(request),
                    params = route? getParamValues(request, route) : null;
                if(route){
                    params? route.matched.dispatch.apply(route.matched, params) : route.matched.dispatch();
                    this.routed.dispatch(request, route, params);
                }else{
                    this.bypassed.dispatch(request);
                }
            },
            
            getNumRoutes : function(){
                return this._routes.length;
            },

            toString : function(){
                return '[crossroads numRoutes:'+ this.getNumRoutes() +']';
            }
        };
        
        function sortedInsert(route){
            //simplified insertion sort
            var routes = crossroads._routes,
                n = routes.length;
            do { --n; } while (routes[n] && route._priority <= routes[n]._priority);
            routes.splice(n+1, 0, route);
        }
        
        function getRouteIndex(route){
            return arrayIndexOf(crossroads._routes, route);
        }
        
        function getMatchedRoute(request){
            var routes = crossroads._routes,
                n = routes.length,
                route;
            while(route = routes[--n]){ //should be decrement loop since higher priorities are added at the end of array  
                if(route.match(request)) return route;
            }
            return null;
        }
        
        function getParamValues(request, route){
            return patternLexer.getParamValues(request, route._matchRegexp);
        }
        
        //API
        return _crossroads;
        
    }());
