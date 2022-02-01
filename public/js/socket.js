const socketio = io();

var sendData = {
    informationId:informationId
}

socketio.emit('c2s-join', sendData);

const form = document.getElementById("chatForm");
form.addEventListener("submit", function(event){
    event.preventDefault();
    sendData = {
        informationId: informationId,
        userId: userId,
        comment: document.getElementById("comment").value
    }
    console.log(sendData);
    socketio.emit('c2s-chat', sendData);
});

socketio.on('s2c-chat', function(msg){
    var ul = document.getElementById("comments");
    var li = document.createElement('li');
    console.log('ソケットs2c-chat1:' + msg.userId + ' ' + msg.comment);
    li.innerHTML = msg.userId + ' ' + msg.comment;
    ul.appendChild(li);
});