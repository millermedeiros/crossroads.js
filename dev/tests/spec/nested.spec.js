/*jshint onevar:false */

//for node
var crossroads = crossroads || require('../../../dist/crossroads');
//end node


describe('nested routes', function(){

    var baseRoute, childRoute;

    beforeEach(function(){
        // specs are run out of order since we check the amount of routes
        // added we need to make sure other tests won't mess up these results
        // otherwise we might spend time trying to debug the wrong issues
        crossroads.removeAllRoutes();
        crossroads.resetState();

        baseRoute = crossroads.addRoute('/base/{foo}');
        childRoute = baseRoute.addRoute('child/{bar}');
        baseRoute.addRoute('/another/child');
    });

    afterEach(function(){
        crossroads.removeAllRoutes();
        crossroads.resetState();
    });


    describe('parse child', function(){

        it('should match the child route', function(){

            var childMatched = jasmine.createSpy();
            childRoute.matched.add(childMatched);

            crossroads.parse('/base/foo/child/bar');
            expect(childMatched).toHaveBeenCalledWith('bar');

        });

        it('should not match unkown children', function(){

            var bypassed = jasmine.createSpy();
            crossroads.bypassed.add(bypassed);

            crossroads.parse('/base/foo/unkown');
            expect(bypassed).toHaveBeenCalled();

        });

        it('should match the ancestor route', function(){

            var ancestorMatched = jasmine.createSpy();
            baseRoute.matched.add(ancestorMatched);

            crossroads.parse('/base/foo/child/bar');
            expect(ancestorMatched).toHaveBeenCalledWith('foo');

        });

        it('should switch the child route', function(){

            var childSwitched = jasmine.createSpy();
            childRoute.switched.add(childSwitched);

            crossroads.parse('/base/foo/child/bar');
            crossroads.parse('/base/foo/another/child');
            expect(childSwitched).toHaveBeenCalled();

        });

        it('should not switch the ancestor route', function(){

            var ancestorSwitched = jasmine.createSpy();
            baseRoute.switched.add(ancestorSwitched);

            crossroads.parse('/base/foo/child/bar');
            crossroads.parse('/base/foo/another/child');
            expect(ancestorSwitched.calls.length).toEqual(0);

        });

        it('should match the index route', function(){

            var indexMatched = jasmine.createSpy(),
                indexRoute = baseRoute.addRoute(indexMatched)

            crossroads.parse('/base/foo');
            expect(indexMatched).toHaveBeenCalled();

        });

    });


    describe('parse multiple children', function(){

        var anotherChild;

        beforeEach(function(){
            crossroads.greedy = true;
            anotherChild = baseRoute.addRoute('/{child}/bar');
        });

        it('should match both children', function(){

            var childMatched = jasmine.createSpy();
            childRoute.matched.add(childMatched);
            anotherChild.matched.add(childMatched);

            crossroads.parse('/base/foo/child/bar');
            expect(childMatched.calls.length).toEqual(2);

        });

        it('should match ancestors only once', function(){
            var parentMatched = jasmine.createSpy();
            baseRoute.matched.add(parentMatched);

            crossroads.parse('/base/foo/child/bar');
            expect(parentMatched.calls.length).toEqual(1);
        });

    });

    describe('parse different bases', function(){

        beforeEach(function(){
            crossroads.addRoute('/another');
        });

        it('should switch the child route', function(){

            var childSwitched = jasmine.createSpy();
            childRoute.switched.add(childSwitched);

            crossroads.parse('/base/foo/child/bar');
            crossroads.parse('/another');
            expect(childSwitched).toHaveBeenCalled();

        });

        it('should switch the ancestor route', function(){

            var ancestorSwitched = jasmine.createSpy();
            baseRoute.switched.add(ancestorSwitched);

            crossroads.parse('/base/foo/child/bar');
            crossroads.parse('/another');
            expect(ancestorSwitched).toHaveBeenCalled();

        });

        it('should match only parent', function() {
            var childMatched = jasmine.createSpy();
            var parentMatched = jasmine.createSpy();
            childRoute.matched.add(childMatched);
            baseRoute.matched.add(parentMatched);

            crossroads.parse('/base/foo');
            expect(childMatched.calls.length).toEqual(0);
            expect(parentMatched).toHaveBeenCalled();

        });

    });
});
