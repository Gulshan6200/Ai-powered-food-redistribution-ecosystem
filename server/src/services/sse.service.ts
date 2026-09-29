import { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
}

class SSEManager {
  private clients: SSEClient[] = [];

  addClient(id: string, res: Response) {
    this.clients.push({ id, res });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Real-time Event Stream Connected' })}\n\n`);

    res.on('close', () => {
      this.clients = this.clients.filter(c => c.id !== id);
    });
  }

  broadcast(eventType: string, data: any) {
    const payload = `data: ${JSON.stringify({ type: eventType, data, timestamp: new Date().toISOString() })}\n\n`;
    for (const client of this.clients) {
      try {
        client.res.write(payload);
      } catch (err) {
        // Client connection error; handled on close
      }
    }
  }
}

export const sseManager = new SSEManager();
