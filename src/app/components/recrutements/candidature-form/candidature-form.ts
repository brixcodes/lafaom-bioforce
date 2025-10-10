import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';

interface UploadStatus {
  uploading: boolean;
  completed: boolean;
  error: string | null;
  url: string | null;
}

interface Attachment {
  name: string;
  type: string;
  file: File;
  status: UploadStatus;
}

@Component({
  selector: 'app-candidature-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidature-form.html',
  styleUrl: './candidature-form.css'
})
export class CandidatureForm {
  @Input() jobOfferId: string = '';
  @Output() applicationSubmitted = new EventEmitter<any>();

  // Formulaire
  form = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    civility: '',
    city: '',
    address: '',
    date_of_birth: '',
    country_code: 'SN'
  };

  // Documents requis
  requiredDocuments = ['CV', 'COVER_LETTER', 'DIPLOMA'];
  
  // Gestion des fichiers
  attachments: Attachment[] = [];
  uploadingCount = 0;
  uploadProgress = 0;
  isSubmitting = false;
  errors: string[] = [];

  // Options
  civilityOptions = [
    { label: 'Monsieur', value: 'M.' },
    { label: 'Madame', value: 'Mme' },
    { label: 'Mademoiselle', value: 'Mlle' }
  ];

  private http = inject(HttpClient);

  // Gestion des fichiers
  onFileSelected(event: any, docType: string) {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier si le type de document existe déjà
    const existingIndex = this.attachments.findIndex(a => a.type === docType);
    
    if (existingIndex >= 0) {
      // Remplacer le fichier existant
      this.attachments[existingIndex] = {
        name: file.name,
        type: docType,
        file: file,
        status: { uploading: false, completed: false, error: null, url: null }
      };
    } else {
      // Ajouter un nouveau fichier
      this.attachments.push({
        name: file.name,
        type: docType,
        file: file,
        status: { uploading: false, completed: false, error: null, url: null }
      });
    }

    // Upload immédiat
    this.uploadFile(docType);
  }

  // Upload immédiat du fichier
  async uploadFile(docType: string) {
    const attachment = this.attachments.find(a => a.type === docType);
    if (!attachment) return;

    attachment.status.uploading = true;
    this.updateUploadCount();

    try {
      const formData = new FormData();
      formData.append('name', docType);
      formData.append('file', attachment.file);

      const response = await this.http.post<any>('https://lafaom.vertex-cam.com/api/v1/job-attachments', formData, {
        reportProgress: true,
        observe: 'events'
      }).toPromise();

      if (response && response.type === HttpEventType.Response) {
        attachment.status.uploading = false;
        attachment.status.completed = true;
        attachment.status.url = response.body.data[0].file_path;
        attachment.status.error = null;
      }

    } catch (error: any) {
      attachment.status.uploading = false;
      attachment.status.error = error.message || 'Erreur d\'upload';
      attachment.status.completed = false;
    }

    this.updateUploadCount();
  }

  // Mise à jour du compteur d'upload
  updateUploadCount() {
    this.uploadingCount = this.attachments.filter(a => a.status.uploading).length;
    const completed = this.attachments.filter(a => a.status.completed).length;
    this.uploadProgress = this.requiredDocuments.length > 0 ? 
      Math.round((completed / this.requiredDocuments.length) * 100) : 0;
  }

  // Validation du formulaire
  isFormValid(): boolean {
    const hasRequiredFields = this.form.first_name && this.form.last_name && 
                            this.form.email && this.form.phone_number && 
                            this.form.city && this.form.address;
    
    const allUploadsCompleted = this.requiredDocuments.every(docType => {
      const attachment = this.attachments.find(a => a.type === docType);
      return attachment && attachment.status.completed && attachment.status.url;
    });

    const hasUploadErrors = this.attachments.some(a => a.status.error);

    return hasRequiredFields && allUploadsCompleted && !hasUploadErrors;
  }

  // Soumission de la candidature
  async submitApplication() {
    if (!this.isFormValid()) {
      this.errors = ['Veuillez remplir tous les champs requis et uploader tous les documents'];
      return;
    }

    this.isSubmitting = true;
    this.errors = [];

    try {
      // Préparer les attachments
      const attachments = this.attachments
        .filter(a => a.status.completed)
        .map(a => ({
          name: a.type,
          type: a.type
        }));

      // Données de candidature
      const applicationData = {
        job_offer_id: this.jobOfferId,
        email: this.form.email,
        phone_number: this.form.phone_number,
        first_name: this.form.first_name,
        last_name: this.form.last_name,
        civility: this.form.civility || undefined,
        country_code: this.form.country_code,
        city: this.form.city,
        address: this.form.address,
        date_of_birth: this.form.date_of_birth || undefined,
        attachments: attachments
      };

      // Envoyer la candidature
      const response = await this.http.post<any>('https://lafaom.vertex-cam.com/api/v1/job-applications', applicationData).toPromise();
      
      this.applicationSubmitted.emit(response);
      
    } catch (error: any) {
      this.errors = [error.message || 'Erreur lors de la soumission'];
    } finally {
      this.isSubmitting = false;
    }
  }

  // Obtenir le statut d'un document
  getDocumentStatus(docType: string): string {
    const attachment = this.attachments.find(a => a.type === docType);
    if (!attachment) return 'pending';
    if (attachment.status.uploading) return 'uploading';
    if (attachment.status.completed) return 'completed';
    if (attachment.status.error) return 'error';
    return 'pending';
  }

  // Obtenir le fichier sélectionné
  getSelectedFile(docType: string): File | null {
    const attachment = this.attachments.find(a => a.type === docType);
    return attachment ? attachment.file : null;
  }
}
