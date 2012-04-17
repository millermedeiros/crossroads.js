
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

