/*jshint onevar:false */

//for node
let crossroads = crossroads || require('../../../dist/crossroads');
//end node



describe('Route.dispose()', function(){

    afterEach(function(){
        crossroads.resetState();
        crossroads.removeAllRoutes();
    });


    it('should dispose route', function(){
        let count = 0;

        let a = crossroads.addRoute('{foo}/{bar}');
        a.matched.add(function(foo, bar){
            count++;
        });

        crossroads.parse('foo/bar');
        a.dispose();
        crossroads.parse('dolor/amet');
        expect( count ).toBe( 1 );
    });

});
