import { Component } from '@angular/core';
import { ContactHeader } from '../../components/contact/header/header';

@Component({
  selector: 'app-contact',
  imports: [ContactHeader],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {

}
