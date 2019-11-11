import { TestBed } from '@angular/core/testing';

import { PaymentChannelService } from './payment-channel.service';

describe('PaymentChannelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PaymentChannelService = TestBed.get(PaymentChannelService);
    expect(service).toBeTruthy();
  });
});
