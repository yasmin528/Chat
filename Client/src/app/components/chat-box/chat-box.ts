import { AfterViewChecked, Component,effect,inject, Input} from '@angular/core';
import { Chat } from '../../services/chat';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth-service';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-chat-box',
  imports: [MatProgressSpinner,DatePipe,MatIconModule],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.css'
})
export class ChatBox implements AfterViewChecked {

  @Input() scrollContainer?: HTMLDivElement;

  chatService = inject(Chat);
  authService = inject(AuthService);
  private pageNumber = 1;

  constructor(){
    effect(() => {
      const currentChat = this.chatService.currentOpenedChat();
      if (currentChat) {
        this.pageNumber = 1;
        this.chatService.autoEnableScroll.set(true);
        this.chatService.loadMore.set(true);
      }
    });
  }
  loadMoreMessage(){
    this.pageNumber++;
    this.chatService.loadMessages(this.pageNumber);
    this.scrollToTop();
  }
  ngAfterViewChecked(): void {
    if(this.chatService.autoEnableScroll()){
      this.scrollToBottom();
    }
    setTimeout(() => {
      this.chatService.autoEnableScroll.set(false);
    },1000);
  }
  scrollToBottom() {
    const box = this.scrollContainer;
    if (box) {
      box.scrollTo({
        top: box.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
  scrollToTop() {
    console.log(this.chatService.autoEnableScroll())
     const box = this.scrollContainer;
    if (box) {
      box.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
