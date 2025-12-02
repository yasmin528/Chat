import { Component, inject } from '@angular/core';
import { Chat } from '../../services/chat';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-right-side-bar',
  imports: [TitleCasePipe],
  templateUrl: './right-side-bar.html',
  styleUrl: './right-side-bar.css'
})
export class RightSideBar {
  chatService = inject(Chat);
  
}
