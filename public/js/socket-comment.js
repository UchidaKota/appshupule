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
        userInfo: userInfo,
        comment: document.getElementById("comment").value
    }
    console.log(sendData);
    socketio.emit('c2s-chat', sendData);
});

socketio.on('s2c-chat', function(msg){
    var ul = document.getElementById("comments");
    var li = document.createElement('li');
    li.className = 'row';
    console.log('ソケットs2c-chat1:' + msg.userId + ' ' + msg.comment);
    li.innerHTML = '<div class="col s2"><img src="'+msg.userInfo.userImage+'" class="circle chatimg"></div><div class="col s10"><span class="font-small">'+msg.userInfo.userName+'</span><br>'+msg.comment+'</div>';
    ul.appendChild(li);
});