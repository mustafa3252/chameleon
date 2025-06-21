const { spawn } = require('child_process');
const readline = require('readline');

class LangflowMCPClient {
  constructor() {
    this.process = null;
    this.isConnected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log('Connecting to Langflow MCP server...');
      
      this.process = spawn('npx', [
        '-y', 
        'supergateway', 
        '--sse', 
        'http://localhost:7868/api/v1/mcp/project/78d3460a-050a-4220-9c52-0922b1603a02/sse'
      ]);

      this.process.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('MCP Output:', output);
        
        if (output.includes('connected') || output.includes('ready')) {
          this.isConnected = true;
          resolve();
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error('MCP Error:', data.toString());
      });

      this.process.on('close', (code) => {
        console.log(`MCP process exited with code ${code}`);
        this.isConnected = false;
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  async sendMessage(message) {
    if (!this.isConnected || !this.process) {
      throw new Error('Not connected to MCP server');
    }

    return new Promise((resolve, reject) => {
      this.process.stdin.write(JSON.stringify(message) + '\n');
      
      // For now, we'll just log the response
      // In a real implementation, you'd want to parse the response properly
      setTimeout(() => {
        resolve('Message sent');
      }, 1000);
    });
  }

  async disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.isConnected = false;
    }
  }
}

// Example usage
async function main() {
  const client = new LangflowMCPClient();
  
  try {
    await client.connect();
    console.log('Successfully connected to Langflow MCP server!');
    
    // Example: Send a test message
    await client.sendMessage({
      type: 'test',
      data: 'Hello from MCP client!'
    });
    
    console.log('Test message sent successfully');
    
    // Keep the connection alive for a bit
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.disconnect();
    console.log('Disconnected from MCP server');
  }
}

if (require.main === module) {
  main();
}

module.exports = LangflowMCPClient; 