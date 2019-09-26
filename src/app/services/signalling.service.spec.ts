import { TestBed } from '@angular/core/testing';

import { SignallingService } from './signalling.service';

describe('SignallingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SignallingService = TestBed.get(SignallingService);
    expect(service).toBeTruthy();
  });
});
