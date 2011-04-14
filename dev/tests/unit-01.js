YUI().use('node', 'console', 'test', function (Y){
	
	//==============================================================================
	// Pattern Lexer ---------------------------------------------------------------
	
	var lexerTestCase = new Y.Test.Case({
	
		//name of the test case - if not provided, one is auto-generated
		name : "Lexer",
		
		//---------------------------------------------------------------------
		// Special instructions
		//---------------------------------------------------------------------
		
		_should: {
			ignore: {},
			error : {}
		},
		
		//---------------------------------------------------------------------
		// setUp and tearDown
		//---------------------------------------------------------------------
		
		/*
		 * Sets up data that is needed by each test.
		 */
		setUp : function(){
			
		},
		
		/*
		 * Cleans up everything that was created by setUp().
		 */
		tearDown : function(){
			
		},
		
		//---------------------------------------------------------------------
		// Test methods - names must begin with "test"
		//---------------------------------------------------------------------
		
		testLexerIds : function(){
			var ids = crossroads.patternLexer.getParamIds('/lorem/{ipsum}/{dolor}');
			Y.Assert.areSame('ipsum', ids[0]);
			Y.Assert.areSame('dolor', ids[1]);
		},
		
		testLexerCompilePattern : function(){
			var pattern = '/lorem/{ipsum}/{dolor}',
				regex = crossroads.patternLexer.compilePattern(pattern);
			Y.Assert.areEqual(/^\/lorem\/([^\/]+)\/([^\/]+)$/.source, regex.source);
			Y.Assert.isTrue(regex.test(pattern));
		},
		
		testLexerCompilePatternWithSpecialChars : function(){
			var pattern = '/lo[rem](ipsum)/{ipsum}/{dolor}',
				regex = crossroads.patternLexer.compilePattern(pattern);
			Y.Assert.areEqual(/^\/lo\[rem\]\(ipsum\)\/([^\/]+)\/([^\/]+)$/.source, regex.source);
			Y.Assert.isTrue(regex.test(pattern));
		},
		
		testLexerGetParamValues : function(){
			var pattern = '/lorem/{ipsum}/{dolor}',
				regex = crossroads.patternLexer.compilePattern(pattern),
				params = crossroads.patternLexer.getParamValues('/lorem/foo/bar', regex);
			Y.Assert.isArray(params);
			Y.Assert.areSame('foo', params[0]);
			Y.Assert.areSame('bar', params[1]);
		}
	
	});
	
	//==============================================================================
	// Router ------------------------------------------------------------------
	
	var routerTestCase = new Y.Test.Case({
	
		//name of the test case - if not provided, one is auto-generated
		name : "Router",
		
		//---------------------------------------------------------------------
		// Special instructions
		//---------------------------------------------------------------------
		
		_should: {
			ignore: {},
			error : {}
		},
		
		//---------------------------------------------------------------------
		// setUp and tearDown
		//---------------------------------------------------------------------
		
		/*
		 * Sets up data that is needed by each test.
		 */
		setUp : function(){
			
		},
		
		/*
		 * Cleans up everything that was created by setUp().
		 */
		tearDown : function(){
			crossroads.removeAllRoutes();
		},
		
		//---------------------------------------------------------------------
		// Test methods - names must begin with "test"
		//---------------------------------------------------------------------
		
		
		//-------------------------- Add -------------------------------------//
		
		testAdd : function(){
			var s = crossroads.addRoute('/{foo}');
			
			Y.Assert.isObject(s);
			Y.Assert.isUndefined(s.rules);
			Y.Assert.isUndefined(s.id);
			Y.Assert.isInstanceOf(signals.Signal, s.matched); //maybe remove signals...
			Y.Assert.areSame(1, crossroads._routes.length);
		},
		
		testAdd2 : function(){
			var s = crossroads.addRoute('/{foo}', function(foo){
				Y.Assert.fail('not a trigger test');
			});
			
			Y.Assert.isObject(s);
			Y.Assert.isUndefined(s.rules);
			Y.Assert.isUndefined(s.id);
			Y.Assert.isInstanceOf(signals.Signal, s.matched);
			Y.Assert.areSame(1, s.matched.getNumListeners());
			Y.Assert.areSame(1, crossroads._routes.length);
		},
		
		//-------------------------- Route ---------------------------------------//
		
		
		testRouteSimple1 : function(){
			var t1;
			
			crossroads.addRoute('/{foo}', function(foo){
				t1 = foo;
			});
			crossroads.parse('/lorem_ipsum');
			
			Y.Assert.areSame('lorem_ipsum', t1);
		},
		
		testRouteSimple2 : function(){
			var t1, t2;
			
			crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			crossroads.parse('/lorem_ipsum/dolor');
			
			Y.Assert.areSame('lorem_ipsum', t1);
			Y.Assert.areSame('dolor', t2);
		},
		
		testRouteSimple3 : function(){
			var t1, t2, t3, t4;
			
			crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			crossroads.addRoute('/{foo}/{bar}/', function(foo, bar){
				t3 = foo;
				t4 = bar;
			});
			crossroads.parse('/lorem_ipsum/dolor/');
			
			Y.Assert.isUndefined(t1);
			Y.Assert.isUndefined(t2);
			Y.Assert.areSame('lorem_ipsum', t3);
			Y.Assert.areSame('dolor', t4);
		},
		
		testRouteSimple4 : function(){
			var t1, t2, t3;
			
			crossroads.addRoute('/{foo}', function(foo){
				t1 = foo;
			});
			crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
				t2 = foo;
				t3 = bar;
			});
			crossroads.parse('/lorem_ipsum');
			crossroads.parse('/maecennas/ullamcor');
			
			Y.Assert.areSame('lorem_ipsum', t1);
			Y.Assert.areSame('maecennas', t2);
			Y.Assert.areSame('ullamcor', t3);
		},
		
		testRouteSimple5 : function(){
			var t1, t2, t3;
			
			var a = crossroads.addRoute('/{foo}');
			a.matched.add(function(foo){
				t1 = foo;
			});
			
			var b = crossroads.addRoute('/{foo}/{bar}');
			b.matched.add(function(foo, bar){
				t2 = foo;
				t3 = bar;
			});
			
			crossroads.parse('/lorem_ipsum');
			crossroads.parse('/maecennas/ullamcor');
			
			Y.Assert.areSame('lorem_ipsum', t1);
			Y.Assert.areSame('maecennas', t2);
			Y.Assert.areSame('ullamcor', t3);
		},
		
		testRouteWithTrailingChar : function(){
			var t1, t2, t3;
			
			var a = crossroads.addRoute('/{foo}/');
			a.matched.add(function(foo){
				t1 = foo;
			});
			
			var b = crossroads.addRoute('/{foo}/{bar}/');
			b.matched.add(function(foo, bar){
				t2 = foo;
				t3 = bar;
			});
			
			crossroads.parse('/lorem_ipsum/');
			crossroads.parse('/maecennas/ullamcor/');
			
			Y.Assert.areSame('lorem_ipsum', t1);
			Y.Assert.areSame('maecennas', t2);
			Y.Assert.areSame('ullamcor', t3);
		},
		
		testRouteWithTrailingChar2 : function(){
			var t1, t2, t3;
			
			var a = crossroads.addRoute('/{foo}/');
			a.matched.add(function(foo){
				t1 = foo;
			});
			
			var b = crossroads.addRoute('/{foo}/{bar}/');
			b.matched.add(function(foo, bar){
				t2 = foo;
				t3 = bar;
			});
			
			crossroads.parse('/lorem_ipsum');
			crossroads.parse('/maecennas/ullamcor/');
			
			Y.Assert.isUndefined(t1);
			Y.Assert.areSame('maecennas', t2);
			Y.Assert.areSame('ullamcor', t3);
		},
		
		testRouteWithTrailingChar3 : function(){
			var t1, t2, t3;
			
			var a = crossroads.addRoute('qwe{foo}asd');
			a.matched.add(function(foo){
				t1 = foo;
			});
			
			var b = crossroads.addRoute('qwe{foo}/{bar}asd');
			b.matched.add(function(foo, bar){
				t2 = foo;
				t3 = bar;
			});
			
			crossroads.parse('qwelorem_ipsumasd');
			crossroads.parse('qwemaecennas/ullamcorasd');
			
			Y.Assert.areSame('lorem_ipsum', t1);
			Y.Assert.areSame('maecennas', t2);
			Y.Assert.areSame('ullamcor', t3);
		},
		
		testRouteWithWordSeparator : function(){
			var t1, t2, t3, t4;
			
			var a = crossroads.addRoute('/{foo}_{bar}');
			a.matched.add(function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			
			var b = crossroads.addRoute('/{foo}-{bar}');
			b.matched.add(function(foo, bar){
				t3 = foo;
				t4 = bar;
			});
			
			crossroads.parse('/lorem_ipsum');
			crossroads.parse('/maecennas-ullamcor');
			
			Y.Assert.areSame('lorem', t1);
			Y.Assert.areSame('ipsum', t2);
			Y.Assert.areSame('maecennas', t3);
			Y.Assert.areSame('ullamcor', t4);
		},
		
		//-------------------------- Param Validation ---------------------------------------//
		
		testRouteWithRegexRules : function(){
			var t1, t2, t3, t4;
			
			var pattern = '{foo}-{bar}';
			
			var a = crossroads.addRoute(pattern);
			a.matched.add(function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			a.rules = {
				foo : /\w+/,
				bar : /\d+/
			};
			
			var b = crossroads.addRoute(pattern);
			b.matched.add(function(foo, bar){
				t3 = foo;
				t4 = bar;
			});
			b.rules = {
				foo : /\d+/
			};
			
			crossroads.parse('45-ullamcor'); //first so we make sure it bypassed route `a`
			crossroads.parse('lorem-123');
			
			Y.Assert.areSame('lorem', t1);
			Y.Assert.areSame(123, t2);
			Y.Assert.areSame(45, t3);
			Y.Assert.areSame('ullamcor', t4);
			
		},
		
		testRouteWithArrayRules : function(){
			var t1, t2, t3, t4;
			
			var pattern = '{foo}-{bar}';
			
			var a = crossroads.addRoute(pattern);
			a.matched.add(function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			a.rules = {
				foo : ['lorem', 'ipsum'],
				bar : [123, 789]
			};
			
			var b = crossroads.addRoute(pattern);
			b.matched.add(function(foo, bar){
				t3 = foo;
				t4 = bar;
			});
			b.rules = {
				foo : [45]
			};
			
			crossroads.parse('45-ullamcor'); //first so we make sure it bypassed route `a`
			crossroads.parse('lorem-123');
			
			Y.Assert.areSame('lorem', t1);
			Y.Assert.areSame(123, t2);
			Y.Assert.areSame(45, t3);
			Y.Assert.areSame('ullamcor', t4);
			
		},
		
		
		//-------------------------- Remove ---------------------------------------//
		
		testRemove : function(){
			var t1, t2, t3, t4;
			
			var a = crossroads.addRoute('/{foo}_{bar}');
			a.matched.add(function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			
			crossroads.parse('/lorem_ipsum');			
			crossroads.removeRoute(a);
			crossroads.parse('/foo_bar');
			
			Y.Assert.areSame('lorem', t1);
			Y.Assert.areSame('ipsum', t2);
		},
		
		testDisposeRoute : function(){
			var t1, t2, t3, t4;
			
			var a = crossroads.addRoute('/{foo}_{bar}');
			a.matched.add(function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			
			crossroads.parse('/lorem_ipsum');			
			a.dispose();
			crossroads.parse('/foo_bar');
			
			Y.Assert.areSame('lorem', t1);
			Y.Assert.areSame('ipsum', t2);
		}
		
		
	});
	
	//==============================================================================
	// INIT ------------------------------------------------------------------------
	
	//create the console
	var r = new Y.Console({
	    verbose : true,
	    newestOnTop : false
	});
	 
	if(document.getElementById('testLogger')) r.render('#testLogger');
	 
	Y.Test.Runner.add(lexerTestCase);
	Y.Test.Runner.add(routerTestCase);
	
	//run the tests
	Y.Test.Runner.run();
	
});