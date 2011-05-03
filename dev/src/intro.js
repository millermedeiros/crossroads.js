	
	var crossroads,
		Route,
		patternLexer,
		_toString = Object.prototype.toString;
	
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
		return '[object '+ type +']' === _toString.call(val);
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