        
    // Route --------------
    //=====================
     
    function Route(pattern, callback, priority, router){
        var isRegexPattern = utils.isRegExp(pattern);
        this._router = router;
        this._pattern = pattern;
        this._paramsIds = isRegexPattern? null : patternLexer.getParamIds(this._pattern);
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
            
            if (utils.isRegExp(validationRule)) {
                isValid = validationRule.test(val);
            }
            else if (utils.isArray(validationRule)) {
                isValid = utils.arrayIndexOf(validationRule, val || '') !== -1; //adding empty string since optional rule can be empty
            }
            else if (utils.isFunction(validationRule)) {
                isValid = validationRule(val, request, values);
            }
            
            return isValid || false; //fail silently if validationRule is from an unsupported type
        },
        
        _getParamValuesObject : function(request){
            var shouldTypecast = this._router.shouldTypecast,
                ids = this._paramsIds,
                values = patternLexer.getParamValues(request, this._matchRegexp, shouldTypecast),
                o = {}, 
                n = ids? ids.length : 0;
            while(n--){
                o[ids[n]] = values[n];
            }
            o.request_ = shouldTypecast? utils.typecastValue(request) : request;
            return o;
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
    
