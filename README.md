# README #

## Features ##

* Chat with agents for quick response
* Offers 2 endpoints for customer and agent
* Clean and unobtrusive interface
* Properly handles disconnection

## Extra ##

* Work is divided between agents by using queue data structure, and it also prevent multiple agents working on the same message at once.
*  Used Socket.io, through which new incoming messages can show up in real time and conversation could be more interactive.

## Setup and Configuration ##

**Install the dependencies** 

```
npm install
```

**Start the node server**

```
node server.js
```

**Open the URLs**

## Customer Page ##

Format: http://localhost:3000/customer/userId (currently we are not authauthenticating userId)

Sample: [Customer page](http://localhost:3000/customer/123)
 
## Agent Page ##

Format: http://localhost:3000/agent/agentId (currently we are not authauthenticating agentId)

Sample: [Admin page](http://localhost:3000/agent/456)


Note: This code is currently not connected to any database.
