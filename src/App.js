import React from 'react';
import Chatkit from '@pusher/chatkit-server';
import {tokenURL, instanceLocator} from './config'
import './index.scss'
import RoomList from './components/RoomList';
import MessageList from './components/MessageList';
import SendMessageForm from './components/SendMessageForm';
import NewRoomForm from './components/NewRoomForm';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {  
      roomId: null,
      messages: [],
      joinableRooms: [],
      joinedRooms: []
    }
  }

  componentDidMount() {
    const chatManager = new ChatManager({
      instanceLocator,
      userId: 'Neo',
      tokenProvider: new TokenProvider({
        url: tokenURL
      })
    })
    chatManager.connect()
    .then(currentUser => {
      this.currentUser = currentUser
      this.getRooms()
    })
      .catch(err => console.log(err))
    }

    getRooms = () => {
      this.currentUser.getJoinableRooms()
      .then(joinableRooms => {
        this.setState({
          joinableRooms,
          joinedRooms: this.currentUser.rooms
        })
      })
      .catch(err => console.log(err))
    }

    subscribeToRoom = (roomId) => {
      this.setState({messages:[]})
      this.currentUser.subscribeToRoomMultipart({
        roomId: roomId,
        hooks: {
          onMessage: message => {
            this.setState({
              messages: [...this.state.messages, message]
            })
          }
        }
      })
      .then(room => {
        this.setState({
          roomId: room.id
        })
        this.getRooms()
      })
      .catch(err => console.log('Error on subscribing to room: ',err))
    }

  sendMessage = (text) => {
    this.currentUser.sendMessage({
      text,
      roomId: this.state.roomId
    })
  }

  createRoom = (roomName) => {
    this.currentUser.createRoom({
      name: roomName
    })
    .then(room => this.subscribeToRoom(room.id))
    .catch(err => console.log('Error with create room: ',err))
  }

  render() {
    return (
      <div className="App">
        <RoomList 
          roomId = {this.props.roomId}
          subscribeToRoom={this.subscribeToRoom} 
          rooms={[...this.state.joinableRooms, ...this.state.joinedRooms]}/>
        <MessageList 
          roomId={this.state.roomId}
          messages={this.state.messages} />
        <SendMessageForm
          sendMessage={this.sendMessage}
          roomId={this.state.roomId} />
        <NewRoomForm createRoom={this.createRoom}/>
      </div>
    )
  }
}

export default App;
