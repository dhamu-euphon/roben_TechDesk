import { TestBed } from '@angular/core/testing';

import { JobCheckinService } from './job-checkin.service';

describe('JobCheckinService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JobCheckinService = TestBed.get(JobCheckinService);
    expect(service).toBeTruthy();
  });
});
