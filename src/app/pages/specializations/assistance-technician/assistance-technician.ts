import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-assistance-technician',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './assistance-technician.html',
  styleUrl: './assistance-technician.css'
})
export class AssistanceTechnician {

}
