import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('WebSocket')
@Controller('websocket')
export class WebSocketDocsController {
  
  @Get('events')
  @Public()
  @ApiOperation({ 
    summary: 'WebSocket Events Documentation',
    description: `
      ## 🔄 Real-time WebSocket Events
      
      Connect to the WebSocket server at: \`ws://localhost:3003\`
      
      ### 📡 Client Events (Emit)
      
      **join_room**
      \`\`\`json
      {
        "event": "join_room",
        "data": {
          "roomId": "123e4567-e89b-12d3-a456-426614174000",
          "userId": "223e4567-e89b-12d3-a456-426614174000"
        }
      }
      \`\`\`
      
      **leave_room**
      \`\`\`json
      {
        "event": "leave_room", 
        "data": {
          "roomId": "123e4567-e89b-12d3-a456-426614174000"
        }
      }
      \`\`\`
      
      **send_message**
      \`\`\`json
      {
        "event": "send_message",
        "data": {
          "roomId": "123e4567-e89b-12d3-a456-426614174000",
          "content": "Hello everyone!",
          "metadata": {},
          "isAnonymous": false
        }
      }
      \`\`\`
      
      **typing_start**
      \`\`\`json
      {
        "event": "typing_start",
        "data": {
          "roomId": "123e4567-e89b-12d3-a456-426614174000"
        }
      }
      \`\`\`
      
      **typing_stop**
      \`\`\`json
      {
        "event": "typing_stop",
        "data": {
          "roomId": "123e4567-e89b-12d3-a456-426614174000"
        }
      }
      \`\`\`
      
      ### 📥 Server Events (Listen)
      
      **message_received**
      \`\`\`json
      {
        "event": "message_received",
        "data": {
          "id": "456e7890-e89b-12d3-a456-426614174000",
          "roomId": "123e4567-e89b-12d3-a456-426614174000",
          "senderId": "223e4567-e89b-12d3-a456-426614174000",
          "content": "Hello everyone!",
          "metadata": {},
          "isAnonymous": false,
          "createdAt": "2024-01-15T10:30:00.000Z"
        }
      }
      \`\`\`
      
      **user_joined**
      \`\`\`json
      {
        "event": "user_joined",
        "data": {
          "roomId": "123e4567-e89b-12d3-a456-426614174000",
          "userId": "223e4567-e89b-12d3-a456-426614174000",
          "username": "user123",
          "joinedAt": "2024-01-15T10:30:00.000Z"
        }
      }
      \`\`\`
      
      **user_left**
      \`\`\`json
      {
        "event": "user_left",
        "data": {
          "roomId": "123e4567-e89b-12d3-a456-426614174000",
          "userId": "223e4567-e89b-12d3-a456-426614174000",
          "leftAt": "2024-01-15T10:30:00.000Z"
        }
      }
      \`\`\`
      
      **typing_indicator**
      \`\`\`json
      {
        "event": "typing_indicator",
        "data": {
          "roomId": "123e4567-e89b-12d3-a456-426614174000",
          "userId": "223e4567-e89b-12d3-a456-426614174000",
          "isTyping": true
        }
      }
      \`\`\`
      
      **call_invitation**
      \`\`\`json
      {
        "event": "call_invitation",
        "data": {
          "sessionId": "789e1234-e89b-12d3-a456-426614174000",
          "callerId": "123e4567-e89b-12d3-a456-426614174000",
          "callType": "video",
          "roomId": "123e4567-e89b-12d3-a456-426614174000"
        }
      }
      \`\`\`
      
      **call_ended**
      \`\`\`json
      {
        "event": "call_ended",
        "data": {
          "sessionId": "789e1234-e89b-12d3-a456-426614174000",
          "reason": "user_hangup",
          "duration": 120
        }
      }
      \`\`\`
      
      ### 🔐 Authentication
      Include JWT token in connection query: \`?token=your-jwt-token\`
      
      ### 📦 Room Management
      Users are automatically subscribed to rooms they're participants of.
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'WebSocket events documentation',
    schema: {
      type: 'object',
      properties: {
        websocketUrl: { type: 'string', example: 'ws://localhost:3003' },
        events: {
          type: 'object',
          properties: {
            client: {
              type: 'array',
              items: { type: 'string' },
              example: ['join_room', 'leave_room', 'send_message', 'typing_start', 'typing_stop']
            },
            server: {
              type: 'array', 
              items: { type: 'string' },
              example: ['message_received', 'user_joined', 'user_left', 'typing_indicator', 'call_invitation', 'call_ended']
            }
          }
        },
        authentication: { type: 'string', example: 'JWT token in query parameter: ?token=your-jwt-token' }
      }
    }
  })
  async getWebSocketEvents() {
    return {
      websocketUrl: 'ws://localhost:3003',
      events: {
        client: ['join_room', 'leave_room', 'send_message', 'typing_start', 'typing_stop'],
        server: ['message_received', 'user_joined', 'user_left', 'typing_indicator', 'call_invitation', 'call_ended']
      },
      authentication: 'JWT token in query parameter: ?token=your-jwt-token'
    };
  }
} 