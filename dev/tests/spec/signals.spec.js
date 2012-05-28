/*jshint onevar:false */

//for node
var crossroads = crossroads || require('crossroads');
//end node



describe('crossroads Signals', function(){

    afterEach(function(){
        crossroads.removeAllRoutes();
        crossroads.bypassed.removeAll();
        crossroads.routed.removeAll();
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
            routed,
            first;

        var a = crossroads.addRoute('/{foo}_{bar}');
        a.matched.add(function(foo, bar){
            count++;
        });

        crossroads.bypassed.add(function(request){
            requests.push(request);
            count2++;
        });

        crossroads.routed.add(function(request, data){
            requests.push(request);
            count++;

            expect( request ).toBe( '/foo_bar' );
            expect( data.route ).toBe( a );
            expect( data.params[0] ).toEqual( 'foo' );
            expect( data.params[1] ).toEqual( 'bar' );
            routed = true;
            first = data.isFirst;
        });

        crossroads.parse('/lorem/ipsum');
        crossroads.parse('/foo_bar');

        expect( requests[0] ).toBe( '/lorem/ipsum' );
        expect( requests[1] ).toBe( '/foo_bar' );
        expect( count ).toBe( 2 );
        expect( count2 ).toBe( 1 );
        expect( routed ).toEqual( true );
        expect( first ).toEqual( true );

    });


    it('isFirst should be false on greedy matches', function () {

        var count = 0,
            firsts = [];

        crossroads.routed.add(function(req, data){
            count += 1;
            firsts.push(data.isFirst);
        });

        //anti-pattern!
        crossroads.addRoute('/{a}/{b}');
        crossroads.addRoute('/{a}/{b}').greedy = true;
        crossroads.addRoute('/{a}/{b}').greedy = true;

        crossroads.parse('/foo/bar');

        expect( count ).toEqual( 3 );
        expect( firsts[0] ).toEqual( true );
        expect( firsts[1] ).toEqual( false );
        expect( firsts[2] ).toEqual( false );

    });

    it('should dispatch `switched` when matching another route', function () {

        var count = 0,
            vals = [],
            req;

        var r1 = crossroads.addRoute('/{a}', function(a){
            vals.push(a);
            count += 1;
        });

        r1.switched.add(function(r){
            vals.push('SWITCH'); //make sure happened before next matched
            req = r;
            count += 1;
        });

        var r2 = crossroads.addRoute('/foo/{a}', function(a){
            vals.push(a);
            count += 1;
        });

        // matching same route twice shouldn't trigger a switched signal (#50)
        crossroads.parse('/foo');
        crossroads.parse('/dolor');

        crossroads.parse('/foo/bar');

        expect( count ).toBe( 4 );
        expect( vals ).toEqual( ['foo', 'dolor', 'SWITCH', 'bar'] );
        expect( req ).toEqual( '/foo/bar' );

    });

});
