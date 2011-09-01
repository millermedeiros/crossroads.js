
    // Crossroads --------
    //====================

    /**
     * @constructor
     */
    function Crossroads(){
        this._routes = [];
        this.bypassed = new signals.Signal();
        this.routed = new signals.Signal();
    }

    Crossroads.prototype = {

        create : function(){
            return new Crossroads();
        },

        shouldTypecast : false,

        addRoute : function(pattern, callback, priority){
            var route = new Route(pattern, callback, priority, this);
            this._sortedInsert(route);
            return route;
        },

        removeRoute : function(route){
            var i = arrayIndexOf(this._routes, route);
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
            var route = this._getMatchedRoute(request),
                params = route? route._getParamsArray(request) : null;
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

        _sortedInsert : function(route){
            //simplified insertion sort
            var routes = this._routes,
                n = routes.length;
            do { --n; } while (routes[n] && route._priority <= routes[n]._priority);
            routes.splice(n+1, 0, route);
        },

        _getMatchedRoute : function(request){
            var routes = this._routes,
                n = routes.length,
                route;
            while(route = routes[--n]){ //should be decrement loop since higher priorities are added at the end of array  
                if(route.match(request)) return route;
            }
            return null;
        },

        toString : function(){
            return '[crossroads numRoutes:'+ this.getNumRoutes() +']';
        }
    };

    //"static" instance
    crossroads = new Crossroads();
    crossroads.VERSION = '::VERSION_NUMBER::';

