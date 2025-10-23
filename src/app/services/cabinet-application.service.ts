import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CabinetApplicationCreateInput, CabinetApplicationResponse } from '../models/cabinet-application.models';

@Injectable({
  providedIn: 'root'
})
export class CabinetApplicationService {
  private apiUrl = 'https://api.lafaom-mao.org/api/v1';

  constructor(private http: HttpClient) { }

  createCabinetApplication(applicationData: CabinetApplicationCreateInput): Observable<CabinetApplicationResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<CabinetApplicationResponse>(`${this.apiUrl}/cabinet-application`, applicationData, { headers });
  }
}
