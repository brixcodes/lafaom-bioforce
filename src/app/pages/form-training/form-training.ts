import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '../../services/training.service';

@Component({
  selector: 'app-form-training',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-training.html',
  styleUrl: './form-training.css'
})
export class FormTraining {
  form: FormGroup;
  trainingId: string | null = null;
  sessions: any[] = [];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private trainingService: TrainingService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      target_session_id: ['', [Validators.required]],
      consent: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.trainingId = this.route.snapshot.paramMap.get('id');
    if (this.trainingId) {
      this.trainingService.getTrainingById(this.trainingId).subscribe({
        next: (res: any) => { this.sessions = res?.data || []; },
        error: () => {}
      });
    }
  }

  submit(): void {
    if (this.form.invalid || !this.trainingId) { this.form.markAllAsTouched(); return; }
    const payload = {
      email: this.form.value.email,
      target_session_id: this.form.value.target_session_id
    };
    this.trainingService.createStudentApplication(payload).subscribe({
      next: () => this.router.navigate(['/recruitment/success'], { queryParams: { applicationNumber: '' } }),
      error: () => {}
    });
  }
}
