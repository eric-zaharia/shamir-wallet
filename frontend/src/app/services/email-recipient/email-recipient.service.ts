import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailRecipientService {
    constructor(
        private http: HttpClient
    ) {
    }

    getEmailRecipients() {
        return this.http.get('api/v1/recipient');
    }

    addEmailRecipient(body: {}) {
        return this.http.post('api/v1/recipient', body);
    }

    deleteEmailRecipient(body: {}) {
        return this.http.delete('api/v1/recipient', { body: body });
    }
}
