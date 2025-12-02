import { AfterViewChecked, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Chat } from '../../services/chat';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {  FormsModule } from '@angular/forms';
import { ChatBox } from "../chat-box/chat-box";

@Component({
  selector:  'app-chat-window',
  imports: [TitleCasePipe, MatIconModule, FormsModule, ChatBox],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css'
})
export class ChatWindow {
  @ViewChild('chatBox', { read: ElementRef }) chatBox?: ElementRef<HTMLDivElement>;
  chatService = inject(Chat);
  message:string ='';

  sendMessage(event?: KeyboardEvent) {
    event?.preventDefault();
    if(!this.message) return;
    this.chatService.sendMessage(this.message);
    this.message="";
    this.scrollToBottom();
  }
  scrollToBottom() {
     const box = this.chatBox?.nativeElement;
    if (box) {
      box.scrollTo({
        top: box.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
}
