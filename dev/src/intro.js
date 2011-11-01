
    var crossroads,
        patternLexer,
        BOOL_REGEXP = /^(true|false)$/i,
        UNDEF;

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
        var r;
        if ( val === null || val === 'null' ) {
            r = null;
        } else if ( val === 'true' ) {
            r = true;
        } else if ( val === 'false' ) {
            r = false;
        } else if ( val === UNDEF || val === 'undefined' ) {
            r = UNDEF;
        } else if ( val === '' || isNaN(val) ) {
            //isNaN('') returns false
            r = val;
        } else {
            //parseFloat(null || '') returns NaN
            r = parseFloat(val);
        }
        return r;
    }

    function typecastArrayValues(values){
        var n = values.length,
            result = [];
        while(n--){
            result[n] = typecastValue(values[n]);
        }
        return result;
    }
