import { Message } from './../models/message';
import { User } from './../models/User.response';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class Chat {

  authservice = inject(AuthService);
  private hubUrl = "https://localhost:5000/hubs/chat";
  onlineUsers = signal<User[]>([]);
  autoEnableScroll = signal<boolean>(true);
  // chatMessages = signal<Message[]>([]);
  chatMessagesMap = signal<Record<string, Message[]>>({});
  currentChatMessages = computed(() => {
    const current = this.currentOpenedChat();
    if (!current) return [];
    return this.chatMessagesMap()[current.id] || [];
  });
  loadMore = signal<boolean>(true);

  currentOpenedChat = signal<User|null>(null);
  isLoading = signal<boolean>(true);
  private hubConnection?:HubConnection;

  startConnection(token:string,senderId?:string){
    if(this.hubConnection?.state === HubConnectionState.Connected) return;

    if(this.hubConnection){
      this.hubConnection.off("NotifyTypingToUser");
      this.hubConnection.off("Notify");
      this.hubConnection.off("OnlineUsers");
      this.hubConnection.off("ReceiveMessageList");
      this.hubConnection.off("ReceiveNewMessage");
    }
    this.hubConnection =  new HubConnectionBuilder().withUrl(`${this.hubUrl}?senderId=${senderId || ''}`,{
      accessTokenFactory:()=>token
    }).withAutomaticReconnect().build();

    this.hubConnection.start().then(
      ()=>{
        console.log("connection started!!");
      }
    ).catch((error)=>{
      console.log("connection or login error",error);
    });
    this.hubConnection.on("NotifyTypingToUser",(senderUserName)=>{
      this.onlineUsers.update((users)=>{
        return users.map((user) => {
          if (user.userName === senderUserName) {
            user.isTyping = true;
          }
          return user;
        });
      });

      setTimeout(() => {
        this.onlineUsers.update((users)=>{
        return users.map((user) => {
          if (user.userName === senderUserName) {
            user.isTyping = false;
          }
          return user;
        });
      });
      }, 2000);

    });
    this.hubConnection.on("Notify", (user: User) => {
    console.log("Notify event received:", user);
    
    if (Notification.permission === "granted" && user.userName !== this.authservice.currentUserLoggedIn?.userName) {
      new Notification("Active Now", {
        body: `${user.fullName} is Active now`,
        icon: user.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      });
    }
  });

    this.hubConnection.on("OnlineUsers",(users:User[])=>{
      console.log(users);
      this.onlineUsers.update(()=>
        users.filter(user=>user.userName!=this.authservice.currentUserLoggedIn?.userName)
      )
    });

    this.hubConnection.on("ReceiveMessageList",(messages:Message[]) =>{
      const currentUser = this.currentOpenedChat();
      if (!currentUser) return;

      this.isLoading.update(() => true);
      console.log(messages)
      if(messages.length == 0){
        this.loadMore.set(false);
      }
      this.chatMessagesMap.update(old => ({
        ...old,
        [currentUser.id]: [...messages, ...(old[currentUser.id] || [])]
      }));
      console.log(this.chatMessagesMap()[currentUser.id])
      this.isLoading.update(() => false);
    });

    this.hubConnection.on("ReceiveNewMessage",message =>{
      document.title = "(1) New message";
      let audio = new Audio("assets/notification.mp3");
      audio.play();
       this.chatMessagesMap.update(old => ({
        ...old,
        [message.senderId]: [...(old[message.senderId] || []), message],
        [message.receiverId]: [...(old[message.receiverId] || []), message]
      }));
    });
  }

  async disconnectConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke("OnDisconnectedAsync"); 
      } catch (err) {
        console.warn("Logout notification failed:", err);
      }
      await this.hubConnection.stop();
    }
  }
  status(username: string):string {
    const currentUser = this.currentOpenedChat();
    if(!currentUser){
      return "Offline";
    }
    const onlineUser = this.onlineUsers().find((user)=> user.userName === username);
    return onlineUser?.isTyping ?"Typing...":this.isUserOnline();
  }
  isUserOnline():string{
    const onlineUser = this.onlineUsers().find((user)=> user.userName === this.currentOpenedChat()?.userName);
    return onlineUser?.isOnline? "Online":this.currentOpenedChat()!.userName;
  }
  loadMessages(pageNum:number){
    this.isLoading.update(()=>true);
    this.hubConnection?.invoke("LoadMessages",this.currentOpenedChat()?.id,pageNum)
      .then()
      .catch()
      .finally(()=>this.isLoading.update(()=>false))
  }

  sendMessage(message:string){
    const receiver = this.currentOpenedChat();
    const sender = this.authservice.currentUserLoggedIn;

    if (!receiver || !sender || !message.trim()) return;

    const msg = {
      ReceiverId: receiver.id,
      Content: message
    };

    // Add message to the local map (UI updates immediately)
    this.chatMessagesMap.update(old => ({
      ...old,
      [receiver.id]: [
        ...(old[receiver.id] || []),
        {
          id: '0',
          content: message,
          senderId: sender.id,
          receiverId: receiver.id,
          createdDate: new Date().toISOString(),
          isRead: false
        }
      ]
    }));
    this.hubConnection?.invoke("SendMessage", msg)
     .then(id => console.log("Message sent to:", id))
     .catch(error => console.log("Send error:", error));
  }
  notifyTyping(){
    this.hubConnection?.invoke("NotifyTyping" ,this.currentOpenedChat()?.userName)
    .then((x)=> console.log("notify for" ,x))
    .catch((error)=>console.log(error))
  }

}
