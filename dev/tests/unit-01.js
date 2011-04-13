YUI().use('node', 'console', 'test', function (Y){
	
	//==============================================================================
	// BASIC TEST ------------------------------------------------------------------
	
	var basic = new Y.Test.Case({
	
		//name of the test case - if not provided, one is auto-generated
		name : "Basic Test",
		
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
			//crossroads.removeAllRoutes();
		},
		
		//---------------------------------------------------------------------
		// Test methods - names must begin with "test"
		//---------------------------------------------------------------------
		
		//-------------------------- Add -------------------------------------//
		
		testAdd : function(){			
			var s = crossroads.addRoute('/{foo}');
			
			Y.Assert.isObject(s);
			Y.Assert.areSame(s.separator, '/');
			Y.Assert.isNull(s.rules);
			Y.Assert.isNull(s.id);
			Y.Assert.isInstanceOf(s.matched, signals.Signal);
			Y.Assert.areSame(s.pattern, '/{foo}');
		},
		
		testAdd2 : function(){			
			var s = crossroads.addRoute('/{foo}', function(foo){
				Y.Assert.fail('not a trigger test');
			});
			
			Y.Assert.isObject(s);
			Y.Assert.areSame(s.separator, '/');
			Y.Assert.isNull(s.rules);
			Y.Assert.isNull(s.id);
			Y.Assert.isInstanceOf(s.matched, signals.Signal);
			Y.Assert.areSame(s.matched.getNumListeners(), 1);
			Y.Assert.areSame(s.pattern, '/{foo}');
		},
		
		//-------------------------- Route ---------------------------------------//
		
		
		testRouteSimple1 : function(){
			var t1;
			
			crossroads.addRoute('/{foo}', function(foo){
				t1 = foo;
			});
			crossroads.route('/lorem_ipsum');
			
			Y.Assert.areSame(t1, 'lorem_ipsum');
		},
		
		testRouteSimple2 : function(){
			var t1, t2;
			
			crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			crossroads.route('/lorem_ipsum/dolor');
			
			Y.Assert.areSame(t1, 'lorem_ipsum');
			Y.Assert.areSame(t2, 'dolor');
		},
		
		testRouteSimple3 : function(){
			var t1, t2;
			
			crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			crossroads.route('/lorem_ipsum/dolor/'); //shouldn't match because of trailing slash
			
			Y.Assert.isUndefined(t1);
			Y.Assert.isUndefined(t2);
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
			crossroads.route('/lorem_ipsum');
			crossroads.route('/maecennas/ullamcor');
			
			Y.Assert.areSame(t1, 'lorem_ipsum');
			Y.Assert.areSame(t2, 'maecennas');
			Y.Assert.areSame(t3, 'ullamcor');
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
			
			crossroads.route('/lorem_ipsum');
			crossroads.route('/maecennas/ullamcor');
			
			Y.Assert.areSame(t1, 'lorem_ipsum');
			Y.Assert.areSame(t2, 'maecennas');
			Y.Assert.areSame(t3, 'ullamcor');
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
			
			crossroads.route('/lorem_ipsum/');
			crossroads.route('/maecennas/ullamcor/');
			
			Y.Assert.areSame(t1, 'lorem_ipsum');
			Y.Assert.areSame(t2, 'maecennas');
			Y.Assert.areSame(t3, 'ullamcor');
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
			
			crossroads.route('/lorem_ipsum');
			crossroads.route('/maecennas/ullamcor/');
			
			Y.Assert.isUndefined(t1);
			Y.Assert.areSame(t2, 'maecennas');
			Y.Assert.areSame(t3, 'ullamcor');
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
			
			crossroads.route('qwelorem_ipsumasd');
			crossroads.route('qwemaecennas/ullamcorasd');
			
			Y.Assert.areSame(t1, 'lorem_ipsum');
			Y.Assert.areSame(t2, 'maecennas');
			Y.Assert.areSame(t3, 'ullamcor');
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
			
			crossroads.route('/lorem_ipsum');
			crossroads.route('/maecennas-ullamcor');
			
			Y.Assert.areSame(t1, 'lorem');
			Y.Assert.areSame(t2, 'ipsum');
			Y.Assert.areSame(t3, 'maecennas');
			Y.Assert.areSame(t4, 'ullamcor');
		},
		
		testRouteWithCustomSeparator : function(){
			var t1, t2, t3, t4;
			
			var a = crossroads.addRoute('/{foo}{bar}');
			a.matched.add(function(foo, bar){
				t1 = foo;
				t2 = bar;
			});
			a.separator = '_';
			
			var b = crossroads.addRoute('/{foo}{bar}');
			b.matched.add(function(foo, bar){
				t3 = foo;
				t4 = bar;
			});
			b.separator = '-';
			
			crossroads.route('/lorem_ipsum');
			crossroads.route('/maecennas-ullamcor');
			
			Y.Assert.areSame(t1, 'lorem');
			Y.Assert.areSame(t2, 'ipsum');
			Y.Assert.areSame(t3, 'maecennas');
			Y.Assert.areSame(t4, 'ullamcor');
		}
		
		//-------------------------- Remove ---------------------------------------//
		
		
	});
	
	//==============================================================================
	// INIT ------------------------------------------------------------------------
	
	//create the console
	var r = new Y.Console({
	    verbose : true,
	    newestOnTop : false
	});
	 
	if(document.getElementById('testLogger')) r.render('#testLogger');
	 
	Y.Test.Runner.add(basic);
	
	//run the tests
	Y.Test.Runner.run();
	
});