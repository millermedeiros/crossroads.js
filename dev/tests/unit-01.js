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
            Y.Assert.areEqual(/^\/lorem\/([^\/]+)\/([^\/]+)\/?$/.source, regex.source);
            Y.Assert.isTrue(regex.test(pattern));
        },
        
        testLexerCompilePatternWithSpecialChars : function(){
            var pattern = '/lo[rem](ipsum)/{ipsum}/{dolor}',
                regex = crossroads.patternLexer.compilePattern(pattern);
            Y.Assert.areEqual(/^\/lo\[rem\]\(ipsum\)\/([^\/]+)\/([^\/]+)\/?$/.source, regex.source);
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
            crossroads.bypassed.removeAll();
            crossroads.routed.removeAll();
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
        
        testAddRegExp : function(){
            var s = crossroads.addRoute(/^foo\/([a-z]+)$/, function(foo){
                Y.Assert.fail('not a trigger test');
            });
            
            Y.Assert.isObject(s);
            Y.Assert.isUndefined(s.rules);
            Y.Assert.isUndefined(s.id);
            Y.Assert.isInstanceOf(signals.Signal, s.matched);
            Y.Assert.areSame(1, s.matched.getNumListeners());
            Y.Assert.areSame(1, crossroads._routes.length);
        },
        
        //-------------------------- Match ---------------------------------------//
        
        testMatchSimple1 : function(){
            var r1 = crossroads.addRoute('/lorem-ipsum');
            
            Y.Assert.areSame(true, r1.match('/lorem-ipsum'));
            Y.Assert.areSame(true, r1.match('/lorem-ipsum/'));
            Y.Assert.areSame(false, r1.match('/lorem-ipsum/dolor'));
        },
        
        testMatchSimple2 : function(){
            var r1 = crossroads.addRoute('/lorem-ipsum/');
            
            Y.Assert.areSame(true, r1.match('/lorem-ipsum'));
            Y.Assert.areSame(true, r1.match('/lorem-ipsum/'));
            Y.Assert.areSame(false, r1.match('/lorem-ipsum/dolor'));
        },
        
        testMatchSimple3 : function(){
            var s = crossroads.addRoute('/{foo}');
            
            Y.Assert.areSame(true, s.match('/lorem-ipsum'));
            Y.Assert.areSame(true, s.match('/lorem-ipsum/'));
            Y.Assert.areSame(false, s.match('/lorem-ipsum/dolor'));
            Y.Assert.areSame(false, s.match('lorem-ipsum'));
            Y.Assert.areSame(true, s.match('/123'));
            Y.Assert.areSame(true, s.match('/123/'));
            Y.Assert.areSame(false, s.match('123'));
            Y.Assert.areSame(false, s.match('123/45'));
        },
        
        testMatchArrayOptions : function(){
            var s = crossroads.addRoute('/{foo}/{bar}');
            
            s.rules = {
                foo : ['lorem-ipsum', 123],
                bar : ['dolor', 45]
            };
            
            Y.Assert.areSame(false, s.match('/lorem-ipsum'));
            Y.Assert.areSame(true, s.match('/lorem-ipsum/dolor'));
            Y.Assert.areSame(false, s.match('lorem-ipsum'));
            Y.Assert.areSame(false, s.match('/123'));
            Y.Assert.areSame(false, s.match('123'));
            Y.Assert.areSame(false, s.match('/123/123'));
            Y.Assert.areSame(true, s.match('/123/45'));
        },
        
        testMatchRegexOptions : function(){
            var s = crossroads.addRoute('/{foo}/{bar}');
            
            s.rules = {
                foo : /(^[a-z0-9\-]+$)/,
                bar : /(.+)/
            };
            
            Y.Assert.areSame(false, s.match('/lorem-ipsum'));
            Y.Assert.areSame(true, s.match('/lorem-ipsum/dolor'));
            Y.Assert.areSame(false, s.match('lorem-ipsum'));
            Y.Assert.areSame(false, s.match('/123'));
            Y.Assert.areSame(false, s.match('123'));
            Y.Assert.areSame(true, s.match('/123/45'));
        },
        
        testMatchFunctionOptions : function(){
            var s = crossroads.addRoute('/{foo}/{bar}/{ipsum}');
            
            s.rules = {
                foo : function(val, request, params){
                    return (val === 'lorem-ipsum' || val === 123);
                },
                bar : function(val, request, params){
                    return (request === '/lorem-ipsum/dolor/sit-amet' || request === '/123/45/67');
                },
                ipsum : function(val, request, params){
                    return (params.foo === 'lorem-ipsum' && params.bar === 'dolor' && params.ipsum === 'sit-amet') || (params.foo === 123 && params.bar === 45 && params.ipsum === 67);
                }
            };
            
            Y.Assert.areSame(false, s.match('/lorem-ipsum'));
            Y.Assert.areSame(true, s.match('/lorem-ipsum/dolor/sit-amet'));
            Y.Assert.areSame(false, s.match('lorem-ipsum'));
            Y.Assert.areSame(false, s.match('/123'));
            Y.Assert.areSame(false, s.match('123'));
            Y.Assert.areSame(true, s.match('/123/45/67'));
        },
        
        testMatchMixedRules : function(){
            var s = crossroads.addRoute('/{foo}/{bar}/{ipsum}');
            
            s.rules = {
                foo : function(val, request, params){
                    return (val === 'lorem-ipsum' || val === 123);
                },
                bar : ['dolor', 45],
                ipsum : /(sit-amet|67)/
            };
            
            Y.Assert.areSame(false, s.match('/lorem-ipsum'));
            Y.Assert.areSame(true, s.match('/lorem-ipsum/dolor/sit-amet'));
            Y.Assert.areSame(false, s.match('lorem-ipsum'));
            Y.Assert.areSame(false, s.match('/123'));
            Y.Assert.areSame(false, s.match('123'));
            Y.Assert.areSame(true, s.match('/123/45/67'));
        },
        
        testMatchMagicRule : function(){
            var s = crossroads.addRoute('/{foo}/{bar}/{ipsum}');
            
            s.rules = {
                foo : function(val, request, params){
                    return (val === 'lorem-ipsum' || val === 123);
                },
                bar : ['dolor', 45],
                ipsum : /(sit-amet|67|555)/,
                request_ : function(request){ //this gets executed after all other validations
                    return request !== '/123/45/555';
                }
            };
            
            Y.Assert.areSame(false, s.match('/lorem-ipsum'));
            Y.Assert.areSame(true, s.match('/lorem-ipsum/dolor/sit-amet'));
            Y.Assert.areSame(false, s.match('lorem-ipsum'));
            Y.Assert.areSame(false, s.match('/123'));
            Y.Assert.areSame(false, s.match('123'));
            Y.Assert.areSame(true, s.match('/123/45/67'));
            Y.Assert.areSame(false, s.match('/123/45/555'), 'check if magic rule blocked normal validation');
        },
        
        testMatchMagicRule2 : function(){
            var s = crossroads.addRoute(/^([a-z0-9]+)$/);
            
            s.rules = {
                request_ : function(request){ //this gets executed after all other validations
                    return request !== 555;
                }
            };
            
            Y.Assert.areSame(true, s.match('lorem'));
            Y.Assert.areSame(false, s.match('lorem/dolor/sit-amet'));
            Y.Assert.areSame(false, s.match('lorem-ipsum'));
            Y.Assert.areSame(true, s.match('123'));
            Y.Assert.areSame(false, s.match('555'), 'check if magic rule blocked normal validation');
        },

        testMatchMagicRule3 : function(){
            var s = crossroads.addRoute(/^([a-z0-9]+)$/);
            
            s.rules = {
                request_ : ['lorem', 123]
            };
            
            Y.Assert.areSame(true, s.match('lorem'));
            Y.Assert.areSame(false, s.match('lorem/dolor/sit-amet'));
            Y.Assert.areSame(false, s.match('lorem-ipsum'));
            Y.Assert.areSame(true, s.match('123'));
            Y.Assert.areSame(false, s.match('555'), 'check if magic rule blocked normal validation');
        },

        testMatchMagicRule4 : function(){
            var s = crossroads.addRoute(/^([a-z0-9]+)$/);
            
            s.rules = {
                request_ : /(lorem|123)/
            };
            
            Y.Assert.areSame(true, s.match('lorem'));
            Y.Assert.areSame(false, s.match('lorem/dolor/sit-amet'));
            Y.Assert.areSame(false, s.match('lorem-ipsum'));
            Y.Assert.areSame(true, s.match('123'));
            Y.Assert.areSame(false, s.match('555'), 'check if magic rule blocked normal validation');
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
            crossroads.parse('/lorem_ipsum/dolor');
            
            Y.Assert.areSame('lorem_ipsum', t1);
            Y.Assert.areSame('dolor', t2);
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
        
        testRouteSimple6 : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute('{lorem}/{ipsum}/{dolor}/{sit}');
            a.matched.add(function(a, b, c, d){
                t1 = a;
                t2 = b;
                t3 = c;
                t4 = d;
            });
            
            crossroads.parse('lorem/123/true/false');
            
            Y.Assert.areSame('lorem', t1);
            Y.Assert.areSame(123, t2);
            Y.Assert.areSame(true, t3);
            Y.Assert.areSame(false, t4);
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
            
            Y.Assert.areSame('lorem_ipsum', t1);
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
        
        testRouteWithEmptyPattern : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute();
            a.matched.add(function(foo, bar){
                t1 = 'lorem';
                t2 = 'ipsum';
            });
            
            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            crossroads.parse('');
            
            Y.Assert.areSame('lorem', t1);
            Y.Assert.areSame('ipsum', t2);
        },
        
        testRouteWithEmptyStringPattern : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute('');
            a.matched.add(function(foo, bar){
                t1 = 'lorem';
                t2 = 'ipsum';
            });
            
            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            crossroads.parse('');
            
            Y.Assert.areSame('lorem', t1);
            Y.Assert.areSame('ipsum', t2);
        },
        
        testRouteWithEmptyParse : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute('');
            a.matched.add(function(foo, bar){
                t1 = 'lorem';
                t2 = 'ipsum';
            });
            
            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            crossroads.parse();
            
            Y.Assert.areSame('lorem', t1);
            Y.Assert.areSame('ipsum', t2);
        },
        
        testRouteWithRegExpPattern : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute(/^\/[0-9]+\/([0-9]+)$/); //capturing groups becomes params
            a.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });
            
            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            
            Y.Assert.areSame(456, t1);
            Y.Assert.isUndefined(t2);
        },
        
        testRouteWithRegExpPattern2 : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute(/^\/([a-z]+)\/([a-z]+)$/); //capturing groups becomes params
            a.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });
            
            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            
            Y.Assert.areSame('maecennas', t1);
            Y.Assert.areSame('ullamcor', t2);
            
        },
        
        testRouteWithRegExpPattern3 : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute(/^\/()\/([0-9]+)$/); //capturing groups becomes params
            a.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });
            
            crossroads.parse('//456');
            
            Y.Assert.areSame('', t1);
            Y.Assert.areSame(456, t2);
            
        },
        
        //------------------------------ Priority --------------------------------------------//
        
        testRouteWithPriority : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute('/{foo}/{bar}');
            a.matched.add(function(foo, bar){
                Y.Assert.fail('shouldn\'t match');
            });
            
            var b = crossroads.addRoute('/{foo}/{bar}', null, 1);
            b.matched.add(function(foo, bar){
                t3 = 'foo';
                t4 = 'bar';
            });
            
            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            
            Y.Assert.areSame('foo', t3);
            Y.Assert.areSame('bar', t4);
        },
        
        testRouteWithPriority2 : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
                    Y.Assert.fail('shouldn\'t match');
                }, 4);
            
            var b = crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
                    t3 = 'foo';
                    t4 = 'bar';
                }, 5);
            
            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            
            Y.Assert.areSame('foo', t3);
            Y.Assert.areSame('bar', t4);
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
            crossroads.parse('123-ullamcor');
            crossroads.parse('lorem-123');
            crossroads.parse('lorem-555');
            
            Y.Assert.areSame('lorem', t1);
            Y.Assert.areSame(123, t2);
            Y.Assert.areSame(45, t3);
            Y.Assert.areSame('ullamcor', t4);
            
        },
        
        testRouteWithFunctionRules : function(){
            var t1, t2, t3, t4;
            
            var pattern = '{foo}-{bar}';
            
            var a = crossroads.addRoute(pattern);
            a.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });
            a.rules = {
                foo : function(value, request){
                    return value === 'lorem';
                },
                bar : function(value, request, matches){
                    return request === 'lorem-123';
                }
            };
            
            var b = crossroads.addRoute(pattern);
            b.matched.add(function(foo, bar){
                t3 = foo;
                t4 = bar;
            });
            b.rules = {
                foo : function(value, request, matches){
                    return matches.foo === 45;
                }
            };
            
            crossroads.parse('45-ullamcor'); //first so we make sure it bypassed route `a`
            crossroads.parse('123-ullamcor');
            crossroads.parse('lorem-123');
            crossroads.parse('lorem-555');
            
            Y.Assert.areSame('lorem', t1);
            Y.Assert.areSame(123, t2);
            Y.Assert.areSame(45, t3);
            Y.Assert.areSame('ullamcor', t4);
            
        },
        
        testRouteWithMixedRules : function(){
            var t1, t2, t3, t4;
            
            var pattern = '{foo}-{bar}';
            
            var a = crossroads.addRoute(pattern);
            a.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });
            a.rules = {
                foo : /\w+/,
                bar : function(value, request, matches){
                    return request === 'lorem-123';
                }
            };
            
            var b = crossroads.addRoute(pattern);
            b.matched.add(function(foo, bar){
                t3 = foo;
                t4 = bar;
            });
            b.rules = {
                foo : [123, 456, 567, 2],
                bar : /ullamcor/
            };
            
            crossroads.parse('45-ullamcor'); //first so we make sure it bypassed route `a`
            crossroads.parse('123-ullamcor');
            crossroads.parse('lorem-123');
            crossroads.parse('lorem-555');
            
            Y.Assert.areSame('lorem', t1);
            Y.Assert.areSame(123, t2);
            Y.Assert.areSame(123, t3);
            Y.Assert.areSame('ullamcor', t4);
            
        },
        
        testRouteWithInvalidRules : function(){
            var t1, t2, t3, t4;
            
            var pattern = '{foo}-{bar}';
            
            var a = crossroads.addRoute(pattern);
            a.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });
            a.rules = {
                foo : 'lorem',
                bar : 123
            };
            
            var b = crossroads.addRoute(pattern);
            b.matched.add(function(foo, bar){
                t3 = foo;
                t4 = bar;
            });
            b.rules = {
                foo : false,
                bar : void(0)
            };
            
            crossroads.parse('45-ullamcor');
            crossroads.parse('lorem-123');
            
            Y.Assert.isUndefined(t1);
            Y.Assert.isUndefined(t2);
            Y.Assert.isUndefined(t3);
            Y.Assert.isUndefined(t4);
            
        },
        
        //-------------------------- Signals ---------------------------------------//
        
        
        testBypassed : function(){
            var count = 0, requests = [];
            
            var a = crossroads.addRoute('/{foo}_{bar}');
            a.matched.add(function(foo, bar){
                Y.Assert.fail('shouldn\'t match');
            });
            
            crossroads.bypassed.add(function(request){
                requests.push(request);
                count++;
            });
            
            crossroads.parse('/lorem/ipsum');
            crossroads.parse('/foo/bar');
            
            Y.Assert.areSame('/lorem/ipsum', requests[0]);
            Y.Assert.areSame('/foo/bar', requests[1]);
            Y.Assert.areSame(2, count);
        },
        
        testRoutedSignal : function(){
            var count = 0, 
                requests = [], 
                count2 = 0,
                routed;
            
            var a = crossroads.addRoute('/{foo}_{bar}');
            a.matched.add(function(foo, bar){
                count2++;
            });
            
            crossroads.bypassed.add(function(request){
                requests.push(request);
                count++;
            });
            
            crossroads.routed.add(function(request, route, params){
                requests.push(request);
                count++;
                
                Y.Assert.areSame('/foo_bar', request);
                Y.Assert.areSame(a, route);
                Y.Assert.areEqual('foo', params[0]);
                Y.Assert.areEqual('bar', params[1]);
                routed = true;
            });
            
            crossroads.parse('/lorem/ipsum');
            crossroads.parse('/foo_bar');
            
            Y.Assert.areSame('/lorem/ipsum', requests[0]);
            Y.Assert.areSame('/foo_bar', requests[1]);
            Y.Assert.areSame(2, count);
            Y.Assert.areSame(1, count2);
            Y.Assert.areEqual(true, routed);
        },
        
        
        //-------------------------- toString ---------------------------------------//
        
        testBypassed : function(){
            var count = 0, requests = [];
            
            var a = crossroads.addRoute('/{foo}_{bar}');
            a.matched.add(function(foo, bar){
                Y.Assert.fail('not a trigger test');
            });
            
            Y.Assert.areSame('[crossroads numRoutes:1]', crossroads.toString());
            Y.Assert.areSame('[Route pattern:"/{foo}_{bar}", numListeners:1]', a.toString());
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
        
        testRemoveAll : function(){
            var t1, t2, t3, t4;
            
            var a = crossroads.addRoute('/{foo}/{bar}');
            a.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });
            
            var b = crossroads.addRoute('/{foo}_{bar}');
            b.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });
            
            Y.Assert.areSame(2, crossroads.getNumRoutes());
            crossroads.removeAllRoutes();
            Y.Assert.areSame(0, crossroads.getNumRoutes());
            
            crossroads.parse('/lorem/ipsum');
            crossroads.parse('/foo_bar');
            
            Y.Assert.isUndefined(t1);
            Y.Assert.isUndefined(t2);
            Y.Assert.isUndefined(t3);
            Y.Assert.isUndefined(t4);
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
