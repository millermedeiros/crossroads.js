---
layout: default
---


## Why? ##

JavaScript applications are becoming bigger and more complex each day and it is hard to keep control 
of what should be loded/executed at each section.

Most of the back-end frameworks already provide some sort of routes or url dispatch system but it usually requires 
a strict structure that limits the flexibility of the code, specially since it is directly related with the server request 
and calling actions on specific kinds of classes/objects.

Crossroads.js was built with flexibility in mind and with the goal to be used as a standalone utility which can be plugged 
into any application and/or other libraries and frameworks to allow easy and robust url dispatch.

One of the main differences of Crossroads.js is that it uses plain strings for the routing system which means it can be 
used to route URLs, server requests or simply as a messaging system across your application. It also means that 
Crossroads.js dont do things that it isnt supposed to do like updating the window.location, loading data or changing 
the application state unless you want to.

**A routes system shouldnt do anythings else besides routing.**


---


## Dependencies ##

The only dependency is JS-Signals which is used for the event 
system to allow greater flexibility and also to provide advanced features that wouldnt be available with simple callbacks. 
It can be used togheter with any existing JavaScript library/framework.


---


## Should I use it for every kind of project? ##

Certainly not. If your project have just a few static pages a simple switch statement may be enough to solve your 
problems, but as applications start to grow and you have a slightly more complicated flow, having a system that supports 
dynamic variable parsing and a flexible validation schema may help you to reduce the overhead of doing those things manually. 

I consider the main target to be single page applications with complex navigation paths and also large websites that shares 
the same JS files across multiple pages or would benefit of this kind of approach.


---


## Why isnt it a plugin for one of the famous JS Libraries/Frameworks? ##

Extending a library to do things it isnt supposed to do and that are not directly related with its core goal defeats 
the Single Responsibility Principle and is considered a bad practice besides its broad use.

DOM manipulation libraries should be used only for manipulating the DOM. Routing libraries shouldnt do anything 
besides routing... - A duck can walk, fly and swim, but he doesnt know how to do any of those things properly...

Another reason for not extending an existing library/framework is that the amount of code reused would be so minimal 
that it doesnt pay-off the flexibility loss.
