import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LangflowMCPClient {
  constructor() {
    this.process = null;
    this.isConnected = false;
    this.messageId = 1;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Connecting to Langflow MCP server...');
      
      this.process = spawn('npx', [
        '-y', 
        'supergateway', 
        '--sse', 
        'http://localhost:7868/api/v1/mcp/project/78d3460a-050a-4220-9c52-0922b1603a02/sse'
      ]);

      let outputBuffer = '';

      this.process.stdout.on('data', (data) => {
        // Log raw output for debugging
        console.log('RAW MCP STDOUT:', data.toString());
        
        outputBuffer += data.toString();
        
        // Try to parse complete JSON messages
        const lines = outputBuffer.split('\n');
        outputBuffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const message = JSON.parse(line);
              this.handleMessage(message);
            } catch (e) {
              console.log('Raw output:', line);
            }
          }
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error('❌ MCP Error:', data.toString());
      });

      this.process.on('close', (code) => {
        console.log(`🔌 MCP process exited with code ${code}`);
        this.isConnected = false;
      });

      // Wait for initialization
      setTimeout(() => {
        if (this.process && this.process.pid) {
          this.isConnected = true;
          console.log('✅ Successfully connected to Langflow MCP server!');
          resolve();
        } else {
          reject(new Error('Failed to start MCP process'));
        }
      }, 3000);
    });
  }

  handleMessage(message) {
    console.log('📨 Received message:', JSON.stringify(message, null, 2));
  }

  async sendMessage(method, params = {}) {
    if (!this.isConnected || !this.process) {
      throw new Error('Not connected to MCP server');
    }

    const message = {
      jsonrpc: '2.0',
      id: this.messageId++,
      method: method,
      params: params
    };

    console.log('📤 Sending message:', JSON.stringify(message, null, 2));
    this.process.stdin.write(JSON.stringify(message) + '\n');
  }

  async listTools() {
    await this.sendMessage('tools/list');
  }

  async callTool(toolName, arguments_ = {}) {
    await this.sendMessage('tools/call', {
      name: toolName,
      arguments: arguments_
    });
  }

  async uploadFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    console.log(`📁 Uploading file: ${fileName}`);
    
    await this.sendMessage('tools/call', {
      name: 'upload_file',
      arguments: {
        file_name: fileName,
        file_content: fileContent
      }
    });
  }

  async analyzeFiles(filePaths) {
    console.log(`🔍 Analyzing ${filePaths.length} file(s)...`);
    
    await this.sendMessage('tools/call', {
      name: 'analyze_files',
      arguments: {
        file_paths: filePaths
      }
    });
  }

  async disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.isConnected = false;
      console.log('🔌 Disconnected from MCP server');
    }
  }
}

// Example usage
async function main() {
  const client = new LangflowMCPClient();
  
  try {
    await client.connect();
    
    // List available tools
    console.log('\n🔧 Listing available tools...');
    await client.listTools();
    
    // Wait a bit for the response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Example: Upload a test file
    const testFile = 'test.cobol';
    if (fs.existsSync(testFile)) {
      console.log('\n📁 Uploading test file...');
      await client.uploadFile(testFile);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Example: Analyze files
    console.log('\n🔍 Triggering analysis...');
    await client.analyzeFiles(['test.cobol']);
    
    // Keep connection alive to see responses
    console.log('\n⏳ Waiting for responses... (Press Ctrl+C to exit)');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

main();

export default LangflowMCPClient; 