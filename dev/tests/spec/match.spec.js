/*jshint onevar:false */

//for node
var crossroads = crossroads || require('crossroads');
//end node


describe('Match', function(){

    afterEach(function(){
        crossroads.removeAllRoutes();
    });


    it('should match simple string', function(){
        var r1 = crossroads.addRoute('/lorem-ipsum');

        expect( r1.match('/lorem-ipsum') ).toBe( true );
        expect( r1.match('/lorem-ipsum/') ).toBe( true );
        expect( r1.match('/lorem-ipsum/dolor') ).toBe( false );
    });

    it('should ignore trailing slash on pattern', function(){
        var r1 = crossroads.addRoute('/lorem-ipsum/');

        expect( r1.match('/lorem-ipsum') ).toBe( true );
        expect( r1.match('/lorem-ipsum/') ).toBe( true );
        expect( r1.match('/lorem-ipsum/dolor') ).toBe( false );
    });

    it('should match params', function(){

        var s = crossroads.addRoute('/{foo}');

        expect( s.match('/lorem-ipsum') ).toBe( true );
        expect( s.match('/lorem-ipsum/') ).toBe( true );
        expect( s.match('/lorem-ipsum/dolor') ).toBe( false );
        expect( s.match('lorem-ipsum') ).toBe( false );
        expect( s.match('/123') ).toBe( true );
        expect( s.match('/123/') ).toBe( true );
        expect( s.match('123') ).toBe( false );
        expect( s.match('123/45') ).toBe( false );

    });

    it('should match optional params', function(){
        var s = crossroads.addRoute(':bar:');
        expect( s.match('lorem-ipsum') ).toBe( true );
        expect( s.match('') ).toBe( true );
        expect( s.match('lorem-ipsum/dolor') ).toBe( false );
        expect( s.match('/lorem-ipsum/') ).toBe( false );

    });

    it('should match normal params and optional params', function(){
        var s = crossroads.addRoute('/{foo}/:bar:');
        expect( s.match('/lorem-ipsum') ).toBe( true );
        expect( s.match('/lorem-ipsum/') ).toBe( true );
        expect( s.match('/lorem-ipsum/dolor') ).toBe( true );
        expect( s.match('123/45') ).toBe( false );
    });

    it('should work even with optional params on the middle of pattern', function(){
        var a = crossroads.addRoute('/{foo}/:bar:/{ipsum}'); //bad use!
        expect( a.match('/123/45/asd') ).toBe( true );
        expect( a.match('/123/asd') ).toBe( true );

        var b = crossroads.addRoute('/{foo}:bar:{ipsum}'); //bad use!
        expect( b.match('/123/45/asd') ).toBe( true );
        expect( b.match('/123/45') ).toBe( true );

        var c = crossroads.addRoute('/{foo}:bar:/ipsum');
        expect( c.match('/123/45/ipsum') ).toBe( true );
        expect( c.match('/123/ipsum') ).toBe( true );

        var d = crossroads.addRoute('/{foo}:bar:ipsum'); //weird use!
        expect( d.match('/123/ipsum') ).toBe( true );
        expect( d.match('/123/45/ipsum') ).toBe( true );
    });

    it('should support multiple consecutive optional params', function(){
        var s = crossroads.addRoute('/123/:bar:/:ipsum:');
        expect( s.match('/123') ).toBe( true );
        expect( s.match('/123/') ).toBe( true );
        expect( s.match('/123/asd') ).toBe( true );
        expect( s.match('/123/asd/45') ).toBe( true );
        expect( s.match('/123/asd/45/') ).toBe( true );
        expect( s.match('/123/asd/45/qwe') ).toBe( false );
    });

    describe('rest params', function () {
        it('should support rest params', function () {
            var s = crossroads.addRoute('/123/{bar}/:ipsum*:');
            expect( s.match('/123') ).toBe( false );
            expect( s.match('/123/') ).toBe( false );
            expect( s.match('/123/asd') ).toBe( true );
            expect( s.match('/123/asd/45') ).toBe( true );
            expect( s.match('/123/asd/45/') ).toBe( true );
            expect( s.match('/123/asd/45/qwe') ).toBe( true );
            expect( s.match('/456/asd/45/qwe') ).toBe( false );
        });

        it('should work even in the middle of pattern', function () {
            var s = crossroads.addRoute('/foo/:bar*:/edit');
            expect( s.match('/foo') ).toBe( false );
            expect( s.match('/foo/') ).toBe( false );
            expect( s.match('/foo/edit') ).toBe( true );
            expect( s.match('/foo/asd') ).toBe( false );
            expect( s.match('/foo/asd/edit') ).toBe( true );
            expect( s.match('/foo/asd/edit/') ).toBe( true );
            expect( s.match('/foo/asd/123/edit') ).toBe( true );
            expect( s.match('/foo/asd/edit/qwe') ).toBe( false );
        });
    });

    describe('slash between params are optional', function(){

        describe('between required params', function(){
            it('after other param', function(){
                var a = crossroads.addRoute('{bar}{ipsum}');

                expect( a.match('123') ).toBe( false );
                expect( a.match('123/') ).toBe( false );
                expect( a.match('123/asd') ).toBe( true );
                expect( a.match('123/asd/') ).toBe( true );
                expect( a.match('123/asd/45') ).toBe( false );
                expect( a.match('123/asd/45/') ).toBe( false );
                expect( a.match('123/asd/45/qwe') ).toBe( false );
            });
        });

        describe('between optional params', function(){
            it('optional after other optional param', function(){
                var a = crossroads.addRoute(':bar::ipsum:');
                expect( a.match('123') ).toBe( true );
                expect( a.match('123/') ).toBe( true );
                expect( a.match('123/asd') ).toBe( true );
                expect( a.match('123/asd/') ).toBe( true );
                expect( a.match('123/asd/45') ).toBe( false );
                expect( a.match('123/asd/45/') ).toBe( false );
                expect( a.match('123/asd/45/qwe') ).toBe( false );
            });
        });

        describe('mixed', function(){

            it('between normal + optional', function(){
                var a = crossroads.addRoute('/{foo}:bar:');
                expect( a.match('/lorem-ipsum/dolor') ).toBe( true );
            });

            it('between normal + optional*2', function(){
                var b = crossroads.addRoute('/{foo}:bar::ipsum:');
                expect( b.match('/123') ).toBe( true );
                expect( b.match('/123/asd') ).toBe( true );
                expect( b.match('/123/asd/') ).toBe( true );
                expect( b.match('/123/asd/qwe') ).toBe( true );
                expect( b.match('/123/asd/qwe/') ).toBe( true );
                expect( b.match('/123/asd/qwe/asd') ).toBe( false );
                expect( b.match('/123/asd/qwe/asd/') ).toBe( false );
            });

            it('with slashes all', function(){
                var c = crossroads.addRoute('bar/{foo}/:bar:/:ipsum:');
                expect( c.match('bar/123') ).toBe( true );
                expect( c.match('bar/123/') ).toBe( true );
                expect( c.match('bar/123/asd') ).toBe( true );
                expect( c.match('bar/123/asd/') ).toBe( true );
                expect( c.match('bar/123/asd/45') ).toBe( true );
                expect( c.match('bar/123/asd/45/') ).toBe( true );
                expect( c.match('bar/123/asd/45/qwe') ).toBe( false );
            });

            it('required param after \\w/', function(){
                var a = crossroads.addRoute('/123/{bar}{ipsum}');
                expect( a.match('/123') ).toBe( false );
                expect( a.match('/123/') ).toBe( false );
                expect( a.match('/123/asd') ).toBe( false );
                expect( a.match('/123/asd/') ).toBe( false );
                expect( a.match('/123/asd/45') ).toBe( true );
                expect( a.match('/123/asd/45/') ).toBe( true );
                expect( a.match('/123/asd/45/qwe') ).toBe( false );
            });

            it('optional params after \\w/', function(){
                var a = crossroads.addRoute('/123/:bar::ipsum:');
                expect( a.match('/123') ).toBe( true );
                expect( a.match('/123/') ).toBe( true );
                expect( a.match('/123/asd') ).toBe( true );
                expect( a.match('/123/asd/') ).toBe( true );
                expect( a.match('/123/asd/45') ).toBe( true );
                expect( a.match('/123/asd/45/') ).toBe( true );
                expect( a.match('/123/asd/45/qwe') ).toBe( false );
            });

        });

    });


    describe('slash is required between word and param', function(){

        it('required param after \\w', function(){
            var a = crossroads.addRoute('/123{bar}{ipsum}');
            expect( a.match('/123') ).toBe( false );
            expect( a.match('/123/') ).toBe( false );
            expect( a.match('/123/asd') ).toBe( false );
            expect( a.match('/123/asd/') ).toBe( false );
            expect( a.match('/123/asd/45') ).toBe( false );
            expect( a.match('/123/asd/45/') ).toBe( false );
            expect( a.match('/123/asd/45/qwe') ).toBe( false );

            expect( a.match('/123asd') ).toBe( false );
            expect( a.match('/123asd/') ).toBe( false );
            expect( a.match('/123asd/45') ).toBe( true );
            expect( a.match('/123asd/45/') ).toBe( true );
            expect( a.match('/123asd/45/qwe') ).toBe( false );
        });

        it('optional param after \\w', function(){
            var a = crossroads.addRoute('/123:bar::ipsum:');
            expect( a.match('/123') ).toBe( true );
            expect( a.match('/123/') ).toBe( true );
            expect( a.match('/123/asd') ).toBe( true );
            expect( a.match('/123/asd/') ).toBe( true );
            expect( a.match('/123/asd/45') ).toBe( false );
            expect( a.match('/123/asd/45/') ).toBe( false );
            expect( a.match('/123/asd/45/qwe') ).toBe( false );

            expect( a.match('/123asd') ).toBe( true );
            expect( a.match('/123asd/') ).toBe( true );
            expect( a.match('/123asd/45') ).toBe( true );
            expect( a.match('/123asd/45/') ).toBe( true );
            expect( a.match('/123asd/45/qwe') ).toBe( false );
        });

    });


    describe('rules', function(){

        describe('basic rules', function(){

            it('should allow array options', function(){

                var s = crossroads.addRoute('/{foo}/{bar}');

                s.rules = {
                    foo : ['lorem-ipsum', '123'],
                    bar : ['dolor', '45']
                };

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/123') ).toBe( false );
                expect( s.match('/123/45') ).toBe( true );

            });

            it('should allow RegExp options', function(){
                var s = crossroads.addRoute('/{foo}/{bar}');

                s.rules = {
                    foo : /(^[a-z0-9\-]+$)/,
                    bar : /(.+)/
                };

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/45') ).toBe( true );
            });

            it('should allow function rule', function(){
                var s = crossroads.addRoute('/{foo}/{bar}/{ipsum}');
                s.rules = {
                    foo : function(val, request, params){
                        return (val === 'lorem-ipsum' || val === '123');
                    },
                    bar : function(val, request, params){
                        return (request !== '/lorem-ipsum');
                    },
                    ipsum : function(val, request, params){
                        return (params.bar === 'dolor' && params.ipsum === 'sit-amet') || (params.bar === '45' && params.ipsum === '67');
                    }
                };

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/44/55') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );
            });

            it('should work with mixed rules', function(){
                var s = crossroads.addRoute('/{foo}/{bar}/{ipsum}');
                s.rules = {
                    foo : function(val, request, params){
                        return (val === 'lorem-ipsum' || val === '123');
                    },
                    bar : ['dolor', '45'],
                    ipsum : /(sit-amet|67)/
                };

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );
            });

            it('should only check rules of optional segments if param exists', function(){

                var a = crossroads.addRoute('/123/:a:/:b:/:c:');
                a.rules = {
                    a : /^\w+$/,
                    b : function(val){
                        return val === 'ipsum';
                    },
                    c : ['lorem', 'bar']
                };

                expect( a.match('/123') ).toBe( true );
                expect( a.match('/123/') ).toBe( true );
                expect( a.match('/123/asd') ).toBe( true );
                expect( a.match('/123/asd/') ).toBe( true );
                expect( a.match('/123/asd/ipsum/') ).toBe( true );
                expect( a.match('/123/asd/ipsum/bar') ).toBe( true );

                expect( a.match('/123/asd/45') ).toBe( false );
                expect( a.match('/123/asd/45/qwe') ).toBe( false );
                expect( a.match('/123/as#%d&/ipsum') ).toBe( false );
                expect( a.match('/123/asd/ipsum/nope') ).toBe( false );

            });


            it('should work with shouldTypecast=false', function(){
                var prevTypecast = crossroads.shouldTypecast;
                var s = crossroads.addRoute('/{foo}/{bar}/{ipsum}');

                crossroads.shouldTypecast = false;

                s.rules = {
                    foo : function(val, request, params){
                        return (val === 'lorem-ipsum' || val === '123');  //only string validates
                    },
                    bar : ['dolor', '45'], //only string validates
                    ipsum : /(sit-amet|67)/
                };

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );

                crossroads.shouldTypecast = prevTypecast; //restore
            });

        });


        describe('path alias', function(){

            it('should work with string pattern', function(){

                var s = crossroads.addRoute('/{foo}/{bar}/{ipsum}');

                s.rules = {
                    0 : ['lorem-ipsum', '123'],
                    1 : function(val, request, params){
                        return (request !== '/lorem-ipsum');
                    },
                    2 : /^(sit-amet|67)$/
                };

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/44/55') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );

            });

            it('should work with RegExp pattern', function(){

                var s = crossroads.addRoute(/([\-\w]+)\/([\-\w]+)\/([\-\w]+)/);

                s.rules = {
                    0 : ['lorem-ipsum', '123'],
                    1 : function(val, request, params){
                        return (request !== '/lorem-ipsum');
                    },
                    2 : /^(sit-amet|67)$/
                };

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/44/55') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );

            });

        });


        describe('request_', function(){

            it('should validate whole request', function(){
                var s = crossroads.addRoute(/^([a-z0-9]+)$/);
                s.rules = {
                    request_ : function(request){ //this gets executed after all other validations
                        return request !== '555';
                    }
                };
                expect( s.match('lorem') ).toBe( true );
                expect( s.match('lorem/dolor/sit-amet') ).toBe( false );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('123') ).toBe( true );
                expect( s.match('555') ).toBe( false );
            });

            it('should execute after other rules', function(){
                var s = crossroads.addRoute('/{foo}/{bar}/{ipsum}');
                s.rules = {
                    foo : function(val, request, params){
                        return (val === 'lorem-ipsum' || val === '123');
                    },
                    bar : ['dolor', '45'],
                    ipsum : /(sit-amet|67|555)/,
                    request_ : function(request){ //this gets executed after all other validations
                        return request !== '/123/45/555';
                    }
                };
                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );
                expect( s.match('/123/45/555') ).toBe( false );
            });

            it('can be an array', function(){
                var s = crossroads.addRoute(/^([a-z0-9]+)$/);
                s.rules = {
                    request_ : ['lorem', '123']
                };
                expect( s.match('lorem') ).toBe( true );
                expect( s.match('lorem/dolor/sit-amet') ).toBe( false );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('123') ).toBe( true );
                expect( s.match('555') ).toBe( false );
            });

            it('can be a RegExp', function(){
                var s = crossroads.addRoute(/^([a-z0-9]+)$/);
                s.rules = {
                    request_ : /^(lorem|123)$/
                };
                expect( s.match('lorem') ).toBe( true );
                expect( s.match('lorem/dolor/sit-amet') ).toBe( false );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('123') ).toBe( true );
                expect( s.match('555') ).toBe( false );
            });

            it('should work with optional params', function(){
                var s = crossroads.addRoute(':foo:');
                s.rules = {
                    request_ : /^(lorem|123|)$/ //empty also matches!
                };
                expect( s.match('lorem') ).toBe( true );
                expect( s.match('lorem/dolor/sit-amet') ).toBe( false );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('123') ).toBe( true );
                expect( s.match('555') ).toBe( false );
                expect( s.match('') ).toBe( true );
            });

        });



        describe('normalize_', function(){

            it('should ignore normalize_ since it isn\'t a validation rule', function () {

                var calledNormalize = false;
                var s = crossroads.addRoute('/{foo}/{bar}/{ipsum}');
                s.rules = {
                     foo : function(val, request, params){
                         return (val === 'lorem-ipsum' || val === '123');
                     },
                     bar : ['dolor', '45'],
                     ipsum : /(sit-amet|67)/,
                     normalize_ : function(){
                         calledNormalize = true;
                         return [true];
                     }
                 };

                 expect( calledNormalize ).toBe( false );
                 expect( s.match('/lorem-ipsum') ).toBe( false );
                 expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                 expect( s.match('lorem-ipsum') ).toBe( false );
                 expect( s.match('/123') ).toBe( false );
                 expect( s.match('123') ).toBe( false );
                 expect( s.match('/123/45/67') ).toBe( true );
            });

        });

    });
});
