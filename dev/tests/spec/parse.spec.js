/*jshint onevar:false */

//for node
var crossroads = crossroads || require('crossroads');
//end node


describe('crossroads.parse()', function(){


    afterEach(function(){
        crossroads.removeAllRoutes();
    });



    describe('simple string route', function(){

        it('shold route basic strings', function(){
            var t1 = 0;

            crossroads.addRoute('/foo', function(a){
                t1++;
            });
            crossroads.parse('/bar');
            crossroads.parse('/foo');
            crossroads.parse('foo');

            expect( t1 ).toBe( 1 );
        });

        it('should pass params and allow multiple routes', function(){
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

            expect( t1 ).toBe( 'lorem_ipsum' );
            expect( t2 ).toBe( 'maecennas' );
            expect( t3 ).toBe( 'ullamcor' );
        });

        it('should dispatch matched signal', function(){
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

            expect( t1 ).toBe( 'lorem_ipsum' );
            expect( t2 ).toBe( 'maecennas' );
            expect( t3 ).toBe( 'ullamcor' );
        });

        it('should handle a word separator that isn\'t necessarily /', function(){
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

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 'ipsum' );
            expect( t3 ).toBe( 'maecennas' );
            expect( t4 ).toBe( 'ullamcor' );
        });

        it('should handle empty routes', function(){
            var t1, t2, t3, t4;

            var a = crossroads.addRoute();
            a.matched.add(function(foo, bar){
                t1 = 'lorem';
                t2 = 'ipsum';
            });

            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            crossroads.parse('');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 'ipsum' );
        });

        it('should handle empty strings', function(){
            var t1, t2, t3, t4;

            var a = crossroads.addRoute('');
            a.matched.add(function(foo, bar){
                t1 = 'lorem';
                t2 = 'ipsum';
            });

            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            crossroads.parse('');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 'ipsum' );
        });

        it('should route `null` as empty string', function(){
            var t1, t2, t3, t4;

            var a = crossroads.addRoute('');
            a.matched.add(function(foo, bar){
                t1 = 'lorem';
                t2 = 'ipsum';
            });

            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');
            crossroads.parse();

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 'ipsum' );
        });
    });



    describe('optional params', function(){

        it('should capture optional params', function(){
            var t1, t2, t3, t4;

            var a = crossroads.addRoute('foo/:lorem:/:ipsum:/:dolor:/:sit:');
            a.matched.add(function(a, b, c, d){
                t1 = a;
                t2 = b;
                t3 = c;
                t4 = d;
            });

            crossroads.parse('foo/lorem/123/true/false');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( '123' );
            expect( t3 ).toBe( 'true' );
            expect( t4 ).toBe( 'false' );
        });

        it('should only pass matched params', function(){
            var t1, t2, t3, t4;

            var a = crossroads.addRoute('foo/:lorem:/:ipsum:/:dolor:/:sit:');
            a.matched.add(function(a, b, c, d){
                t1 = a;
                t2 = b;
                t3 = c;
                t4 = d;
            });

            crossroads.parse('foo/lorem/123');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( '123' );
            expect( t3 ).toBeUndefined();
            expect( t4 ).toBeUndefined();
        });

    });



    describe('regex route', function(){

        it('should capture groups', function(){
            var t1, t2, t3, t4;

            var a = crossroads.addRoute(/^\/[0-9]+\/([0-9]+)$/); //capturing groups becomes params
            a.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });

            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');

            expect( t1 ).toBe( '456' );
            expect( t2 ).toBeUndefined();
        });

        it('should capture even empty groups', function(){
            var t1, t2, t3, t4;

            var a = crossroads.addRoute(/^\/()\/([0-9]+)$/); //capturing groups becomes params
            a.matched.add(function(foo, bar){
                t1 = foo;
                t2 = bar;
            });

            crossroads.parse('//456');

            expect( t1 ).toBe( '' );
            expect( t2 ).toBe( '456' );
        });
    });



    describe('typecast values', function(){

        it('should typecast values if shouldTypecast is set to true', function(){
            var prevTypecast = crossroads.shouldTypecast;
            crossroads.shouldTypecast = true;

            var t1, t2, t3, t4, t5, t6;

            var a = crossroads.addRoute('{a}/{b}/{c}/{d}/{e}/{f}');
            a.matched.add(function(a, b, c, d, e, f){
                t1 = a;
                t2 = b;
                t3 = c;
                t4 = d;
                t5 = e;
                t6 = f;
            });

            crossroads.parse('lorem/123/true/false/null/undefined');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 123 );
            expect( t3 ).toBe( true );
            expect( t4 ).toBe( false );
            expect( t5 ).toBe( null );
            expect( t6 ).toBe( undefined );

            crossroads.shouldTypecast = prevTypecast; //restore
        });

        it('should not typecast if shouldTypecast is set to false', function(){
            var prevTypecast = crossroads.shouldTypecast;
            crossroads.shouldTypecast = false;

            var t1, t2, t3, t4;

            var a = crossroads.addRoute('{lorem}/{ipsum}/{dolor}/{sit}');
            a.matched.add(function(a, b, c, d){
                t1 = a;
                t2 = b;
                t3 = c;
                t4 = d;
            });

            crossroads.parse('lorem/123/true/false');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( '123' );
            expect( t3 ).toBe( 'true' );
            expect( t4 ).toBe( 'false' );

            crossroads.shouldTypecast = prevTypecast; //restore
        });

    });


    describe('rules.normalize_', function(){

        it('should normalize params before dispatching signal', function(){

            var t1, t2, t3, t4, t5, t6, t7, t8;

            //based on: https://github.com/millermedeiros/crossroads.js/issues/21

            var myRoute = crossroads.addRoute('{a}/{b}/:c:/:d:');
            myRoute.rules = {
                a : ['news', 'article'],
                b : /[\-0-9a-zA-Z]+/,
                request_ : /\/[0-9]+\/|$/,
                normalize_ : function(request, vals){
                    var id;
                    var idRegex = /^[0-9]+$/;
                    if(vals.a === 'article'){
                        id = vals.c;
                    } else {
                    if( idRegex.test(vals.b) ){
                        id = vals.b;
                    } else if ( idRegex.test(vals.c) ) {
                        id = vals.c;
                    }
                    }
                    return ['news', id]; //return params
                }
            };
            myRoute.matched.addOnce(function(a, b){
                t1 = a;
                t2 = b;
            });
            crossroads.parse('news/111/lorem-ipsum');

            myRoute.matched.addOnce(function(a, b){
                t3 = a;
                t4 = b;
            });
            crossroads.parse('news/foo/222/lorem-ipsum');

            myRoute.matched.addOnce(function(a, b){
                t5 = a;
                t6 = b;
            });
            crossroads.parse('news/333');

            myRoute.matched.addOnce(function(a, b){
                t7 = a;
                t8 = b;
            });
            crossroads.parse('article/news/444');

            expect( t1 ).toBe( 'news' );
            expect( t2 ).toBe( '111' );
            expect( t3 ).toBe( 'news' );
            expect( t4 ).toBe( '222' );
            expect( t5 ).toBe( 'news' );
            expect( t6 ).toBe( '333' );
            expect( t7 ).toBe( 'news' );
            expect( t8 ).toBe( '444' );

        });

    });


    describe('crossroads.normalizeFn', function () {

        var prevNorm;

        beforeEach(function(){
            prevNorm = crossroads.normalizeFn;
        });

        afterEach(function() {
            crossroads.normalizeFn = prevNorm;
        });


        it('should work as a default normalize_', function () {

            var t1, t2, t3, t4, t5, t6, t7, t8;


            crossroads.normalizeFn = function(request, vals){
                var id;
                var idRegex = /^[0-9]+$/;
                if(vals.a === 'article'){
                    id = vals.c;
                } else {
                if( idRegex.test(vals.b) ){
                    id = vals.b;
                } else if ( idRegex.test(vals.c) ) {
                    id = vals.c;
                }
                }
                return ['news', id]; //return params
            };

            var route1 = crossroads.addRoute('news/{b}/:c:/:d:');
            route1.matched.addOnce(function(a, b){
                t1 = a;
                t2 = b;
            });
            crossroads.parse('news/111/lorem-ipsum');

            var route2 = crossroads.addRoute('{a}/{b}/:c:/:d:');
            route2.rules = {
                a : ['news', 'article'],
                b : /[\-0-9a-zA-Z]+/,
                request_ : /\/[0-9]+\/|$/,
                normalize_ : function (req, vals) {
                    return ['foo', vals.b];
                }
            };
            route2.matched.addOnce(function(a, b){
                t3 = a;
                t4 = b;
            });
            crossroads.parse('article/333');

            expect( t1 ).toBe( 'news' );
            expect( t2 ).toBe( '111' );
            expect( t3 ).toBe( 'foo' );
            expect( t4 ).toBe( '333' );

        });


        it('should receive all values as an array on the special property `vals_`', function () {

            var t1, t2;

            crossroads.normalizeFn = function(request, vals){
                //convert params into an array..
                return [vals.vals_];
            };

            crossroads.addRoute('/{a}/{b}', function(params){
                t1 = params;
            });
            crossroads.addRoute('/{a}', function(params){
                t2 = params;
            });

            crossroads.parse('/foo/bar');
            crossroads.parse('/foo');

            expect( t1.join(';') ).toEqual( ['foo', 'bar'].join(';') );
            expect( t2.join(';') ).toEqual( ['foo'].join(';') );

        });

    });


    describe('priority', function(){

        it('should enforce match order', function(){
            var t1, t2, t3, t4;

            var a = crossroads.addRoute('/{foo}/{bar}');
            a.matched.add(function(foo, bar){
                expect(null).toEqual('fail: shouldn\'t match');
            });

            var b = crossroads.addRoute('/{foo}/{bar}', null, 1);
            b.matched.add(function(foo, bar){
                t3 = 'foo';
                t4 = 'bar';
            });

            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');

            expect( t3 ).toBe( 'foo' );
            expect( t4 ).toBe( 'bar' );
        });

        it('shouldnt matter if there is a gap between priorities', function(){
            var t1, t2, t3, t4;

            var a = crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
                    expect(null).toEqual('fail: shouldn\'t match');
                }, 4);

            var b = crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
                    t3 = 'foo';
                    t4 = 'bar';
                }, 999);

            crossroads.parse('/123/456');
            crossroads.parse('/maecennas/ullamcor');

            expect( t3 ).toBe( 'foo' );
            expect( t4 ).toBe( 'bar' );
        });

    });


    describe('validate params before dispatch', function(){

        it('should ignore routes that don\'t validate', function(){
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
                foo : ['123', '456', '567', '2'],
                bar : /ullamcor/
            };

            crossroads.parse('45-ullamcor'); //first so we make sure it bypassed route `a`
            crossroads.parse('123-ullamcor');
            crossroads.parse('lorem-123');
            crossroads.parse('lorem-555');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( '123' );
            expect( t3 ).toBe( '123' );
            expect( t4 ).toBe( 'ullamcor' );
        });

        it('should consider invalid rules as as not matching', function(){
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

            expect( t1 ).toBeUndefined();
            expect( t2 ).toBeUndefined();
            expect( t3 ).toBeUndefined();
            expect( t4 ).toBeUndefined();
        });

    });

});
