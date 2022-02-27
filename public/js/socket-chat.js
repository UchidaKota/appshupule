const socketio = io();

var sendData = {
    channelId:channelId
}

socketio.emit('channel-join', sendData);

const form = document.getElementById("chatForm");
form.addEventListener("submit", function(event){
    event.preventDefault();
    sendData = {
        channelId: channelId,
        userInfo: userInfo,
        message: document.getElementById("message").value
    }
    console.log(sendData);
    socketio.emit('channel-chat', sendData);
});

socketio.on('channel-chat', function(msg){
    var ul = document.getElementById("messages");
    var li = document.createElement('li');
    li.className = 'row';
    console.log('ソケットs2c-chat1:' + msg.userInfo.userId + ' ' + msg.comment);
    li.innerHTML = '<div class="col s2"><img src="'+msg.userInfo.userImage+'" class="circle chatimg"></div><div class="col s10"><span class="font-small">'+msg.userInfo.userName+'</span><br>'+msg.message+'</div>';
    ul.appendChild(li);
});