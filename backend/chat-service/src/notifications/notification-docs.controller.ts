import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationDocsController {
  
  @Get('integration')
  @Public()
  @ApiOperation({ 
    summary: 'Notification Service Integration',
    description: `
      ## 📢 Real-time Notification System
      
      The Chat Service integrates with the Notification Service to provide real-time alerts and updates.
      
      ### 🔔 Notification Types
      
      **New Message Notifications**
      - Triggered when a user receives a new message
      - Includes sender info, message preview, and room context
      - Respects user notification preferences
      
      **Call Invitation Notifications**
      - Sent when a user receives a video/audio call invitation
      - Includes caller info and call type
      - Time-sensitive with auto-expiry
      
      **Room Activity Notifications**
      - User joined/left room notifications
      - Room settings updated
      - Moderation actions taken
      
      **System Notifications**
      - Account-related updates
      - Security alerts
      - Service announcements
      
      ### 📱 Delivery Channels
      
      **Push Notifications**
      - Mobile app notifications (iOS/Android)
      - Web browser notifications
      - Customizable per user preferences
      
      **Email Notifications**
      - Important account updates
      - Weekly/daily digest options
      - Security and privacy alerts
      
      **In-App Notifications**
      - Real-time notification feed
      - Unread message indicators
      - System status updates
      
      ### ⚙️ Integration Details
      
      **Service Integration**
      - Notification Service URL: \`http://notification-service:3005\`
      - Async message delivery via HTTP API
      - Retry mechanism for failed deliveries
      - Notification templating and localization
      
      **User Preferences**
      - Granular notification controls
      - Channel-specific settings
      - Do-not-disturb scheduling
      - Emergency override capabilities
      
      **Privacy & Security**
      - Encrypted notification content
      - Anonymous messaging support
      - GDPR-compliant data handling
      - User consent management
      
      ### 📊 Analytics & Monitoring
      
      **Delivery Metrics**
      - Notification delivery rates
      - User engagement tracking
      - Channel performance analysis
      - Error rate monitoring
      
      **User Behavior**
      - Notification interaction patterns
      - Preference optimization suggestions
      - Engagement quality metrics
      - Spam detection and prevention
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification integration information',
    schema: {
      type: 'object',
      properties: {
        notificationService: { 
          type: 'string', 
          example: 'http://notification-service:3005' 
        },
        supportedTypes: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'new_message',
            'call_invitation', 
            'user_joined',
            'user_left',
            'room_updated',
            'moderation_action',
            'system_alert'
          ]
        },
        deliveryChannels: {
          type: 'array',
          items: { type: 'string' },
          example: ['push', 'email', 'in_app', 'sms']
        },
        features: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Real-time delivery',
            'User preferences',
            'Template system',
            'Multi-language support',
            'Analytics tracking',
            'Privacy protection'
          ]
        }
      }
    }
  })
  async getNotificationIntegration() {
    return {
      notificationService: 'http://notification-service:3005',
      supportedTypes: [
        'new_message',
        'call_invitation', 
        'user_joined',
        'user_left',
        'room_updated',
        'moderation_action',
        'system_alert'
      ],
      deliveryChannels: ['push', 'email', 'in_app', 'sms'],
      features: [
        'Real-time delivery',
        'User preferences',
        'Template system',
        'Multi-language support',
        'Analytics tracking',
        'Privacy protection'
      ]
    };
  }
} 