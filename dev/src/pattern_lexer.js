
	// Pattern Lexer ------
	//=====================
	
	patternLexer = crossroads.patternLexer = (function(){

		var ESCAPE_CHARS_REGEXP = /[\\\.\+\*\?\^\$\[\]\(\)\{\}\/\'\#]/g,
			SEGMENT_REGEXP = /([^\/]+)/,
			PARAMS_REGEXP = /\{([^\}]+)\}/g,
			SAVE_PARAMS = '___CR_PARAM___',
			SAVED_PARAM_REGEXP = new RegExp(SAVE_PARAMS, 'g'),
			BOOL_REGEXP = /^(true|false)$/i;
		
		function getParamIds(pattern){
			var ids = [], match;
			while(match = PARAMS_REGEXP.exec(pattern)){
				ids.push(match[1]);
			}
			return ids;
		}
	
		function compilePattern(pattern){
			pattern = pattern? saveParams(pattern) : '';
			pattern = pattern.replace(/\/$/, ''); //remove trailing slash
			pattern = escapePattern(pattern); //make sure chars that need to be escaped are properly converted
			pattern = convertSavedParams(pattern);
			return new RegExp('^'+ pattern + '/?$'); //trailing slash is optional
		}
		
		function saveParams(pattern){
			return pattern.replace(PARAMS_REGEXP, SAVE_PARAMS);
		}
		
		function convertSavedParams(pattern){
			return pattern.replace(SAVED_PARAM_REGEXP, SEGMENT_REGEXP.source);
		}
		
		function escapePattern(pattern){
			return pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
		}
		
		function getParamValues(request, regexp){
			var vals = regexp.exec(request);
			if(vals){
				vals.shift();
				vals = typecastValues(vals);
			}
			return vals;
		}
		
		function typecastValues(values){
			var n = values.length, 
				result = [],
				val;
			while(val = values[--n]){
				result[n] = (val === null)? val : (
						BOOL_REGEXP.test(val)? (val.toLowerCase() === 'true') : (
							(val === '' || isNaN(val))? val : parseFloat(val) //parseFloat(null || '') returns NaN, isNaN('') returns false
						)
					);
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
	