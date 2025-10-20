import { Component } from '@angular/core';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-welcome-support',
  imports: [TranslatePipe],
  templateUrl: './welcome-support.html',
  styleUrl: './welcome-support.css'
})
export class WelcomeSupport {

}
