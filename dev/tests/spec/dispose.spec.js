/*jshint onevar:false */

//for node
var crossroads = crossroads || require('crossroads');
//end node



describe('Route.dispose()', function(){

    afterEach(function(){
        crossroads.resetState();
        crossroads.removeAllRoutes();
    });


    it('should dispose route', function(){
        var t1, t2, t3, t4;

        var a = crossroads.addRoute('/{foo}_{bar}');
        a.matched.add(function(foo, bar){
            t1 = foo;
            t2 = bar;
        });

        crossroads.parse('/lorem_ipsum');
        a.dispose();
        crossroads.parse('/foo_bar');

        expect( t1 ).toBe( 'lorem' );
        expect( t2 ).toBe( 'ipsum' );
    });

});
