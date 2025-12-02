import { Component } from '@angular/core';
import { ChatSidebar } from '../components/chat-sidebar/chat-sidebar';
import { ChatWindow } from '../components/chat-window/chat-window';
import { RightSideBar } from '../components/right-side-bar/right-side-bar';

@Component({
  selector: 'app-chat',
  imports: [ChatSidebar,ChatWindow,RightSideBar],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {

}
