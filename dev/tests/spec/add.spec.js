/*jshint onevar:false */

//for node
let crossroads = crossroads || require('../../../dist/crossroads');
//end node


describe('crossroads.addRoute()', function(){

    beforeEach(function(){
        // specs are run out of order since we check the amount of routes
        // added we need to make sure other tests won't mess up these results
        // otherwise we might spend time trying to debug the wrong issues
        crossroads.removeAllRoutes();
        crossroads.resetState();
    });

    afterEach(function(){
        crossroads.removeAllRoutes();
        crossroads.resetState();
    });


    it('should return a route and attach it to crossroads', function(){

        let s = crossroads.addRoute('/{foo}');

        expect( s ).toBeDefined();
        expect( s.rules ).toBeUndefined();
        expect( crossroads.getNumRoutes() ).toBe( 1 );
        expect( s.matched.getNumListeners() ).toBe( 0 );

    });

    it('should add listener to matched if provided', function(){

        let s = crossroads.addRoute('/{foo}', function(){
            expect().toBe('shouldnt be called');
        });

        expect( s ).toBeDefined();
        expect( s.rules ).toBeUndefined();
        expect( crossroads.getNumRoutes() ).toBe( 1 );
        expect( s.matched.getNumListeners() ).toBe( 1 );

    });

    it('should accept RegExp', function(){

        let s = crossroads.addRoute(/^foo\/([a-z]+)$/, function(){
            expect().toBe('shouldnt be called');
        });

        expect( s ).toBeDefined();
        expect( s.rules ).toBeUndefined();
        expect( crossroads.getNumRoutes() ).toBe( 1 );
        expect( s.matched.getNumListeners() ).toBe( 1 );

    });

    it('should increment num routes', function(){

        let s1 = crossroads.addRoute(/^foo\/([a-z]+)$/, function(){
            expect().toBe('shouldnt be called');
        });

        let s2 = crossroads.addRoute('/{foo}', function(){
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

        let s1 = crossroads.addRoute('/bar');
        let cr = crossroads.create();
        let s2 = cr.addRoute('/ipsum');

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
