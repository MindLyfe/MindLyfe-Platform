# MindLyfe iOS Implementation Plan

**Version:** 1.0  
**Author:** Tina, iOS Specialist  
**Date:** {{Current Date}}  

## 1. Overview

This document outlines the implementation strategy for the MindLyfe iOS application, focusing on four critical mobile-specific aspects of our user journeys:

1. Optimized mobile onboarding flow
2. Biometric authentication implementation
3. Mobile notification system with actionable buttons
4. Seamless therapy session experiences on mobile devices

The implementation will follow Apple's Human Interface Guidelines (HIG) while ensuring security, performance, and a cohesive user experience across the MindLyf ecosystem.

## 2. Mobile Onboarding Flow Optimization

### 2.1 Architecture & Components

- **Pattern:** MVVM + Coordinator pattern for navigation flow
- **Key Components:**
  - `OnboardingCoordinator`: Manages the entire onboarding flow
  - `WelcomeViewController`: Initial screen with value proposition
  - `AuthenticationViewController`: Account creation/login options
  - `ConsentViewController`: Privacy and data use policies
  - `AssessmentViewController`: AI-driven onboarding assessment
  - `PersonalizationViewController`: Customization options
  - `DashboardSetupViewController`: Initial dashboard configuration

### 2.2 Technical Implementation

```swift
// OnboardingCoordinator.swift
final class OnboardingCoordinator: Coordinator {
    private let window: UIWindow
    private let navigationController: UINavigationController
    private let onboardingService: OnboardingServiceProtocol
    private let authService: AuthServiceProtocol
    
    init(window: UIWindow, 
         onboardingService: OnboardingServiceProtocol, 
         authService: AuthServiceProtocol) {
        self.window = window
        self.navigationController = UINavigationController()
        self.onboardingService = onboardingService
        self.authService = authService
        
        // Configure navigation appearance for onboarding
        let appearance = UINavigationBarAppearance()
        appearance.configureWithTransparentBackground()
        navigationController.navigationBar.standardAppearance = appearance
        navigationController.navigationBar.scrollEdgeAppearance = appearance
    }
    
    func start() {
        showWelcomeScreen()
        window.rootViewController = navigationController
        window.makeKeyAndVisible()
    }
    
    private func showWelcomeScreen() {
        let viewModel = WelcomeViewModel(onboardingService: onboardingService)
        let welcomeVC = WelcomeViewController(viewModel: viewModel)
        
        welcomeVC.onGetStartedTapped = { [weak self] in
            self?.showAuthenticationScreen()
        }
        
        navigationController.pushViewController(welcomeVC, animated: false)
    }
    
    // Additional flow methods...
}
```

### 2.3 Optimization Strategies

- **Progressive Loading:** Load assessment questions dynamically to reduce initial load time
- **Offline Support:** Cache onboarding flow to allow completion without constant connectivity
- **State Preservation:** Save progress at each step to prevent data loss if app is terminated
- **Reduced Friction:**
  - SSO options (Apple, Google) for one-tap account creation
  - Optional fields clearly marked
  - Progress indicator showing completion percentage
  - Ability to skip certain steps and complete later

### 2.4 Metrics & Analytics

- Onboarding completion rate
- Time spent on each screen
- Drop-off points
- Feature adoption post-onboarding

## 3. Biometric Authentication Implementation

### 3.1 Architecture & Components

- **Key Components:**
  - `BiometricAuthService`: Wrapper around LocalAuthentication framework
  - `AuthenticationCoordinator`: Manages auth flows including biometric setup
  - `BiometricSettingsViewController`: UI for enabling/managing biometrics
  - `SecureEnclave`: Wrapper for storing sensitive keys in the Secure Enclave

### 3.2 Technical Implementation

