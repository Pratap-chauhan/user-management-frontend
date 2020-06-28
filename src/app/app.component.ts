import { Component, OnInit } from '@angular/core';
import { SocketioService } from './socketio.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit  {
  title = 'chatAngular';
  userName;
  connected = false;
  display = 'block';
  activeUser: any = {};
  connections = [];
  messages = [];
  myInfo: any = {};
  userMessage;
  searchConn;
  addParticipant = 'none';
  addParticipantId;
  constructor(private socketService: SocketioService) {

  }
  ngOnInit() {
    const socketInstance = this.socketService.setupSocketConnection();
    if (localStorage.getItem('myInfo')) {
        this.myInfo = JSON.parse(localStorage.getItem('myInfo'));
        this.connected = true;
        this.display = 'none';
        this.activeUser =  JSON.parse(localStorage.getItem('activeUser'));
        this.socketService.getAllData( {to : this.activeUser.id , from : this.myInfo.id});
    }
    this.socketService.loginEven$.subscribe((item: any) => {
       const {event , data } = item;
       if (event  === 'login') {
        this.loginFunction(data);
       } else if (event === 'all data') {
        this.allDataAfterRefresh(data);
       } else if (event === 'searchUser') {
        this.connections = data;
       } else if ( event === 'selectedConnMessage') {
         this.messages = data;
       } else if (event === 'newConnectionAdded') {
        this.connections.push(data);
       } else if (event === 'newMessage') {
         this.newMessageHandler(data);
       } else if (event === 'newConnectionRequest') {
         this.connections = data;
         const activeUserInfo = JSON.parse(localStorage.getItem('activeUser'));
         this.selectConnection({connectionId : data[0].connectionId , name : activeUserInfo.name})
        //  this.socketService.subscribeMyData({id : data[0].connectionId});
       } else if (event === 'addParticipantsStatus') {
          const {status , groupId , participant} = data;
          const connectionIndex = this.connections.findIndex((res) => res.connectionId == groupId);
          console.log("addParticipantsStatus" ,JSON.stringify(this.connections) , data ,connectionIndex );
          if (connectionIndex > -1) {
            this.connections[connectionIndex].participants.push(
              participant
            );
          }
          this.addParticipant = 'none';
       }
    });
  }
  newMessageHandler(data) {
    const {to , from , message} = data;
    if (this.activeUser.id == to.id && from.id !== this.myInfo.id) {
      this.messages.push(data);
    }
  }
  loginFunction(data) {
    const { id , name , connection , messages } = data;
    this.myInfo  = {
      id ,
      name
    };
    this.activeUser = this.myInfo;
    localStorage.setItem('myInfo' , JSON.stringify(this.myInfo));
    localStorage.setItem('activeUser' , JSON.stringify({
      id : connection[0].connectionId,
      name : this.myInfo.name}));
    this.connections = connection;
    this.messages = messages;
    this.connected = true;
  }
  allDataAfterRefresh(data) {
    const { id , name ,  connection , messages } = data;
    this.connections = connection;
    this.messages = messages;
  }
  addUser() {
    this.socketService.addUser(this.userName);
    this.display = 'none';
  }
  submitMessage() {
    const messageData = {
      to : {
        ...this.activeUser
      },
      from : {
        ...this.myInfo
      },
      message : this.userMessage ,
    };
    this.messages.push(messageData);
    this.userMessage = '';
    this.socketService.sendNewMessage(messageData);
  }
  searchConnection() {
    this.socketService.searchConnectionId({searchId : this.searchConn , from: this.myInfo.id});
  }
  selectConnection(connDetails) {
    const {connectionId , id , name } = connDetails;
    const myLocalInfo = JSON.parse(localStorage.getItem('myInfo'));
    this.myInfo = myLocalInfo;
    if (connectionId) {
      console.log("<><" , connectionId);
      this.activeUser.id = connectionId;
      localStorage.setItem('activeUser' , JSON.stringify({
        id : connectionId, name}));
      this.fetchMessages({connectionId , from: myLocalInfo.id});
      return;
    }
    this.socketService.selectedConnection({ id , name, from: myLocalInfo.id});
  }
  fetchMessages(details) {
    this.socketService.fetchConnectionMessage(details);
  }

  addParticipants() {
    this.addParticipant = 'block';
  }
  add() {
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    this.socketService.addParticipants({
      from : this.myInfo.id,
      groupId : activeUser.id,
      participantId : Number(this.addParticipantId)});
  }
}
