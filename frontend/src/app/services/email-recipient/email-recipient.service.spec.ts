import { TestBed } from '@angular/core/testing';

import { EmailRecipientService } from './email-recipient.service';

describe('EmailRecipientService', () => {
  let service: EmailRecipientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailRecipientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