```swift
// BiometricAuthService.swift
import LocalAuthentication

enum BiometricType {
    case none
    case touchID
    case faceID
    
    var displayName: String {
        switch self {
        case .none: return "None"
        case .touchID: return "Touch ID"
        case .faceID: return "Face ID"
        }
    }
}

final class BiometricAuthService {
    private let keychainService: KeychainServiceProtocol
    
    init(keychainService: KeychainServiceProtocol) {
        self.keychainService = keychainService
    }
    
    func availableBiometricType() -> BiometricType {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return .none
        }
        
        if #available(iOS 11.0, *) {
            switch context.biometryType {
            case .touchID:
                return .touchID
            case .faceID:
                return .faceID
            case .none:
                return .none
            @unknown default:
                return .none
            }
        } else {
            return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil) ? .touchID : .none
        }
    }
    
    func authenticateWithBiometrics(reason: String, completion: @escaping (Result<Bool, Error>) -> Void) {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, error in
                DispatchQueue.main.async {
                    if let error = error {
                        completion(.failure(error))
                    } else {
                        completion(.success(success))
                    }
                }
            }
        } else {
            if let error = error {
                completion(.failure(error))
            } else {
                completion(.failure(NSError(domain: "com.mindlyf.biometricauth", code: -1, userInfo: [NSLocalizedDescriptionKey: "Biometric authentication not available"])))  
            }
        }
    }
    
    // Additional methods for managing biometric settings
}
```

### 3.3 Security Considerations

- **Jailbreak Detection:** Implement checks to detect compromised devices
- **Secure Storage:** Use Keychain with access control for storing authentication tokens
- **Fallback Mechanism:** Provide password option when biometrics fail or are unavailable
- **Session Management:** Auto-lock app after configurable period of inactivity
- **Biometric Key Attestation:** Verify biometric enrollment changes

### 3.4 User Experience

- Optional setup during onboarding with clear security benefits explained
- Graceful fallback to password authentication
- Clear error messages for biometric failures
- Settings to enable/disable and manage biometric authentication

## 4. Mobile Notification System with Actionable Buttons

### 4.1 Architecture & Components

- **Key Components:**
  - `NotificationService`: Central service for managing notifications
  - `NotificationHandler`: Protocol for handling different notification types
  - `NotificationActionHandler`: Processes user interactions with notifications
  - `NotificationCategoryFactory`: Creates UNNotificationCategory objects with actions
  - `NotificationPermissionManager`: Handles permission requests and status

### 4.2 Technical Implementation

```swift
// NotificationService.swift
import UserNotifications
import UIKit

final class NotificationService: NSObject {
    private let notificationCenter = UNUserNotificationCenter.current()
    private var handlers: [String: NotificationHandler] = [:]
    
    override init() {
        super.init()
        notificationCenter.delegate = self
        registerNotificationCategories()
    }
    
    func registerForPushNotifications(completion: @escaping (Bool) -> Void) {
        notificationCenter.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            completion(granted)
        }
    }
    
    func registerHandler(_ handler: NotificationHandler, for type: String) {
        handlers[type] = handler
    }
    
    private func registerNotificationCategories() {
        // Register therapy session category with actions
        let therapyCategory = NotificationCategoryFactory.createTherapySessionCategory()
        
        // Register streak category with actions
        let streakCategory = NotificationCategoryFactory.createStreakCategory()
        
        // Register achievement category with actions
        let achievementCategory = NotificationCategoryFactory.createAchievementCategory()
        
        notificationCenter.setNotificationCategories([therapyCategory, streakCategory, achievementCategory])
    }
    
    func scheduleLocalNotification(title: String, body: String, categoryIdentifier: String, userInfo: [AnyHashable: Any], trigger: UNNotificationTrigger?) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.categoryIdentifier = categoryIdentifier
        content.userInfo = userInfo
        content.sound = .default
        
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )
        
        notificationCenter.add(request) { error in
            if let error = error {
                print("Error scheduling notification: \(error)")
            }
        }
    }
}

extension NotificationService: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        let categoryIdentifier = response.notification.request.content.categoryIdentifier
        
        if let notificationType = userInfo["type"] as? String, let handler = handlers[notificationType] {
            handler.handleNotificationResponse(response, userInfo: userInfo)
        } else if let handler = handlers[categoryIdentifier] {
            handler.handleNotificationResponse(response, userInfo: userInfo)
        }
        
        completionHandler()
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }
}
```

