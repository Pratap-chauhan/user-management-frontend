import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../environments/environment';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class SocketioService {
  socket;
  loginEven$ = new Subject();
  constructor() { }
   setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.socket.on('login' , (data) => {
      this.loginEven$.next({
        event : 'login',
        data
      });
      this.subscribeMyData(data);
    });
  }

  addUser(username) {
    this.socket.emit('add user', username);
  }
  subscribeMyData(mydata) {
    console.log("subscribedConnection" , mydata);
    this.socket.on(`${mydata.id}` , (item) => {
      console.log({item});
      const {event , data} = item;
      this.loginEven$.next({
        event , data
      });
    });
  }
  getAllData(id) {
    this.socket.emit('all data' , id);
    this.subscribeMyData({id : id.from});
    this.subscribeMyData({id : id.to});
  }
  sendNewMessage(data) {
    this.socket.emit('newMessage' , data);
  }
  searchConnectionId(ids) {
    this.socket.emit('searchUser' , ids);
  }
  selectedConnection(data) {
    this.socket.emit('selectConnection', data);
  }
  fetchConnectionMessage(data) {
    this.socket.emit('connectionMessage' , data);
    this.subscribeMyData({id : data.connectionId});
  }
  addParticipants(id)  {
    console.log({id});
    this.socket.emit('addParticipants' , id);
  }
}
