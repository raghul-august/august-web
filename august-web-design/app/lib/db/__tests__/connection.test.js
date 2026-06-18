import { query } from '../index';

describe('Database Connection', () => {
  it('should connect to the database', async () => {
    const result = await query('SELECT NOW()');
    expect(result.rows).toBeDefined();
  });
}); 