```swift
// NotificationCategoryFactory.swift
import UserNotifications

struct NotificationCategoryFactory {
    static func createTherapySessionCategory() -> UNNotificationCategory {
        let joinAction = UNNotificationAction(
            identifier: "JOIN_SESSION",
            title: "Join Now",
            options: [.foreground]
        )
        
        let rescheduleAction = UNNotificationAction(
            identifier: "RESCHEDULE",
            title: "Reschedule",
            options: [.foreground]
        )
        
        return UNNotificationCategory(
            identifier: "THERAPY_SESSION",
            actions: [joinAction, rescheduleAction],
            intentIdentifiers: [],
            options: []
        )
    }
    
    static func createStreakCategory() -> UNNotificationCategory {
        let completeAction = UNNotificationAction(
            identifier: "COMPLETE_ACTIVITY",
            title: "Complete Now",
            options: [.foreground]
        )
        
        let remindAction = UNNotificationAction(
            identifier: "REMIND_LATER",
            title: "Remind Later",
            options: []
        )
        
        return UNNotificationCategory(
            identifier: "STREAK_REMINDER",
            actions: [completeAction, remindAction],
            intentIdentifiers: [],
            options: []
        )
    }
    
    static func createAchievementCategory() -> UNNotificationCategory {
        let viewAction = UNNotificationAction(
            identifier: "VIEW_ACHIEVEMENT",
            title: "View Details",
            options: [.foreground]
        )
        
        let shareAction = UNNotificationAction(
            identifier: "SHARE_ACHIEVEMENT",
            title: "Share",
            options: [.foreground]
        )
        
        return UNNotificationCategory(
            identifier: "ACHIEVEMENT",
            actions: [viewAction, shareAction],
            intentIdentifiers: [],
            options: []
        )
    }
}
```

### 4.3 Notification Types & Actions

| Notification Type | Actions | Description |
|-------------------|---------|-------------|
| Therapy Session | Join Now, Reschedule | Upcoming therapy session reminders |
| Streak Reminder | Complete Now, Remind Later | Daily activity reminders to maintain streaks |
| Achievement | View Details, Share | Notifications for earned badges/achievements |
| Wellness Check-in | Check-in Now, Dismiss | Scheduled wellness check-in prompts |
| Resource Recommendation | View Now, Save for Later | Personalized content recommendations |

### 4.4 Integration with Preference Center

- Respect user notification preferences from the Preference Center
- Implement category-based opt-in/out
- Support time-based Do Not Disturb settings
- Provide granular control over notification types

## 5. Seamless Therapy Session Experiences

### 5.1 Architecture & Components

- **Key Components:**
  - `VideoSessionManager`: Manages video session lifecycle
  - `NetworkQualityMonitor`: Monitors and adapts to network conditions
  - `SessionViewController`: UI for therapy sessions
  - `ChatOverlayView`: Text chat during sessions
  - `ResourceSharingManager`: Enables sharing resources during sessions
  - `SessionRecordingManager`: Optional recording functionality (with consent)

### 5.2 Technical Implementation

