import { ShippingService } from './shipping.service';

describe('ShippingService', () => {
  it('uses the matching zone and current admin rate on every quote', async () => {
    const rows = [{ carrier: 'LA_POSTE', zone: 'EUROPE', isLocal: true, basePriceTND: 999 }, { carrier: 'LA_POSTE', zone: 'TUNISIE', isLocal: true, basePriceTND: 7.5 }];
    const rates = { find: jest.fn(async () => rows) };
    const service = new ShippingService(rates as any);
    expect((await service.quote('TN', 'LA_POSTE', 0.8)).price).toBe(7.5);
    rows[1].basePriceTND = 9;
    expect((await service.quote('TN', 'LA_POSTE', 0.8)).price).toBe(9);
  });
  it.each([NaN, Infinity, 0, -1, 80.8])('rejects invalid weight %s', async weight => {
    const service = new ShippingService({ find: jest.fn() } as any);
    await expect(service.quote('TN', 'LA_POSTE', weight)).rejects.toThrow('poids');
  });
  it('rejects unknown names instead of silently truncating them to TN', async () => {
    const service = new ShippingService({ find: jest.fn() } as any);
    await expect(service.quote('TN-invalid', 'LA_POSTE', 0.8)).rejects.toThrow('Pays');
  });
});
