import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-penitentiary-support',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './penitentiary-support.html',
  styleUrl: './penitentiary-support.css'
})
export class PenitentiarySupport {

}
