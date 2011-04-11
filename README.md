
# Crossroads - JavaScript Routes #


## Introduction ##

The main of idea behind Crossroads is that it should be a routing system that isn't strictly related with the 
URL, location.hash and/or server requests. The idea is to process any kind of string input and execute functions
that matches the desired pattern.

Crossroads shouldn't depend on any existing library or framework, it should be a pluggable piece that can be used 
on many different kinds of projects, be it for a server-side or client-side application.

The syntax of the pattern matching will probably follow Rails and Pyramid style since those standards are being 
used broadly and are already familiar to a lot of people but it won't follow Rails/Pyramid mapping to *views* 
and *actions*, it will just dispatch an event triggering any listener for that specific *route*. It should be 
as flexible as possible while still being simple to use.


## License ##

[MIT License](http://www.opensource.org/licenses/mit-license.php)