```swift
// VideoSessionManager.swift
import WebRTC

final class VideoSessionManager {
    private let signalClient: SignalClientProtocol
    private let peerConnectionFactory: RTCPeerConnectionFactory
    private var peerConnection: RTCPeerConnection?
    private var localVideoTrack: RTCVideoTrack?
    private var remoteVideoTrack: RTCVideoTrack?
    
    weak var delegate: VideoSessionManagerDelegate?
    
    private let networkQualityMonitor = NetworkQualityMonitor()
    
    init(signalClient: SignalClientProtocol) {
        self.signalClient = signalClient
        
        // Initialize WebRTC
        RTCInitializeSSL()
        let videoEncoderFactory = RTCDefaultVideoEncoderFactory()
        let videoDecoderFactory = RTCDefaultVideoDecoderFactory()
        self.peerConnectionFactory = RTCPeerConnectionFactory(encoderFactory: videoEncoderFactory, decoderFactory: videoDecoderFactory)
        
        setupSignalClientHandlers()
        setupNetworkQualityMonitoring()
    }
    
    func startSession(sessionId: String) {
        // Create peer connection
        let config = RTCConfiguration()
        config.iceServers = [RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"])]
        
        let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: ["DtlsSrtpKeyAgreement":"true"])
        peerConnection = peerConnectionFactory.peerConnection(with: config, constraints: constraints, delegate: self)
        
        // Add local media tracks
        setupLocalMedia()
        
        // Join the session
        signalClient.joinSession(sessionId: sessionId)
    }
    
    func endSession() {
        peerConnection?.close()
        peerConnection = nil
        localVideoTrack = nil
        remoteVideoTrack = nil
        signalClient.leaveSession()
        RTCCleanupSSL()
    }
    
    private func setupLocalMedia() {
        // Create audio and video tracks
        let audioConstrains = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
        let audioSource = peerConnectionFactory.audioSource(with: audioConstrains)
        let audioTrack = peerConnectionFactory.audioTrack(with: audioSource, trackId: "ARDAMSa0")
        
        let videoConstrains = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
        let videoSource = peerConnectionFactory.videoSource()
        
        #if TARGET_OS_SIMULATOR
        // Use a dummy video source for simulator
        let capturer = RTCFileVideoCapturer(delegate: videoSource)
        #else
        // Use camera for real device
        let capturer = RTCCameraVideoCapturer(delegate: videoSource)
        setupCapturer(capturer)
        #endif
        
        localVideoTrack = peerConnectionFactory.videoTrack(with: videoSource, trackId: "ARDAMSv0")
        
        // Add tracks to peer connection
        peerConnection?.add(audioTrack, streamIds: ["ARDAMS"])
        peerConnection?.add(localVideoTrack!, streamIds: ["ARDAMS"])
        
        delegate?.videoSessionManager(self, didSetupLocalVideo: localVideoTrack!)
    }
    
    private func setupCapturer(_ capturer: RTCCameraVideoCapturer) {
        let devices = RTCCameraVideoCapturer.captureDevices()
        let frontCamera = devices.first(where: { $0.position == .front })
        
        if let frontCamera = frontCamera {
            let formats = RTCCameraVideoCapturer.supportedFormats(for: frontCamera)
            let format = formats.sorted { (f1, f2) -> Bool in
                let width1 = CMVideoFormatDescriptionGetDimensions(f1.formatDescription).width
                let width2 = CMVideoFormatDescriptionGetDimensions(f2.formatDescription).width
                return width1 > width2
            }.first
            
            if let format = format {
                let fps = format.videoSupportedFrameRateRanges.first?.maxFrameRate ?? 30
                capturer.startCapture(with: frontCamera, format: format, fps: Int(fps))
            }
        }
    }
    
    private func setupSignalClientHandlers() {
        signalClient.onOffer = { [weak self] sdp in
            guard let self = self else { return }
            let rtcSessionDescription = RTCSessionDescription(type: .offer, sdp: sdp)
            self.peerConnection?.setRemoteDescription(rtcSessionDescription) { error in
                if let error = error {
                    print("Error setting remote description: \(error)")
                    return
                }
                
                self.peerConnection?.answer(for: RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)) { sdp, error in
                    if let error = error {
                        print("Error creating answer: \(error)")
                        return
                    }
                    
                    if let sdp = sdp {
                        self.peerConnection?.setLocalDescription(sdp) { error in
                            if let error = error {
                                print("Error setting local description: \(error)")
                                return
                            }
                            
                            self.signalClient.sendAnswer(sdp: sdp.sdp)
                        }
                    }
                }
            }
        }
        
        signalClient.onAnswer = { [weak self] sdp in
            guard let self = self else { return }
            let rtcSessionDescription = RTCSessionDescription(type: .answer, sdp: sdp)
            self.peerConnection?.setRemoteDescription(rtcSessionDescription) { error in
                if let error = error {
                    print("Error setting remote description: \(error)")
                }
            }
        }
        
        signalClient.onIceCandidate = { [weak self] candidate in
            guard let self = self else { return }
            let rtcIceCandidate = RTCIceCandidate(sdp: candidate.sdp, sdpMLineIndex: candidate.sdpMLineIndex, sdpMid: candidate.sdpMid)
            self.peerConnection?.add(rtcIceCandidate)
        }
    }
    
    private func setupNetworkQualityMonitoring() {
        networkQualityMonitor.onQualityChange = { [weak self] quality in
            guard let self = self else { return }
            
            switch quality {
            case .poor:
                // Reduce video quality
                self.adjustVideoQuality(isHighQuality: false)
            case .good:
                // Increase video quality if possible
                self.adjustVideoQuality(isHighQuality: true)
            }
            
            self.delegate?.videoSessionManager(self, didUpdateNetworkQuality: quality)
        }
        
        networkQualityMonitor.startMonitoring()
    }
    
    private func adjustVideoQuality(isHighQuality: Bool) {
        // Adjust video parameters based on network quality
        if isHighQuality {
            // Higher resolution and bitrate
        } else {
            // Lower resolution and bitrate
        }
    }
}

extension VideoSessionManager: RTCPeerConnectionDelegate {
    func peerConnection(_ peerConnection: RTCPeerConnection, didAdd stream: RTCMediaStream) {
        if let videoTrack = stream.videoTracks.first {
            remoteVideoTrack = videoTrack
            delegate?.videoSessionManager(self, didSetupRemoteVideo: videoTrack)
        }
    }
    
    // Implement other RTCPeerConnectionDelegate methods
}
```

