/*jshint onevar:false */

//for node
var crossroads = crossroads || require('../../../dist/crossroads');
//end node



describe('crossroads.create()', function(){

    afterEach(function(){
        crossroads.removeAllRoutes();
    });


    describe('new Router instance', function(){

        it('should work in new instances', function(){
            var t1;
            var cr = crossroads.create();

            cr.addRoute('/{foo}', function(foo){
                t1 = foo;
            });
            cr.parse('/lorem_ipsum');

            expect( t1 ).toBe( 'lorem_ipsum' );
        });

        it('shouldn\'t affect static instance', function(){
            var t1;
            var cr = crossroads.create();

            cr.addRoute('/{foo}', function(foo){
                t1 = foo;
            });
            crossroads.addRoute('/{foo}', function(foo){
                t1 = 'error!';
            });
            cr.parse('/lorem_ipsum');

            expect( t1 ).toBe( 'lorem_ipsum' );
        });

        it('shouldn\'t be affected by static instance', function(){
            var t1;
            var cr = crossroads.create();

            crossroads.addRoute('/{foo}', function(foo){
                t1 = foo;
            });
            cr.addRoute('/{foo}', function(foo){
                t1 = 'error!';
            });
            crossroads.parse('/lorem_ipsum');

            expect( t1 ).toBe( 'lorem_ipsum' );
        });

    });

});
