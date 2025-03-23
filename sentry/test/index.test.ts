import { ConsensusSentry } from '../src';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('ConsensusSentry', () => {
  const client = new ConsensusSentry({ apiKey: 'test' });

  afterEach(() => {
    mock.reset();
  });

  it('should return valid result for safe content', async () => {
    // Mock a successful response
    mock.onPost('/check').reply(200, {
      status: 'safe',
      violations: [],
      request_id: '123'
    });

    const result = await client.validate('safe content');
    
    // Assertions
    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.requestId).toBe('123');
    expect(result.status).toBe('safe');
  });

  it('should return invalid result for unsafe content', async () => {
    // Mock a response with violations
    mock.onPost('/check').reply(200, {
      status: 'violation',
      violations: [
        {
          rule_id: 'rule1',
          type: 'keyword',
          matched: 'bad word',
          confidence: 0.95
        }
      ],
      request_id: '456'
    });

    const result = await client.validate('unsafe content');
    
    // Assertions
    expect(result.valid).toBe(false);
    expect(result.violations).toEqual([
      {
        ruleId: 'rule1',
        type: 'keyword',
        matched: 'bad word',
        confidence: 0.95
      }
    ]);
    expect(result.requestId).toBe('456');
    expect(result.status).toBe('violation');
  });

  it('should handle API errors', async () => {
    // Mock a server error
    mock.onPost('/check').reply(500, { error: 'Server error' });
    
    // Assert that the error is thrown
    await expect(client.validate('test'))
      .rejects
      .toThrow('API Error: 500 - {"error":"Server error"}');
  });

  it('should handle network errors', async () => {
    // Mock a network error
    mock.onPost('/check').networkError();
    
    // Assert that the error is thrown
    await expect(client.validate('test'))
      .rejects
      .toThrow('Network Error: Network Error');
  });

  it('should use custom baseURL if provided', async () => {
    const customClient = new ConsensusSentry({
      apiKey: 'test',
      baseURL: 'https://custom-api.example.com'
    });

    // Mock a successful response
    mock.onPost('https://custom-api.example.com/check').reply(200, {
      status: 'safe',
      violations: [],
      request_id: '123'
    });

    const result = await customClient.validate('test content');
    expect(result.valid).toBe(true);
  });
});