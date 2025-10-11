import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-recrutements-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recrutements-success.html',
  styleUrl: './recrutements-success.css'
})
export class RecrutementsSuccess implements OnInit {
  applicationNumber: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.applicationNumber = params['applicationNumber'] || null;
    });
  }
}
