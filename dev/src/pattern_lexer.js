
    // Pattern Lexer ------
    //=====================

    crossroads.patternLexer = (function () {


        var ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g, //match chars that should be escaped on string regexp
            UNNECESSARY_SLASHES_REGEXP = /\/$/g, //trailing slash
            OPTIONAL_SLASHES_REGEXP = /([:}]|\w(?=\/))\/?(:)/g, //slash between `::` or `}:` or `\w:`. $1 = before, $2 = after
            REQUIRED_SLASHES_REGEXP = /([:}])\/?(\{)/g, //used to insert slash between `:{` and `}{`

            REQUIRED_PARAMS_REGEXP = /\{([^}]+)\}/g, //match everything between `{ }`
            OPTIONAL_PARAMS_REGEXP = /:([^:]+):/g, //match everything between `: :`
            PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g, //capture everything between `{ }` or `: :`
            REQUIRED_REST = /\{([^}]+)\*\}/g,
            OPTIONAL_REST = /:([^:]+)\*:/g,

            //used to save params during compile (avoid escaping things that
            //shouldn't be escaped).
            SAVE_REQUIRED_PARAMS = '__CR_RP__',
            SAVE_OPTIONAL_PARAMS = '__CR_OP__',
            SAVE_REQUIRED_REST = '__CR_RR__',
            SAVE_OPTIONAL_REST = '__CR_OR__',
            SAVE_REQUIRED_SLASHES = '__CR_RS__',
            SAVE_OPTIONAL_SLASHES = '__CR_OS__',
            SAVED_REQUIRED_REGEXP = new RegExp(SAVE_REQUIRED_PARAMS, 'g'),
            SAVED_OPTIONAL_REGEXP = new RegExp(SAVE_OPTIONAL_PARAMS, 'g'),
            SAVED_REQUIRED_REST_REGEXP = new RegExp(SAVE_REQUIRED_REST, 'g'),
            SAVED_OPTIONAL_REST_REGEXP = new RegExp(SAVE_OPTIONAL_REST, 'g'),
            SAVED_OPTIONAL_SLASHES_REGEXP = new RegExp(SAVE_OPTIONAL_SLASHES, 'g'),
            SAVED_REQUIRED_SLASHES_REGEXP = new RegExp(SAVE_REQUIRED_SLASHES, 'g');


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
                pattern = pattern.replace(UNNECESSARY_SLASHES_REGEXP, '');
                pattern = tokenize(pattern);
                pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
                pattern = untokenize(pattern);
            }
            return new RegExp('^'+ pattern + '/?$'); //trailing slash is optional
        }

        function tokenize(pattern) {
            //save chars that shouldn't be escaped
            pattern = pattern.replace(OPTIONAL_SLASHES_REGEXP, '$1'+ SAVE_OPTIONAL_SLASHES +'$2');
            pattern = pattern.replace(REQUIRED_SLASHES_REGEXP, '$1'+ SAVE_REQUIRED_SLASHES +'$2');
            pattern = pattern.replace(OPTIONAL_REST, SAVE_OPTIONAL_REST);
            pattern = pattern.replace(REQUIRED_REST, SAVE_REQUIRED_REST);
            pattern = pattern.replace(OPTIONAL_PARAMS_REGEXP, SAVE_OPTIONAL_PARAMS);
            return pattern.replace(REQUIRED_PARAMS_REGEXP, SAVE_REQUIRED_PARAMS);
        }

        function untokenize(pattern) {
            pattern = pattern.replace(SAVED_OPTIONAL_SLASHES_REGEXP, '\\/?');
            pattern = pattern.replace(SAVED_REQUIRED_SLASHES_REGEXP, '\\/');
            pattern = pattern.replace(SAVED_OPTIONAL_REST_REGEXP, '(.*)?'); // optional group to avoid passing empty string as captured
            pattern = pattern.replace(SAVED_REQUIRED_REST_REGEXP, '(.+)');
            pattern = pattern.replace(SAVED_OPTIONAL_REGEXP, '([^\\/]+)?\/?');
            return pattern.replace(SAVED_REQUIRED_REGEXP, '([^\\/]+)');
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
            getParamIds : getParamIds,
            getOptionalParamsIds : getOptionalParamsIds,
            getParamValues : getParamValues,
            compilePattern : compilePattern
        };

    }());

