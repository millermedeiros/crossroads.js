/*!!
 * Crossroads - JavaScript Routes
 * Released under the MIT license <http://www.opensource.org/licenses/mit-license.php>
 * @author Miller Medeiros
 * @version 0.4.0+
 * @build 35 (06/18/2011 03:18 PM)
 */
    var signals = require('signals');
        
    var crossroads,
        Route,
        patternLexer,
        _toString = Object.prototype.toString,
        BOOL_REGEXP = /^(true|false)$/i;
    
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
    
    function isType(type, val){
        return '[object '+ type +']' === _toString.call(val);
    }
    
    function isRegExp(val){
        return isType('RegExp', val);
    }
    
    function isArray(val){
        return isType('Array', val);
    }
    
    function isFunction(val){
        return isType('Function', val);
    }

    function typecastValue(val){
        return (val === null)? val : (
                    BOOL_REGEXP.test(val)? (val.toLowerCase() === 'true') : (
                        (val === '' || isNaN(val))? val : parseFloat(val) //parseFloat(null || '') returns NaN, isNaN('') returns false
                    )
                );
    }

            
    // Crossroads --------
    //====================
    
    crossroads = (function(){
        
        var _crossroads = {
            
            shouldTypecast : true,

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

            
    // Route --------------
    //=====================
     
    Route = function (pattern, callback, priority){
        var isRegexPattern = isRegExp(pattern);
        this._pattern = pattern;
        this._paramsIds = isRegexPattern? null : patternLexer.getParamIds(this._pattern);
        this._matchRegexp = isRegexPattern? pattern : patternLexer.compilePattern(pattern);
        this.matched = new signals.Signal();
        if(callback) this.matched.add(callback);
        this._priority = priority || 0;
    };
    
    Route.prototype = {
        
        rules : void(0),
        
        match : function(request){
            return this._matchRegexp.test(request) && this._validateParams(request); //validate params even if regexp because of `request_` rule.
        },
        
        _validateParams : function(request){
            var rules = this.rules, 
                prop;
            for(prop in rules){
                if(rules.hasOwnProperty(prop) && ! this._isValidParam(request, prop)){ //filter prototype
                    return false;
                }
            }
            return true;
        },
        
        _isValidParam : function(request, prop){
            var validationRule = this.rules[prop],
                values = this._getParamValuesObject(request),
                val = values[prop],
                isValid;
            
            if (isRegExp(validationRule)) {
                isValid = validationRule.test(val);
            }
            else if (isArray(validationRule)) {
                isValid = arrayIndexOf(validationRule, val || '') !== -1; //adding empty string since optional rule can be empty
            }
            else if (isFunction(validationRule)) {
                isValid = validationRule(val, request, values);
            }
            
            return isValid || false; //fail silently if validationRule is from an unsupported type
        },
        
        _getParamValuesObject : function(request){
            var ids = this._paramsIds,
                values = patternLexer.getParamValues(request, this._matchRegexp),
                o = {}, 
                n = ids? ids.length : 0;
            while(n--){
                o[ids[n]] = values[n];
            }
            o.request_ = crossroads.shouldTypecast? typecastValue(request) : request;
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
    

    
    // Pattern Lexer ------
    //=====================
    
    patternLexer = crossroads.patternLexer = (function(){
        
        var ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g, //match chars that should be escaped on string regexp
            UNNECESSARY_SLASHES_REGEXP = /\/$/g, //trailing slash
            OPTIONAL_SLASHES_REGEXP = /([:}])\/?(:)/g, //slash between `::` or `}:`. $1 = before, $2 = after

            REQUIRED_PARAMS_REGEXP = /\{([^}]+)\}/g, //match everything between `{ }`
            OPTIONAL_PARAMS_REGEXP = /:([^:]+):/g, //match everything between `: :`
            PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g, //capture everything between `{ }` or `: :`
            
            //used to save params during compile (avoid escaping things that shouldn't be escaped)
            SAVE_REQUIRED_PARAMS = '___CR_REQ___', 
            SAVE_OPTIONAL_PARAMS = '___CR_OPT___',
            SAVE_OPTIONAL_SLASHES = '___CR_OPT_SLASH___',
            SAVED_REQUIRED_REGEXP = new RegExp(SAVE_REQUIRED_PARAMS, 'g'),
            SAVED_OPTIONAL_REGEXP = new RegExp(SAVE_OPTIONAL_PARAMS, 'g'),
            SAVED_OPTIONAL_SLASHES_REGEXP = new RegExp(SAVE_OPTIONAL_SLASHES, 'g');
        

        function getParamIds(pattern){
            var ids = [], match;
            while(match = PARAMS_REGEXP.exec(pattern)){
                ids.push(match[1]);
            }
            return ids;
        }
    
        function compilePattern(pattern){
            pattern = pattern || '';
            if(pattern){
                ;
                pattern = pattern.replace(UNNECESSARY_SLASHES_REGEXP, '');
                pattern = tokenize(pattern);
                pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
                pattern = untokenize(pattern);
                ;
            }
            return new RegExp('^'+ pattern + '/?$'); //trailing slash is optional
        }

        function tokenize(pattern){
            pattern = pattern.replace(OPTIONAL_SLASHES_REGEXP, '$1'+ SAVE_OPTIONAL_SLASHES +'$2');
            pattern = pattern.replace(OPTIONAL_PARAMS_REGEXP, SAVE_OPTIONAL_PARAMS);
            return pattern.replace(REQUIRED_PARAMS_REGEXP, SAVE_REQUIRED_PARAMS);
        }
        
        function untokenize(pattern){
            pattern = pattern.replace(SAVED_OPTIONAL_SLASHES_REGEXP, '\\/?');
            pattern = pattern.replace(SAVED_OPTIONAL_REGEXP, '([^\\/]+)?\/?');
            return pattern.replace(SAVED_REQUIRED_REGEXP, '([^\\/]+)');
        }
        
        function getParamValues(request, regexp){
            var vals = regexp.exec(request);
            if(vals){
                vals.shift();
                if(crossroads.shouldTypecast){
                    vals = typecastValues(vals);
                }
            }
            return vals;
        }
        
        function typecastValues(values){
            var n = values.length, 
                result = [];
            while(n--){
                result[n] = typecastValue(values[n]); 
            }
            return result;
        }
        
        //API
        return {
            getParamIds : getParamIds,
            getParamValues : getParamValues,
            compilePattern : compilePattern
        };
    
    }());
    

    exports = crossroads;
