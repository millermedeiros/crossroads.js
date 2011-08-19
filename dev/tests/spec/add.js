/*jshint onevar:false */


describe('Add', function(){

    beforeEach(function(){
        crossroads.removeAllRoutes();
    });


    it('should return a route and attach it to crossroads', function(){

        var s = crossroads.addRoute('/{foo}');

        expect( s ).toBeDefined();
        expect( s.rules ).toBeUndefined();
        expect( crossroads.getNumRoutes() ).toBe( 1 );
        expect( s.matched.getNumListeners() ).toBe( 0 );

    });

    it('should add listener to matched', function(){

        var s = crossroads.addRoute('/{foo}', function(){
            expect().toBe('shouldnt be called');
        });

        expect( s ).toBeDefined();
        expect( s.rules ).toBeUndefined();
        expect( crossroads.getNumRoutes() ).toBe( 1 );
        expect( s.matched.getNumListeners() ).toBe( 1 );

    });

    it('should accept RegExp', function(){

        var s = crossroads.addRoute(/^foo\/([a-z]+)$/, function(){
            expect().toBe('shouldnt be called');
        });

        expect( s ).toBeDefined();
        expect( s.rules ).toBeUndefined();
        expect( crossroads.getNumRoutes() ).toBe( 1 );
        expect( s.matched.getNumListeners() ).toBe( 1 );

    });

    it('should increment', function(){

        var s1 = crossroads.addRoute(/^foo\/([a-z]+)$/, function(){
            expect().toBe('shouldnt be called');
        });

        var s2 = crossroads.addRoute('/{foo}', function(){
            expect().toBe('shouldnt be called');
        });

        expect( s1 ).toBeDefined();
        expect( s2 ).toBeDefined();
        expect( s1.rules ).toBeUndefined();
        expect( s2.rules ).toBeUndefined();
        expect( crossroads.getNumRoutes() ).toBe( 2 );
        expect( s1.matched.getNumListeners() ).toBe( 1 );
        expect( s2.matched.getNumListeners() ).toBe( 1 );

    });

    it('should work on multiple instances', function(){

        var s1 = crossroads.addRoute('/bar');
        var cr = crossroads.create();
        var s2 = cr.addRoute('/ipsum');

        expect( s1 ).toBeDefined();
        expect( s2 ).toBeDefined();
        expect( s1.rules ).toBeUndefined();
        expect( s2.rules ).toBeUndefined();
        expect( crossroads.getNumRoutes() ).toBe( 1 );
        expect( cr.getNumRoutes() ).toBe( 1 );
        expect( s1.matched.getNumListeners() ).toBe( 0 );
        expect( s2.matched.getNumListeners() ).toBe( 0 );

    });

});
