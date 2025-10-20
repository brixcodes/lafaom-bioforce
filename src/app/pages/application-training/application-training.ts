import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';

@Component({
  selector: 'app-application-training',
  imports: [CommonModule],
  templateUrl: './application-training.html',
  styleUrl: './application-training.css'
})
export class ApplicationTraining implements OnInit {
  training: any = null;
  sessions: any[] = [];
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private trainingService: TrainingService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'ID de formation manquant'; return; }
    this.trainingService.getTrainingById(id).subscribe({
      next: (res: any) => { this.training = res?.data || res; },
      error: () => { this.error = 'Erreur de chargement de la formation'; }
    });
    this.trainingService.getSessionsByTrainingId(id).subscribe({
      next: (res: any) => { this.sessions = res?.data || []; },
      error: () => {}
    });
  }

  apply(): void {
    if (!this.training?.id) return;
    this.router.navigate(['/form-training', this.training.id]);
  }
}

// duplicate removed
