import { TestBed, inject } from '@angular/core/testing';

import { BotControlService } from './bot-control.service';

describe('BotControlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BotControlService]
    });
  });

  it('should be created', inject([BotControlService], (service: BotControlService) => {
    expect(service).toBeTruthy();
  }));
});
