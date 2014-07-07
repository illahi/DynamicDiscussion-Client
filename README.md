Dynamic Discussion Client
===========

Hello! This is a client that handles messages sent from a Dynamic Discussion server. Messages that are sent from a server are presented in a nest-like structure called a 'thread'. A 'thread' is only updated if that thread is open. New threads from other clients are automatically presented in the client without a page refresh. New comments from other clients are automatically presented in the client if that associated thread is already open. The client can only be used if the server is online (working & running). All-in-all this is a model of reddit-like nested comment discussion boards with the major difference in functionality being that new comments and threads are presented in your browser without the requirement of a browser refresh. AngularJS and Socket.io are the major technologies used in this project.  

Using:
>AngularJS
>socket.io

Instructions:
Open the index.html file from your browser. Only works when the server is online.