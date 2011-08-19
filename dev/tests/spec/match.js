/*jshint onevar:false */

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

    it('should support multiple consecutive optional paras', function(){
        var s = crossroads.addRoute('/123/:bar:/:ipsum:');
        expect( s.match('/123') ).toBe( true );
        expect( s.match('/123/') ).toBe( true );
        expect( s.match('/123/asd') ).toBe( true );
        expect( s.match('/123/asd/45') ).toBe( true );
        expect( s.match('/123/asd/45/') ).toBe( true );
        expect( s.match('/123/asd/45/qwe') ).toBe( false );
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

});
