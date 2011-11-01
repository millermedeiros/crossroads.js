
    // Route --------------
    //=====================

    /**
     * @constructor
     */
    function Route(pattern, callback, priority, router){
        var isRegexPattern = isRegExp(pattern);
        this._router = router;
        this._pattern = pattern;
        this._paramsIds = isRegexPattern? null : patternLexer.getParamIds(this._pattern);
        this._optionalParamsIds = isRegexPattern? null : patternLexer.getOptionalParamsIds(this._pattern);
        this._matchRegexp = isRegexPattern? pattern : patternLexer.compilePattern(pattern);
        this.matched = new signals.Signal();
        if(callback) this.matched.add(callback);
        this._priority = priority || 0;
    }

    Route.prototype = {

        rules : void(0),

        match : function(request){
            return this._matchRegexp.test(request) && this._validateParams(request); //validate params even if regexp because of `request_` rule.
        },

        _validateParams : function(request){
            var rules = this.rules,
                values = this._getParamValuesObject(request),
                prop;
            for(prop in rules){
                if(rules.hasOwnProperty(prop) && ! this._isValidParam(request, prop, values)){ //filter prototype
                    return false;
                }
            }
            return true;
        },

        _isValidParam : function(request, prop, values){
            var validationRule = this.rules[prop],
                val = values[prop],
                isValid;

            if (val == null && this._optionalParamsIds && arrayIndexOf(this._optionalParamsIds, prop) !== -1) {
                isValid = true;
            }
            else if (isRegExp(validationRule)) {
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
            var shouldTypecast = this._router.shouldTypecast,
                values = patternLexer.getParamValues(request, this._matchRegexp, shouldTypecast),
                o = {},
                n = values.length;
            while(n--){
                o[n] = values[n]; //for RegExp pattern and also alias to normal paths
                if(this._paramsIds){
                    o[this._paramsIds[n]] = values[n];
                }
            }
            o.request_ = shouldTypecast? typecastValue(request) : request;
            return o;
        },

        _getParamsArray : function(request){
            var norm = this.rules? this.rules.normalize_ : null,
                params;
            norm = norm || this._router.normalizeFn; // default normalize
            if(norm && isFunction(norm)){
                params = norm(request, this._getParamValuesObject(request));
            } else {
                params = patternLexer.getParamValues(request, this._matchRegexp, this._router.shouldTypecast);
            }
            return params;
        },

        dispose : function(){
            this._router.removeRoute(this);
        },

        _destroy : function(){
            this.matched.dispose();
            this.matched = this._pattern = this._matchRegexp = null;
        },

        toString : function(){
            return '[Route pattern:"'+ this._pattern +'", numListeners:'+ this.matched.getNumListeners() +']';
        }

    };

