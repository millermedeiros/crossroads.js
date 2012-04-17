/** @license
 * crossroads <http://millermedeiros.github.com/crossroads.js/>
 * License: MIT
 * Author: Miller Medeiros
 * Version: 0.9.0-alpha (2012/4/17 23:47)
 */

(function (define) {
define(['signals'], function (signals) {

    var crossroads,
        UNDEF;

    // Helpers -----------
    //====================

    function arrayIndexOf(arr, val) {
        if (arr.indexOf) {
            return arr.indexOf(val);
        } else {
            //Array.indexOf doesn't work on IE 6-7
            var n = arr.length;
            while (n--) {
                if (arr[n] === val) {
                    return n;
                }
            }
            return -1;
        }
    }

    function isKind(val, kind) {
        return '[object '+ kind +']' === Object.prototype.toString.call(val);
    }

    function isRegExp(val) {
        return isKind(val, 'RegExp');
    }

    function isArray(val) {
        return isKind(val, 'Array');
    }

    function isFunction(val) {
        return typeof val === 'function';
    }

    //borrowed from AMD-utils
    function typecastValue(val) {
        var r;
        if (val === null || val === 'null') {
            r = null;
        } else if (val === 'true') {
            r = true;
        } else if (val === 'false') {
            r = false;
        } else if (val === UNDEF || val === 'undefined') {
            r = UNDEF;
        } else if (val === '' || isNaN(val)) {
            //isNaN('') returns false
            r = val;
        } else {
            //parseFloat(null || '') returns NaN
            r = parseFloat(val);
        }
        return r;
    }

    function typecastArrayValues(values) {
        var n = values.length,
            result = [];
        while (n--) {
            result[n] = typecastValue(values[n]);
        }
        return result;
    }


    // Crossroads --------
    //====================

    /**
     * @constructor
     */
    function Crossroads() {
        this._routes = [];
        this._prevRoutes = [];
        this.bypassed = new signals.Signal();
        this.routed = new signals.Signal();
    }

    Crossroads.prototype = {

        greedy : false,

        greedyEnabled : true,

        normalizeFn : null,

        create : function () {
            return new Crossroads();
        },

        shouldTypecast : false,

        addRoute : function (pattern, callback, priority) {
            var route = new Route(pattern, callback, priority, this);
            this._sortedInsert(route);
            return route;
        },

        removeRoute : function (route) {
            var i = arrayIndexOf(this._routes, route);
            if (i !== -1) {
                this._routes.splice(i, 1);
            }
            route._destroy();
        },

        removeAllRoutes : function () {
            var n = this.getNumRoutes();
            while (n--) {
                this._routes[n]._destroy();
            }
            this._routes.length = 0;
        },

        parse : function (request, defaultArgs) {
            request = request || '';
            defaultArgs = defaultArgs || [];

            var routes = this._getMatchedRoutes(request),
                i = 0,
                n = routes.length,
                cur;

            if (n) {
                this._notifyPrevRoutes(request);
                this._prevRoutes = routes;
                //shold be incremental loop, execute routes in order
                while (i < n) {
                    cur = routes[i];
                    cur.route.matched.dispatch.apply(cur.route.matched, defaultArgs.concat(cur.params));
                    cur.isFirst = !i;
                    this.routed.dispatch.apply(this.routed, defaultArgs.concat([request, cur]));
                    i += 1;
                }
            } else {
                this.bypassed.dispatch.apply(this.bypassed, defaultArgs.concat([request]));
            }
        },

        _notifyPrevRoutes : function(request) {
            var i = 0, cur;
            while (cur = this._prevRoutes[i++]) {
                //check if switched exist since route may be disposed
                if(cur.route.switched) cur.route.switched.dispatch(request);
            }
        },

        getNumRoutes : function () {
            return this._routes.length;
        },

        _sortedInsert : function (route) {
            //simplified insertion sort
            var routes = this._routes,
                n = routes.length;
            do { --n; } while (routes[n] && route._priority <= routes[n]._priority);
            routes.splice(n+1, 0, route);
        },

        _getMatchedRoutes : function (request) {
            var res = [],
                routes = this._routes,
                n = routes.length,
                route;
            //should be decrement loop since higher priorities are added at the end of array
            while (route = routes[--n]) {
                if ((!res.length || this.greedy || route.greedy) && route.match(request)) {
                    res.push({
                        route : route,
                        params : route._getParamsArray(request)
                    });
                }
                if (!this.greedyEnabled && res.length) {
                    break;
                }
            }
            return res;
        },

        toString : function () {
            return '[crossroads numRoutes:'+ this.getNumRoutes() +']';
        }
    };

    //"static" instance
    crossroads = new Crossroads();
    crossroads.VERSION = '0.9.0-alpha';

    crossroads.NORM_AS_ARRAY = function (req, vals) {
        return [vals.vals_];
    };

    crossroads.NORM_AS_OBJECT = function (req, vals) {
        return [vals];
    };


    // Route --------------
    //=====================

    /**
     * @constructor
     */
    function Route(pattern, callback, priority, router) {
        var isRegexPattern = isRegExp(pattern),
            patternLexer = crossroads.patternLexer;
        this._router = router;
        this._pattern = pattern;
        this._paramsIds = isRegexPattern? null : patternLexer.getParamIds(this._pattern);
        this._optionalParamsIds = isRegexPattern? null : patternLexer.getOptionalParamsIds(this._pattern);
        this._matchRegexp = isRegexPattern? pattern : patternLexer.compilePattern(pattern);
        this.matched = new signals.Signal();
        this.switched = new signals.Signal();
        if (callback) {
            this.matched.add(callback);
        }
        this._priority = priority || 0;
    }

    Route.prototype = {

        greedy : false,

        rules : void(0),

        match : function (request) {
            return this._matchRegexp.test(request) && this._validateParams(request); //validate params even if regexp because of `request_` rule.
        },

        _validateParams : function (request) {
            var rules = this.rules,
                values = this._getParamsObject(request),
                key;
            for (key in rules) {
                // normalize_ isn't a validation rule... (#39)
                if(key !== 'normalize_' && rules.hasOwnProperty(key) && ! this._isValidParam(request, key, values)){
                    return false;
                }
            }
            return true;
        },

        _isValidParam : function (request, prop, values) {
            var validationRule = this.rules[prop],
                val = values[prop],
                isValid = false;

            if (val == null && this._optionalParamsIds && arrayIndexOf(this._optionalParamsIds, prop) !== -1) {
                isValid = true;
            }
            else if (isRegExp(validationRule)) {
                isValid = validationRule.test(val);
            }
            else if (isArray(validationRule)) {
                isValid = arrayIndexOf(validationRule, val) !== -1;
            }
            else if (isFunction(validationRule)) {
                isValid = validationRule(val, request, values);
            }

            return isValid; //fail silently if validationRule is from an unsupported type
        },

        _getParamsObject : function (request) {
            var shouldTypecast = this._router.shouldTypecast,
                values = crossroads.patternLexer.getParamValues(request, this._matchRegexp, shouldTypecast),
                o = {},
                n = values.length;
            while (n--) {
                o[n] = values[n]; //for RegExp pattern and also alias to normal paths
                if (this._paramsIds) {
                    o[this._paramsIds[n]] = values[n];
                }
            }
            o.request_ = shouldTypecast? typecastValue(request) : request;
            o.vals_ = values;
            return o;
        },

        _getParamsArray : function (request) {
            var norm = this.rules? this.rules.normalize_ : null,
                params;
            norm = norm || this._router.normalizeFn; // default normalize
            if (norm && isFunction(norm)) {
                params = norm(request, this._getParamsObject(request));
            } else {
                params = crossroads.patternLexer.getParamValues(request, this._matchRegexp, this._router.shouldTypecast);
            }
            return params;
        },

        interpolate : function(replacements) {
            if (typeof this._pattern !== 'string') {
                throw new Error('Route pattern should be a string.');
            }
            var replaceFn = function(match, prop){
                    if (prop in replacements) {
                        return replacements[prop];
                    } else if (match.indexOf('{') !== -1){
                        throw new Error('The segment '+ match +' is required.');
                    } else {
                        return '';
                    }
                },
                str;

            //TODO: extract this logic into pattern lexer and reuse TOKENS
            str = this._pattern
                        .replace(/([:}]|\w(?=\/))\/?(:)/g, '$1__CR_OS__$2')
                        .replace(/\{([^}*]+)\*?\}/g, replaceFn)
                        .replace(/:([^:*]+)\*?:/g, replaceFn)
                        .replace(/(?:__CR_OS__)+$/, '') // remove trailing
                        .replace(/__CR_OS__/g, '/'); // add slash between segments

            if (! this._matchRegexp.test(str) ) {
                throw new Error('The generated string "'+ str +'" doesn\'t match the pattern "'+ this._pattern +'". Check supplied arguments.');
            }
            return str;
        },

        dispose : function () {
            this._router.removeRoute(this);
        },

        _destroy : function () {
            this.matched.dispose();
            this.switched.dispose();
            this.matched = this.switched = this._pattern = this._matchRegexp = null;
        },

        toString : function () {
            return '[Route pattern:"'+ this._pattern +'", numListeners:'+ this.matched.getNumListeners() +']';
        }

    };



    // Pattern Lexer ------
    //=====================

    crossroads.patternLexer = (function () {

        var
            //match chars that should be escaped on string regexp
            ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g,

            //trailing slashes (begin/end of string)
            UNNECESSARY_SLASHES_REGEXP = /^\/|\/$/g,

            //params - everything between `{ }` or `: :`
            PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g,

            //optional params - everything between `: :`
            OPTIONAL_PARAMS_REGEXP = /:([^:]+):/g,

            //used to save params during compile (avoid escaping things that
            //shouldn't be escaped).
            TOKENS = [
                {
                    //optional slashes
                    //slash between `::` or `}:` or `\w:`. $1 = before, $2 = after
                    rgx : /([:}]|\w(?=\/))\/?(:)/g,
                    save : '$1{{id}}$2',
                    id : 'OS',
                    res : '\\/?'
                },
                {
                    //required slashes
                    //slash between `::` or `}:` or `\w:`. $1 = before, $2 = after
                    rgx : /([:}])\/?(\{)/g,
                    save : '$1{{id}}$2',
                    id : 'RS',
                    res : '\\/'
                },
                {
                    //optional rest - everything in between `: *:`
                    rgx : /:([^:]+)\*:/g,
                    id : 'OR',
                    res : '(.*)?' // optional group to avoid passing empty string as captured
                },
                {
                    //rest param - everything in between `{ *}`
                    rgx : /\{([^}]+)\*\}/g,
                    id : 'RR',
                    res : '(.+)'
                },
                {
                    //required params - everything between `{ }`
                    rgx : /\{([^}]+)\}/g,
                    id : 'RP',
                    res : '([^\\/]+)'
                },
                {
                    //optional params
                    rgx : OPTIONAL_PARAMS_REGEXP,
                    id : 'OP',
                    res : '([^\\/]+)?\/?'
                }
            ],

            LOOSE_SLASH = 1,
            STRICT_SLASH = 2,

            _slashMode = LOOSE_SLASH;


        function precompileTokens(){
            var n = TOKENS.length,
                cur,
                id;
            while (cur = TOKENS[--n]) {
                id = '__CR_'+ cur.id +'__';
                cur.save = ('save' in cur)? cur.save.replace('{{id}}', id) : id;
                cur.rRestore = new RegExp(id, 'g');
            }
        }
        precompileTokens();


        function captureVals(regex, pattern) {
            var vals = [], match;
            while (match = regex.exec(pattern)) {
                vals.push(match[1]);
            }
            return vals;
        }

        function getParamIds(pattern) {
            return captureVals(PARAMS_REGEXP, pattern);
        }

        function getOptionalParamsIds(pattern) {
            return captureVals(OPTIONAL_PARAMS_REGEXP, pattern);
        }

        function compilePattern(pattern) {
            pattern = pattern || '';
            if(pattern){
                if (_slashMode === LOOSE_SLASH) {
                    pattern = pattern.replace(UNNECESSARY_SLASHES_REGEXP, '');
                }
                //save tokens
                pattern = replaceTokens(pattern, 'rgx', 'save');
                //regexp escape
                pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
                //restore tokens
                pattern = replaceTokens(pattern, 'rRestore', 'res');
                if (_slashMode === LOOSE_SLASH) {
                    pattern = '/?'+ pattern +'/?';
                }
            } else {
                //single slash is treated as empty
                pattern = '/?';
            }
            return new RegExp('^'+ pattern + '$');
        }

        function replaceTokens(pattern, regexpName, replaceName) {
            var i = 0, cur;
            while (cur = TOKENS[i++]) {
                pattern = pattern.replace(cur[regexpName], cur[replaceName]);
            }
            return pattern;
        }

        function getParamValues(request, regexp, shouldTypecast) {
            var vals = regexp.exec(request);
            if (vals) {
                vals.shift();
                if (shouldTypecast) {
                    vals = typecastArrayValues(vals);
                }
            }
            return vals;
        }

        //API
        return {
            strict : function(){
                _slashMode = STRICT_SLASH;
            },
            loose : function(){
                _slashMode = LOOSE_SLASH;
            },
            getParamIds : getParamIds,
            getOptionalParamsIds : getOptionalParamsIds,
            getParamValues : getParamValues,
            compilePattern : compilePattern
        };

    }());


    return crossroads;
});
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) { //Node
        module.exports = factory(require(deps[0]));
    } else {
        /*jshint sub:true */
        window['crossroads'] = factory(window[deps[0]]);
    }
}));