### 5.3 Optimization Strategies

- **Adaptive Streaming:** Dynamically adjust video quality based on network conditions
- **Background Mode Handling:** Properly handle audio continuation when app enters background
- **Battery Optimization:** Reduce video quality or disable video when battery is low
- **Reconnection Logic:** Automatically attempt to reconnect if connection is lost
- **Offline Mode:** Provide offline resources if session cannot be joined

### 5.4 Security Considerations

- End-to-end encryption for all session content
- Secure signaling and media transmission
- Session access controls and waiting room functionality
- Privacy indicators for camera/microphone usage
- Compliance with healthcare privacy regulations

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Set up project architecture and base components
- Implement biometric authentication
- Create optimized onboarding flow skeleton

### Phase 2: Core Features (Weeks 3-4)
- Complete onboarding flow with AI assessment integration
- Implement notification system foundation
- Build basic video session capabilities

### Phase 3: Enhancement (Weeks 5-6)
- Add actionable notification buttons and handlers
- Implement advanced session features (chat, resource sharing)
- Integrate with Preference Center

### Phase 4: Optimization & Testing (Weeks 7-8)
- Performance optimization for all components
- Comprehensive testing (unit, integration, UI)
- Security audit and penetration testing

## 7. Testing Strategy

### 7.1 Unit Testing

- Test individual components with XCTest
- Mock dependencies for isolated testing
- Achieve >80% code coverage for critical components

### 7.2 Integration Testing

- Test interactions between components
- Verify proper integration with backend services
- Test notification delivery and handling

### 7.3 UI Testing

- Automated UI tests with XCUITest
- Test onboarding flow on various device sizes
- Verify accessibility compliance

### 7.4 Performance Testing

- Measure and optimize app launch time
- Test video session performance under various network conditions
- Monitor battery and memory usage

### 7.5 Security Testing

- Verify biometric authentication implementation
- Test jailbreak detection
- Validate secure storage of sensitive data

## 8. Coordination with Other Teams

- **Backend Team (@Harbi):** API integration, notification delivery, session signaling
- **Android Team (@Karmie):** Ensure feature parity and consistent user experience
- **Frontend Team (@Hussein):** Align mobile and web experiences
- **Security Team (@Andrew):** Review security implementation, especially for biometrics and video sessions
- **Product Team (@Martha):** Validate implementation against user journey requirements

## 9. Success Metrics

- Onboarding completion rate >85%
- Biometric authentication adoption >60%
- Notification engagement rate >40%
- Video session quality rating >4.5/5
- App crash rate <0.5%
- Session connection success rate >98%