import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class EcuadorianIdentificationService {
  validate(value: string): string {
    const identificationNumber = value.trim();
    if (!/^\d{10}$/.test(identificationNumber)) {
      throw new BadRequestException('La cédula debe contener exactamente 10 dígitos');
    }
    const province = Number(identificationNumber.slice(0, 2));
    const thirdDigit = Number(identificationNumber[2]);
    if (province < 1 || province > 24 || thirdDigit > 5) {
      throw new BadRequestException('La cédula ecuatoriana no es válida');
    }
    const sum = identificationNumber.slice(0, 9).split('').reduce((total, digit, index) => {
      let current = Number(digit);
      if (index % 2 === 0) {
        current *= 2;
        if (current > 9) current -= 9;
      }
      return total + current;
    }, 0);
    const checkDigit = (10 - (sum % 10)) % 10;
    if (checkDigit !== Number(identificationNumber[9])) {
      throw new BadRequestException('La cédula ecuatoriana no es válida');
    }
    return identificationNumber;
  }
}
