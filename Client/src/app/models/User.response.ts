export interface User { 
  id:string;         
  email: string;
  userName: string;
  fullName: string;
  profileImage: string;
  profilePicture:string;
  isOnline:boolean;
  connectionId:string;
  lastMessage:string;
  unreadCount:number;
  isTyping:boolean;
}