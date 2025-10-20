import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { JobApplicationService } from '../../services/job-application.service';
import { ConfigService } from '../../services/config.service';
import { JobAttachmentInput, JobApplicationCreateInput } from '../../models/job-application.models';
import { JobOffersService } from '../../services/job-offers.service';

@Component({
  selector: 'app-form-recuitement',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-recuitement.html',
  styleUrl: './form-recuitement.css'
})
export class FormRecuitement {
  form: FormGroup;
  jobId: string | null = null;
  requiredAttachments: string[] = [];
  isSubmitting = false;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private jobApplicationService: JobApplicationService,
    private config: ConfigService,
    private jobOffersService: JobOffersService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      consent: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { requiredAttachments?: string[] } | undefined;
    this.requiredAttachments = state?.requiredAttachments || [];

    if (this.requiredAttachments.length) {
      this.ensureAttachmentControls();
    } else if (this.jobId) {
      // Récupérer les pièces requises depuis l'API si l'état de navigation est absent
      this.jobOffersService.getJobOfferById(this.jobId).subscribe({
        next: (offer: any) => {
          const data = offer?.data || offer;
          this.requiredAttachments = Array.isArray(data?.attachment) ? data.attachment : [];
          this.ensureAttachmentControls();
        },
        error: () => {
          this.requiredAttachments = [];
        }
      });
    }
  }

  private ensureAttachmentControls(): void {
    for (const type of this.requiredAttachments) {
      const controlName = this.getAttachmentControlName(type);
      if (!this.form.get(controlName)) {
        this.form.addControl(controlName, new FormControl<File | null>(null, [Validators.required]));
      } else {
        this.form.get(controlName)!.setValidators([Validators.required]);
        this.form.get(controlName)!.updateValueAndValidity();
      }
    }
  }

  getAttachmentControlName(type: string): string {
    return `att_${(type || '').toString().trim().toLowerCase()}`;
  }

  translateAttachment(type: string): string {
    switch ((type || '').toUpperCase()) {
      case 'CV':
        return 'CV';
      case 'COVER_LETTER':
        return 'Lettre de motivation';
      case 'DIPLOMA':
        return 'Diplôme';
      default:
        return type;
    }
  }

  onFileChange(event: any, controlName: string) {
    const file = event.target.files && event.target.files.length ? event.target.files[0] : null;
    if (file) {
      if (!this.config.isValidFileType(file.name)) {
        this.submitError = 'Type de fichier non supporté.';
        this.form.get(controlName)?.setValue(null);
        return;
      }
      if (!this.config.isValidFileSize(file.size)) {
        this.submitError = 'Fichier trop volumineux.';
        this.form.get(controlName)?.setValue(null);
        return;
      }
    }
    this.form.get(controlName)?.setValue(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.jobId) return;

    this.isSubmitting = true;
    this.submitError = null;

    const uploadCalls = [] as Array<ReturnType<JobApplicationService['uploadAttachment']>>;
    // Vérifier que tous les fichiers requis sont présents
    for (const type of this.requiredAttachments) {
      const controlName = this.getAttachmentControlName(type);
      const file: File | null = this.form.get(controlName)?.value || null;
      if (!file) {
        this.isSubmitting = false;
        this.submitError = `La pièce requise '${this.translateAttachment(type)}' est manquante.`;
        return;
      }
    }
    for (const type of this.requiredAttachments) {
      const controlName = this.getAttachmentControlName(type);
      const file: File | null = this.form.get(controlName)?.value || null;
      if (file) {
        uploadCalls.push(this.jobApplicationService.uploadAttachment(type, file));
      }
    }

    const afterUploads = (uploaded: any[]): JobAttachmentInput[] => {
      const attachments: JobAttachmentInput[] = [];
      for (const res of uploaded) {
        const items = res?.data || [];
        for (const it of items) {
          // Backend returns { name, document_type, file_path }
          if (it?.document_type && it?.file_path) {
            attachments.push({
              name: it?.name || it.document_type,
              type: it.document_type,
              url: it.file_path
            });
            continue;
          }
          // Fallback if backend already returns { name, type, url }
          if (it?.name && it?.type && it?.url) {
            attachments.push({ name: it.name, type: it.type, url: it.url });
          }
        }
      }
      return attachments;
    };

    const proceed = (attachments: JobAttachmentInput[]) => {
      const payload: JobApplicationCreateInput = {
        job_offer_id: this.jobId!,
        email: this.form.value.email,
        phone_number: this.form.value.phone,
        first_name: this.form.value.firstName,
        last_name: this.form.value.lastName,
        attachments: attachments.length ? attachments : undefined
      };
      this.jobApplicationService.createApplication(payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          const applicationNumber = res?.data?.job_application?.application_number;
          const paymentLink = res?.data?.payment?.payment_link;
          this.router.navigate(['/recruitment/success'], {
            queryParams: {
              applicationNumber: applicationNumber || '',
              paymentLink: paymentLink || ''
            }
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.submitError = err?.error?.message || 'Erreur lors de la soumission.';
        }
      });
    };

    if (uploadCalls.length) {
      forkJoin(uploadCalls).subscribe({
        next: (results) => proceed(afterUploads(results)),
        error: (err) => {
          this.isSubmitting = false;
          this.submitError = err?.error?.message || 'Erreur lors de l\'upload des pièces jointes.';
        }
      });
    } else {
      proceed([]);
    }
  }
}
