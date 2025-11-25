import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-welcome-support',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './welcome-support.html',
  styleUrl: './welcome-support.css'
})
export class WelcomeSupport {

}
