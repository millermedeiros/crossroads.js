
    // Pattern Lexer ------
    //=====================

    crossroads.patternLexer = (function () {

        var
            //match chars that should be escaped on string regexp
            ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g,

            //trailing slash
            UNNECESSARY_SLASHES_REGEXP = /\/$/g,

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
            ];

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
                pattern = pattern.replace(UNNECESSARY_SLASHES_REGEXP, '');
                //save tokens
                pattern = replaceTokens(pattern, 'rgx', 'save');
                //regexp escape
                pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
                //restore tokens
                pattern = replaceTokens(pattern, 'rRestore', 'res');
            }
            return new RegExp('^'+ pattern + '/?$'); //trailing slash is optional
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
            getParamIds : getParamIds,
            getOptionalParamsIds : getOptionalParamsIds,
            getParamValues : getParamValues,
            compilePattern : compilePattern
        };

    }());

