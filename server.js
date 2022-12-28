const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Queue = require("./public/js/queue");

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

const roomList = {};
const userCntInRoom = {};
const customerWaitingArena = new Queue();
const agentWaitingArena = new Queue();
let curRoomNumber=1;


app.get("/customer/:id",(req,res)=>{
    res.render('customer',{userId : req.params.id, isCustomer : true});
});

app.get("/agent/:id",(req,res)=>{
    res.render('agent',{userId : req.params.id, isCustomer : false});
});

io.on('connection',(socket)=>{

    socket.on('new-chat-message', (id, message, isCustomer) => {
        if(roomList[id] !== undefined)socket.broadcast.to(roomList[id]).emit('chat-message', message, isCustomer);
    });

    socket.on('find-new-customer', (userId)=>{
        const details=extractDetails(socket.username);
        if(details !== undefined){
            isCustomer = details[0];
            id = details[1];
        }
        socket.leave(roomList[id]);
        while(!customerWaitingArena.isEmpty()){ // this will remove all the extra rooms which doesnt have any customer.
            const peek = customerWaitingArena.peek();
            if(userCntInRoom[peek]>=1)break; // current room have customer.
            customerWaitingArena.dequeue();
        }
        if(!customerWaitingArena.isEmpty()){ // this will check if there are any available room with customer
            const room = customerWaitingArena.dequeue();
            socket.join(room);
            userCntInRoom[room]++;
            roomList[id]=room;
            io.in(room).emit('customer-joined');
        }else{
            socket.join(curRoomNumber);
            userCntInRoom[curRoomNumber]=1;
            roomList[id]=curRoomNumber;
            agentWaitingArena.enqueue(curRoomNumber);
            console.log('room created: ',curRoomNumber);
            curRoomNumber++;
        }
    });


    // handles new connection
    socket.on('new-connection',(id, isCustomer)=>{
        socket.username = getUsername(id, isCustomer);
        if(isCustomer === 'true'){
            while(!agentWaitingArena.isEmpty()){ // this will remove all the extra rooms which doesnt have any agent.
                const peek = agentWaitingArena.peek();
                if(userCntInRoom[peek]>=1)break; // current room have agent waiting for customer.
                agentWaitingArena.dequeue();
            }
            if(!agentWaitingArena.isEmpty()){  // this will check there are any available room with agent
                
                const room = agentWaitingArena.dequeue();
                console.log('inside room', room);
                socket.join(room);
                userCntInRoom[room]++;
                roomList[id]=room;
                socket.broadcast.to(room).emit('agent-joined');
            }else{
                socket.join(curRoomNumber);
                roomList[id]=curRoomNumber;
                userCntInRoom[curRoomNumber]=1;
                customerWaitingArena.enqueue(curRoomNumber);
                curRoomNumber++;
            }
        }else{
            while(!customerWaitingArena.isEmpty()){ // this will remove all the extra rooms which doesnt have any customer.
                const peek = customerWaitingArena.peek();
                if(userCntInRoom[peek]>=1)break; // current room have customer.
                customerWaitingArena.dequeue();
            }
            if(!customerWaitingArena.isEmpty()){ // this will check if there are any available room with customer
                const room = customerWaitingArena.dequeue();
                socket.join(room);
                userCntInRoom[room]++;
                roomList[id]=room;
                io.in(room).emit('customer-joined');
            }else{
                socket.join(curRoomNumber);
                userCntInRoom[curRoomNumber]=1;
                roomList[id]=curRoomNumber;
                agentWaitingArena.enqueue(curRoomNumber);
                curRoomNumber++;
            }
        }
        
    });

    // handle disconnection
    // if user disconnected thats means session is complete and make the agent available for other customers
    // if agent disconnected, we need to add the assigned customer to the queue again

    socket.on('disconnect',()=>{ 
        const details=extractDetails(socket.username);
        let isCustomer,id;
        if(details !== undefined){
            isCustomer = details[0];
            id = details[1];
            userCntInRoom[roomList[id]]--;
            if(isCustomer===true){ // session is complete or customer disconnected due to some issue.
                socket.broadcast.to(roomList[id]).emit('customer-disconnected');
            }else{ // agent disconneted due to some technical issue, in this case we need to again enqueue room in the queue
                customerWaitingArena.enqueue(roomList[id]);
            }
        }
    })

});

function getUsername(id, isCustomer){
    return (isCustomer=='true'?'0':'1') + "." + id;
}

function extractDetails(username){
    if(username===undefined){return}
    const isCustomer = (username[0]==='0'?true:false);
    let id="";
    for(let i=2; i<username.length; i++){
        id+=username[i];
    }
    return [isCustomer, id];
}

server.listen(3000);