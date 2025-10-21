import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CabinetApplicationService } from '../../services/cabinet-application.service';
import { CabinetApplicationCreateInput } from '../../models/cabinet-application.models';

@Component({
  selector: 'app-form-cabinet',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-cabinet.html',
  styleUrl: './form-cabinet.css'
})
export class FormCabinet {
  form: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  success = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cabinetApplicationService: CabinetApplicationService
  ) {
    this.form = this.fb.group({
      company_name: ['', [Validators.required, Validators.minLength(2)]],
      contact_email: ['', [Validators.required, Validators.email]],
      contact_phone: ['', [Validators.required, Validators.minLength(8)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      registration_number: ['', [Validators.required, Validators.minLength(3)]],
      experience_years: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      qualifications: ['', [Validators.required, Validators.minLength(10)]],
      technical_proposal: ['', [Validators.required, Validators.minLength(20)]],
      financial_proposal: ['', [Validators.required, Validators.minLength(10)]],
      references: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  submit() {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitError = null;
      this.success = false;

      const formValue = this.form.value;
      
      // S'assurer que experience_years est un nombre et nettoyer les données
      const applicationData: CabinetApplicationCreateInput = {
        company_name: (formValue.company_name || '').trim(),
        contact_email: (formValue.contact_email || '').trim(),
        contact_phone: (formValue.contact_phone || '').trim(),
        address: (formValue.address || '').trim(),
        registration_number: (formValue.registration_number || '').trim(),
        experience_years: Number(formValue.experience_years) || 0,
        qualifications: (formValue.qualifications || '').trim(),
        technical_proposal: (formValue.technical_proposal || '').trim(),
        financial_proposal: (formValue.financial_proposal || '').trim(),
        references: (formValue.references || '').trim()
      };

      // Validation supplémentaire - vérifier qu'aucun champ n'est vide
      const requiredFields = ['company_name', 'contact_email', 'contact_phone', 'address', 'registration_number', 'qualifications', 'technical_proposal', 'financial_proposal', 'references'];
      const emptyFields = requiredFields.filter(field => !applicationData[field as keyof CabinetApplicationCreateInput]);
      
      if (emptyFields.length > 0) {
        console.error('❌ [CABINET] Champs vides détectés:', emptyFields);
        this.submitError = `Les champs suivants sont obligatoires: ${emptyFields.join(', ')}`;
        this.isSubmitting = false;
        return;
      }

      // Validation supplémentaire des données
      console.log('📤 [CABINET] Soumission de la candidature...');

      this.cabinetApplicationService.createCabinetApplication(applicationData).subscribe({
        next: (response) => {
          console.log('✅ [CABINET] Candidature soumise avec succès:', response);
          this.success = true;
          this.isSubmitting = false;
          
          // Rediriger vers l'URL de paiement
          if (response.payment_url) {
            setTimeout(() => {
              window.location.href = response.payment_url;
            }, 2000);
          } else {
            // Fallback si pas d'URL de paiement
            setTimeout(() => {
              this.router.navigate(['/recrutements']);
            }, 3000);
          }
        },
        error: (error) => {
          console.error('❌ [CABINET] Erreur lors de la soumission:', error);
          
          let errorMessage = 'Erreur inconnue';
          if (error.status === 422) {
            errorMessage = 'Données invalides. Veuillez vérifier tous les champs.';
            if (error.error && error.error.detail) {
              errorMessage = error.error.detail;
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.submitError = `Erreur lors de la soumission: ${errorMessage}`;
          this.isSubmitting = false;
        }
      });
    } else {
      console.log('❌ [CABINET] Formulaire invalide:', this.form.errors);
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  goBackRecruitments() {
    this.router.navigate(['/recruitment']);
  }
}
