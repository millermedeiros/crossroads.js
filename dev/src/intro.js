    
    var crossroads,
        patternLexer,
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
        return '[object '+ type +']' === Object.prototype.toString.call(val);
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

    function typecastArrayValues(values){
        var n = values.length, 
            result = [];
        while(n--){
            result[n] = typecastValue(values[n]); 
        }
        return result;
    }
