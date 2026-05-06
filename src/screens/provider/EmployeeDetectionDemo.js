import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import Svg, { Path, Ellipse, Defs, Mask, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { saveDraft } from '../../services/providerRegistrationService';

const { width, height } = Dimensions.get('window');

const EmployeeDetectionDemo = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { registrationData } = route.params;
  
  const [hasPermission, setHasPermission] = useState(null);
  const [detectionState, setDetectionState] = useState('alignment'); // alignment, scanning, success
  const [faceDetected, setFaceDetected] = useState(false);
  
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const meshOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkCameraPermission();
    startPulseAnimation();
    simulateFaceDetection();
  }, [permission]);

  const checkCameraPermission = () => {
    if (permission) {
      setHasPermission(permission.granted);
      if (!permission.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in settings to use Employee Detection.',
          [
            { text: 'Cancel', onPress: () => navigation.goBack() },
            { text: 'Grant Permission', onPress: requestPermission }
          ]
        );
      }
    }
  };

  const simulateFaceDetection = () => {
    // Simulate face detection every 2 seconds
    const interval = setInterval(() => {
      if (detectionState === 'alignment') {
        setFaceDetected(Math.random() > 0.3); // 70% chance of face detection
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const startPulseAnimation = () => {
    // Temporarily disabled to prevent animation conflicts
    pulseAnim.setValue(1); // Keep static for now
  };

  const startScanAnimation = () => {
    setDetectionState('scanning');
    
    // Show face mesh
    Animated.timing(meshOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Scanning progress animation (separate from transform animations)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false, // Required for width interpolation
    }).start();

    // Scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Complete scan after 3 seconds
    setTimeout(() => {
      showSuccessResult();
    }, 3000);
  };

  const showSuccessResult = () => {
    setDetectionState('success');
    
    // Stop all animations properly
    scanLineAnim.stopAnimation();
    progressAnim.stopAnimation();
    
    // Hide mesh
    Animated.timing(meshOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleStartScan = () => {
    if (faceDetected) {
      startScanAnimation();
    } else {
      Alert.alert('Face Not Detected', 'Please position your face within the oval guide.');
    }
  };

  const handleContinue = async () => {
    const data = {
      ...registrationData,
      employeeVerified: true,
      verificationTimestamp: new Date().toISOString(),
      currentStep: 5
    };

    await saveDraft(data);
    navigation.navigate('ProofOfService', { registrationData: data });
  };

  if (hasPermission === null || !permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false || !permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Camera permission denied</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (detectionState === 'success') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
        
        {/* Success Header */}
        <View style={styles.successHeader}>
          <Text style={styles.successHeaderText}>Employee Detection</Text>
        </View>

        {/* Success Card */}
        <View style={styles.successContainer}>
          <View style={[styles.successCard, { backgroundColor: colors.background }]}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Svg width="48" height="48" viewBox="0 0 48 48">
                  <Path
                    d="M20 32L9 21L12.5 17.5L20 25L35.5 9.5L39 13L20 32Z"
                    fill="#10B981"
                  />
                </Svg>
              </View>
              <Text style={[styles.congratsText, { color: colors.text }]}>Congrats!</Text>
              <Text style={[styles.matchText, { color: colors.textSecondary }]}>
                The biometric data of your selfie match with your CNIC picture.
              </Text>
            </View>

            {/* Employee Profile */}
            <View style={styles.profileContainer}>
              <View style={styles.profileImage}>
                <Svg width="80" height="80" viewBox="0 0 80 80">
                  <Ellipse cx="40" cy="40" rx="38" ry="38" fill="#E5E7EB" />
                  <Path
                    d="M40 20C31.16 20 24 27.16 24 36C24 44.84 31.16 52 40 52C48.84 52 56 44.84 56 36C56 27.16 48.84 20 40 20ZM40 28C43.31 28 46 30.69 46 34C46 37.31 43.31 40 40 40C36.69 40 34 37.31 34 34C34 30.69 36.69 28 40 28ZM40 48C34.67 48 29.99 45.33 27.33 41.33C27.99 38.67 33.33 37.33 40 37.33C46.67 37.33 52.01 38.67 52.67 41.33C50.01 45.33 45.33 48 40 48Z"
                    fill="#9CA3AF"
                  />
                </Svg>
              </View>
              <Text style={[styles.employeeName, { color: colors.text }]}>Mr. John Doe</Text>
            </View>

            {/* Employee Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Employee ID</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>Enter</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>ID TRTH436</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>10:00 AM</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>Exit</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Office location, Gulshan 1</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>06:20 PM</Text>
              </View>
            </View>

            {/* Okay Button */}
            <TouchableOpacity
              style={styles.okayButton}
              onPress={handleContinue}
            >
              <Text style={styles.okayButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="front"
      />

      {/* Demo Notice */}
      <View style={styles.demoNotice}>
        <Text style={styles.demoText}>Demo Mode - Simulated face detection</Text>
      </View>

      {/* Overlay */}
      <View style={styles.overlay}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <Mask id="faceMask">
              <Rect width="100%" height="100%" fill="white" />
              {/* Face oval cutout */}
              <Ellipse
                cx={width / 2}
                cy={height * 0.4}
                rx={width * 0.35}
                ry={height * 0.25}
                fill="black"
              />
            </Mask>
          </Defs>
          
          {/* Semi-transparent overlay */}
          <Rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.7)"
            mask="url(#faceMask)"
          />
          
          {/* Face oval border */}
          <Ellipse
            cx={width / 2}
            cy={height * 0.4}
            rx={width * 0.35}
            ry={height * 0.25}
            fill="none"
            stroke={faceDetected ? "#10B981" : "#FFFFFF"}
            strokeWidth={3}
            strokeDasharray={faceDetected ? "0" : "10,5"}
          />
          
          {/* Corner guides */}
          <Path
            d={`M ${width * 0.15 + 20} ${height * 0.15} L ${width * 0.15} ${height * 0.15} L ${width * 0.15} ${height * 0.15 + 20}`}
            stroke="#FFFFFF"
            strokeWidth={4}
            fill="none"
          />
          <Path
            d={`M ${width * 0.85 - 20} ${height * 0.15} L ${width * 0.85} ${height * 0.15} L ${width * 0.85} ${height * 0.15 + 20}`}
            stroke="#FFFFFF"
            strokeWidth={4}
            fill="none"
          />
          <Path
            d={`M ${width * 0.15 + 20} ${height * 0.65} L ${width * 0.15} ${height * 0.65} L ${width * 0.15} ${height * 0.65 - 20}`}
            stroke="#FFFFFF"
            strokeWidth={4}
            fill="none"
          />
          <Path
            d={`M ${width * 0.85 - 20} ${height * 0.65} L ${width * 0.85} ${height * 0.65} L ${width * 0.85} ${height * 0.65 - 20}`}
            stroke="#FFFFFF"
            strokeWidth={4}
            fill="none"
          />
        </Svg>

        {/* Face Mesh Overlay (during scanning) */}
        {detectionState === 'scanning' && (
          <Animated.View
            style={[
              styles.faceMeshContainer,
              {
                opacity: meshOpacity,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Svg width={width * 0.7} height={height * 0.5} viewBox="0 0 200 200">
              {/* Face mesh grid */}
              <Path
                d="M20 60 Q100 40 180 60 Q180 100 160 140 Q100 160 40 140 Q20 100 20 60 Z"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                opacity="0.8"
              />
              {/* Eye areas */}
              <Ellipse cx="70" cy="80" rx="15" ry="10" fill="none" stroke="#10B981" strokeWidth="2" />
              <Ellipse cx="130" cy="80" rx="15" ry="10" fill="none" stroke="#10B981" strokeWidth="2" />
              {/* Nose */}
              <Path d="M100 90 L95 110 L100 115 L105 110 Z" fill="none" stroke="#10B981" strokeWidth="2" />
              {/* Mouth */}
              <Path d="M80 130 Q100 140 120 130" fill="none" stroke="#10B981" strokeWidth="2" />
              {/* Grid lines */}
              <Path d="M50 70 L150 70" stroke="#10B981" strokeWidth="1" opacity="0.6" />
              <Path d="M50 100 L150 100" stroke="#10B981" strokeWidth="1" opacity="0.6" />
              <Path d="M50 130 L150 130" stroke="#10B981" strokeWidth="1" opacity="0.6" />
              <Path d="M70 50 L70 150" stroke="#10B981" strokeWidth="1" opacity="0.6" />
              <Path d="M100 50 L100 150" stroke="#10B981" strokeWidth="1" opacity="0.6" />
              <Path d="M130 50 L130 150" stroke="#10B981" strokeWidth="1" opacity="0.6" />
            </Svg>
          </Animated.View>
        )}

        {/* Scanning Line */}
        {detectionState === 'scanning' && (
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height * 0.15, height * 0.65],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.scanLineGradient} />
          </Animated.View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {detectionState === 'alignment' && (
          <>
            <Text style={styles.instructionText}>
              Position your face within the oval guide
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.startButton,
                  { backgroundColor: faceDetected ? '#6366F1' : '#9CA3AF' }
                ]}
                onPress={handleStartScan}
                disabled={!faceDetected}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        
        {detectionState === 'scanning' && (
          <View style={styles.scanningContainer}>
            <Text style={styles.scanningText}>Scanning...</Text>
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  demoNotice: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  demoText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceMeshContainer: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    position: 'absolute',
    left: width * 0.15,
    right: width * 0.15,
    height: 3,
  },
  scanLineGradient: {
    flex: 1,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scanningContainer: {
    alignItems: 'center',
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  // Success Screen Styles
  successHeader: {
    backgroundColor: '#6366F1',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  successHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  successCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  matchText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    marginBottom: 12,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  okayButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  okayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading/Error States
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmployeeDetectionDemo;