import { Component, inject, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import { MatButtonModule } from "@angular/material/button";
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { Chat } from '../../services/chat';
import { User } from '../../models/User.response';
import { TypingIndicator } from "../typing-indicator/typing-indicator";
@Component({
  selector: 'app-chat-sidebar',
  imports: [MatIconModule, MatMenu, MatButtonModule, MatMenuTrigger, MatMenuItem, TitleCasePipe, TypingIndicator],
  templateUrl: './chat-sidebar.html',
  styleUrl: './chat-sidebar.css'
})
export class ChatSidebar implements OnInit {
  
  authService = inject(AuthService);
  router = inject(Router);
  defaultProfileImage  = "https://randomuser.me/api/portraits/women/7.jpg";
  chatService = inject(Chat);

  ngOnInit(): void {
    this.chatService.startConnection(this.authService.getAccessToken)
  }
  openChatWindow(user:User){
    this.chatService.currentOpenedChat.set(user);
    this.chatService.chatMessagesMap.update(old => ({
      ...old,
      [user.id]: []
    }));
    this.chatService.loadMessages(1);
  }
  logout(){
    this.authService.logout();
    this.router.navigate(["/login"]);
    this.chatService.disconnectConnection();
    this.chatService.currentOpenedChat.set(null);
    this.chatService.loadMore.set(true);
  }
}
