import { TestBed } from '@angular/core/testing';

import { ChargeStickService } from './charge-stick.service';

describe('ChargeStickService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChargeStickService = TestBed.get(ChargeStickService);
    expect(service).toBeTruthy();
  });
});
