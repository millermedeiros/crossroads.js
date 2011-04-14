	
	var crossroads, 
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
	
	function toString(obj){
		return _toString.call(obj);
	}