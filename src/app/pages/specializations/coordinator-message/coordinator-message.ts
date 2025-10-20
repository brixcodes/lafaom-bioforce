import { Component } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-coordinator-message',
  imports: [TranslatePipe],
  templateUrl: './coordinator-message.html',
  styleUrl: './coordinator-message.css'
})
export class CoordinatorMessage {

}
