const EventEmitter = require('events');

/**
 * MCP Protocol Handler
 * Implements the Model Context Protocol for claude.ai integration
 */
class MCPHandler extends EventEmitter {
  constructor(methods, schemas) {
    super();
    this.methods = methods;
    this.schemas = schemas;
    this.clients = new Map();
  }

  /**
   * Get server capabilities
   */
  getCapabilities() {
    return {
      capabilities: {
        tools: this.getToolsCapabilities(),
        resources: {},
        prompts: {}
      },
      protocolVersion: "2024-11-05",
      serverInfo: {
        name: "protected-coingecko-mcp-server",
        version: "1.0.0"
      }
    };
  }

  /**
   * Convert schema methods to MCP tools format
   */
  getToolsCapabilities() {
    const tools = {};
    
    if (this.schemas && this.schemas.schema && this.schemas.schema.properties) {
      Object.entries(this.schemas.schema.properties).forEach(([name, method]) => {
        // Ensure we have valid inputSchema
        const inputSchema = method.parameters || {
          type: "object",
          properties: {},
          required: []
        };
        
        tools[name] = {
          description: method.description || `Execute ${name} method`,
          inputSchema: {
            type: inputSchema.type || "object",
            properties: inputSchema.properties || {},
            required: inputSchema.required || []
          }
        };
      });
    }
    
    return tools;
  }

  /**
   * Handle incoming MCP messages
   */
  async handleMessage(message) {
    const { method, params, id } = message;

    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: this.getCapabilities()
          };

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: this.listTools()
            }
          };

        case 'tools/call':
          return await this.callTool(params, id);

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`
            }
          };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }

  /**
   * List available tools in MCP format
   */
  listTools() {
    const tools = [];
    
    if (this.schemas && this.schemas.schema && this.schemas.schema.properties) {
      Object.entries(this.schemas.schema.properties).forEach(([name, method]) => {
        // Ensure we have valid inputSchema
        const inputSchema = method.parameters || {
          type: "object",
          properties: {},
          required: []
        };
        
        tools.push({
          name,
          description: method.description || `Execute ${name} method`,
          inputSchema: {
            type: inputSchema.type || "object",
            properties: inputSchema.properties || {},
            required: inputSchema.required || []
          }
        });
      });
    }
    
    return tools;
  }

  /**
   * Call a tool (delegate to JSON-RPC methods)
   */
  async callTool(params, id) {
    const { name, arguments: args } = params;

    return new Promise((resolve) => {
      // Call the JSON-RPC method
      this.methods[name]([args], (error, result) => {
        if (error) {
          resolve({
            jsonrpc: '2.0',
            id,
            error: {
              code: error.code || -32603,
              message: error.message,
              data: error.data
            }
          });
        } else {
          resolve({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result)
                }
              ]
            }
          });
        }
      });
    });
  }

  /**
   * Handle SSE connection
   */
  handleSSEConnection(req, res) {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const clientId = Date.now().toString();
    this.clients.set(clientId, res);

    // Send initial connection event
    res.write(`event: open\ndata: ${JSON.stringify({ type: 'connection', id: clientId })}\n\n`);

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(':ping\n\n');
    }, 30000);

    // Handle client disconnect
    req.on('close', () => {
      clearInterval(keepAlive);
      this.clients.delete(clientId);
    });
  }

  /**
   * Send message to SSE client
   */
  sendSSEMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (client) {
      client.write(`data: ${JSON.stringify(message)}\n\n`);
    }
  }

  /**
   * Broadcast message to all SSE clients
   */
  broadcastSSE(message) {
    this.clients.forEach((client) => {
      client.write(`data: ${JSON.stringify(message)}\n\n`);
    });
  }
}

module.exports = MCPHandler;