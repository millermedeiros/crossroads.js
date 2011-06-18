
    // Pattern Lexer ------
    //=====================
    
    patternLexer = crossroads.patternLexer = (function(){

        var ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g, //match chars that should be escaped on string regexp
            UNNECESSARY_SLASHES = /(?:\/(:))|(?:\/$)/g, //match slashes just before `::` and trailing slash

            REQUIRED_SEGMENT_REGEXP = /([^\/]+)/, //match everything until `/`
            OPTIONAL_SEGMENT_REGEXP = /\/?([^\/]+)?/, //match everything until `/`

            REQUIRED_PARAMS_REGEXP = /\{([^}]+)\}/g, //match everything between `{ }`
            OPTIONAL_PARAMS_REGEXP = /:([^:]+):/g, //match everything between `:: ::`
            PARAMS_REGEXP = /(?:\{([^}]+)\})|(?::([^:]+):)/g, //capture params name

            SAVE_REQUIRED_PARAMS = '___CR_REQUIRED___', //used to save params during compile (avoid escaping unnecessary stuff)
            SAVE_OPTIONAL_PARAMS = '___CR_OPTIONAL___',
            SAVED_REQUIRED_REGEXP = new RegExp(SAVE_REQUIRED_PARAMS, 'g'),
            SAVED_OPTIONAL_REGEXP = new RegExp(SAVE_OPTIONAL_PARAMS, 'g');
        
        //FIXME: not working properly for optional params because of params_regexp
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
                pattern = pattern.replace(UNNECESSARY_SLASHES, '$1');
                pattern = saveParams(pattern);
                pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&'); //make sure chars that need to be escaped are properly converted
                pattern = convertSavedParams(pattern);
            }
            return new RegExp('^'+ pattern + '/?$'); //trailing slash is optional
        }

        function saveParams(pattern){
            pattern = pattern.replace(OPTIONAL_PARAMS_REGEXP, SAVE_OPTIONAL_PARAMS);
            return pattern.replace(REQUIRED_PARAMS_REGEXP, SAVE_REQUIRED_PARAMS);
        }
        
        function convertSavedParams(pattern){
            pattern = pattern.replace(SAVED_OPTIONAL_REGEXP, OPTIONAL_SEGMENT_REGEXP.source);
            return pattern.replace(SAVED_REQUIRED_REGEXP, REQUIRED_SEGMENT_REGEXP.source);
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
    
