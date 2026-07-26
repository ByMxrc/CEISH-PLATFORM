import { BadRequestException } from '@nestjs/common';
import { EcuadorianIdentificationService } from './ecuadorian-identification.service';

describe('EcuadorianIdentificationService', () => {
  const service = new EcuadorianIdentificationService();

  it('accepts a valid Ecuadorian identification number', () => {
    expect(service.validate('0100000009')).toBe('0100000009');
  });

  it('rejects an invalid checksum', () => {
    expect(() => service.validate('0100000008')).toThrow(BadRequestException);
  });

  it('rejects an invalid province or third digit', () => {
    expect(() => service.validate('2500000000')).toThrow(BadRequestException);
    expect(() => service.validate('0160000000')).toThrow(BadRequestException);
  });
});
