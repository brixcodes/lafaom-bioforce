import { Component } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-research-coordinator-message',
  imports: [TranslatePipe, CommonModule],
  templateUrl: './research-coordinator-message.html',
  styleUrl: './research-coordinator-message.css'
})
export class ResearchCoordinatorMessage {

}
