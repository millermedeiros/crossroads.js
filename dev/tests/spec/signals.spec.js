/*jshint onevar:false */

//for node
var crossroads = crossroads || require('crossroads');
//end node



describe('crossroads Signals', function(){

    afterEach(function(){
        crossroads.removeAllRoutes();
    });



    it('should dispatch bypassed if don\'t match any route', function(){
        var count = 0, requests = [];
        var a = crossroads.addRoute('/{foo}_{bar}');

        a.matched.add(function(foo, bar){
            expect(null).toEqual('fail: shouldn\'t match');
        });
        crossroads.bypassed.add(function(request){
            requests.push(request);
            count++;
        });

        crossroads.parse('/lorem/ipsum');
        crossroads.parse('/foo/bar');

        expect( requests[0] ).toBe( '/lorem/ipsum' );
        expect( requests[1] ).toBe( '/foo/bar' );
        expect( count ).toBe( 2 );
    });

    it('should dispatch routed at each match', function(){
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

            expect( request ).toBe( '/foo_bar' );
            expect( route ).toBe( a );
            expect( params[0] ).toEqual( 'foo' );
            expect( params[1] ).toEqual( 'bar' );
            routed = true;
        });

        crossroads.parse('/lorem/ipsum');
        crossroads.parse('/foo_bar');

        expect( requests[0] ).toBe( '/lorem/ipsum' );
        expect( requests[1] ).toBe( '/foo_bar' );
        expect( count ).toBe( 2 );
        expect( count2 ).toBe( 1 );
        expect( routed ).toEqual( true );


        crossroads.bypassed.removeAll();
        crossroads.routed.removeAll();
    });

});
