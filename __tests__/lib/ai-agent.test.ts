import { LeilaAIAgent } from '@/lib/ai-agent';

describe('LeilaAIAgent', () => {
  let agent: LeilaAIAgent;

  beforeEach(() => {
    agent = new LeilaAIAgent();
  });

  describe('Message Processing', () => {
    it('should detect booking intent correctly', async () => {
      const testMessages = [
        'I need to book a plumbing service',
        'Schedule an appointment for electrical work',
        'Can you help me hire a cleaner?',
        'I want to fix my leaky faucet',
      ];

      for (const message of testMessages) {
        const response = await agent.processMessage(message);
        expect(response.message).toBeTruthy();
        expect(response.message.toLowerCase()).toContain('book');
      }
    });

    it('should detect pricing intent correctly', async () => {
      const testMessages = [
        'How much does plumbing cost?',
        'What are your prices for electrical work?',
        'Can I get a quote for cleaning?',
        'What are the fees for HVAC repair?',
      ];

      for (const message of testMessages) {
        const response = await agent.processMessage(message);
        expect(response.message).toBeTruthy();
        expect(response.message.toLowerCase()).toMatch(/price|cost|rate/);
      }
    });

    it('should extract service type correctly', async () => {
      const testCases = [
        { message: 'I need a plumber', expectedService: 'plumbing' },
        { message: 'Fix my electrical outlet', expectedService: 'electrical' },
        { message: 'My AC is broken', expectedService: 'hvac' },
        { message: 'I need house cleaning', expectedService: 'cleaning' },
      ];

      for (const testCase of testCases) {
        const response = await agent.processMessage(testCase.message);
        expect(response.message.toLowerCase()).toContain(testCase.expectedService);
      }
    });

    it('should detect urgency correctly', async () => {
      const urgentMessages = [
        'I need emergency plumbing service',
        'This is urgent, my pipe burst',
        'I need help immediately',
        'Can someone come ASAP?',
      ];

      for (const message of urgentMessages) {
        const response = await agent.processMessage(message);
        expect(response.actions).toBeDefined();
        const bookingAction = response.actions?.find(a => a.type === 'booking');
        expect(bookingAction?.data.urgency).toBe('emergency');
      }
    });
  });

  describe('Context Management', () => {
    it('should maintain conversation history', async () => {
      await agent.processMessage('I need a plumber');
      await agent.processMessage('Tomorrow at 2pm');
      
      const context = agent.getContext();
      expect(context.conversationHistory).toHaveLength(4); // 2 user + 2 assistant
      expect(context.conversationHistory[0].role).toBe('user');
      expect(context.conversationHistory[1].role).toBe('assistant');
    });

    it('should clear context when requested', async () => {
      await agent.processMessage('Test message');
      agent.clearContext();
      
      const context = agent.getContext();
      expect(context.conversationHistory).toHaveLength(0);
    });
  });

  describe('Response Generation', () => {
    it('should provide suggestions when appropriate', async () => {
      const response = await agent.processMessage('I need help');
      expect(response.suggestions).toBeDefined();
      expect(response.suggestions?.length).toBeGreaterThan(0);
    });

    it('should generate appropriate actions', async () => {
      const response = await agent.processMessage('Book plumbing for tomorrow at 10am');
      expect(response.actions).toBeDefined();
      expect(response.actions?.length).toBeGreaterThan(0);
      
      const bookingAction = response.actions?.find(a => a.type === 'booking');
      expect(bookingAction).toBeDefined();
      expect(bookingAction?.data.service).toBe('plumbing');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid inputs gracefully', async () => {
      const invalidInputs = ['', '   ', '!!!', '123'];
      
      for (const input of invalidInputs) {
        const response = await agent.processMessage(input);
        expect(response.message).toBeTruthy();
        expect(response.message).not.toContain('error');
      }
    });
  });
});