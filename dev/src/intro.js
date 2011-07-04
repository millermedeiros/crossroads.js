    
    var crossroads,
        patternLexer,
        utils;


    // Helpers -----------
    //====================
    
    (function(){

        var _toString = Object.prototype.toString,
            _bool_regexp = /^(true|false)$/i;

        utils = {
        
            arrayIndexOf : function(arr, val){
                var n = arr.length;
                //Array.indexOf doesn't work on IE 6-7
                while(n--){
                    if(arr[n] === val) return n;
                }
                return -1;
            },

            isRegExp : function(val){
                return isType('RegExp', val);
            },
            
            isArray : function(val){
                return isType('Array', val);
            },
            
            isFunction : function(val){
                return isType('Function', val);
            },

            typecastValue : function(val){
                return (val === null)? val : (
                            _bool_regexp.test(val)? (val.toLowerCase() === 'true') : (
                                (val === '' || isNaN(val))? val : parseFloat(val) //parseFloat(null || '') returns NaN, isNaN('') returns false
                            )
                        );
            },

            typecastArrayItems : function(values){
                var n = values.length, 
                    result = [];
                while(n--){
                    result[n] = utils.typecastValue(values[n]); 
                }
                return result;
            }
        };

        function isType(type, val){
            return '[object '+ type +']' === _toString.call(val);
        }

    }());

