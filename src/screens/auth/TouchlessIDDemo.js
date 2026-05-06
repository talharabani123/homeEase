import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Vibration,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Rect, Defs, Mask } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const TouchlessIDDemo = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [scanState, setScanState] = useState('idle'); // idle, scanning, success, error
  const [distanceStatus, setDistanceStatus] = useState('perfect'); // too_far, too_close, perfect
  const [handDetected, setHandDetected] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const distanceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startDistanceAnimation();
    simulateHandDetection();
  }, []);

  const startDistanceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(distanceAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(distanceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const simulateHandDetection = () => {
    const interval = setInterval(() => {
      const distances = ['too_far', 'too_close', 'perfect'];
      const randomDistance = distances[Math.floor(Math.random() * distances.length)];
      setDistanceStatus(randomDistance);
      setHandDetected(Math.random() > 0.4);
    }, 2000);

    return () => clearInterval(interval);
  };

  const capturePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required for Touchless ID.');
      return;
    }

    setScanState('scanning');
    Vibration.vibrate(50);
    
    try {
      // Start scanning animation
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }).start();

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        // Simulate processing time
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% success rate
          if (success) {
            showSuccessState();
          } else {
            showErrorState();
          }
        }, 1500);
      } else {
        resetToIdle();
      }
      
    } catch (error) {
      console.error('Error capturing photo:', error);
      showErrorState();
    }
  };

  const showSuccessState = () => {
    setScanState('success');
    Vibration.vibrate([0, 100, 50, 100]);
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      resetToIdle();
    }, 3000);
  };

  const showErrorState = () => {
    setScanState('error');
    Vibration.vibrate([0, 100, 50, 100, 50, 100]);
    
    setTimeout(() => {
      resetToIdle();
    }, 2000);
  };

  const resetToIdle = () => {
    setScanState('idle');
    pulseAnim.setValue(1);
    fadeAnim.setValue(1);
    setHandDetected(false);
    setDistanceStatus('perfect');
  };

  const getDistanceColor = () => {
    switch (distanceStatus) {
      case 'too_far': return colors.error;
      case 'too_close': return '#FFA726';
      case 'perfect': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getDistanceText = () => {
    switch (distanceStatus) {
      case 'too_far': return 'TOO FAR';
      case 'too_close': return 'TOO CLOSE';
      case 'perfect': return 'PERFECT';
      default: return 'POSITION HAND';
    }
  };

  const getStatusText = () => {
    switch (scanState) {
      case 'scanning': return 'Processing capture...';
      case 'success': return 'Capture successful!';
      case 'error': return 'Capture failed. Try again.';
      default: return handDetected ? 'Hand detected - Tap to capture' : 'Tap to open camera';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Touchless ID Demo
        </Text>
        <TouchableOpacity 
          onPress={() => Alert.alert('Demo Mode', 'This is a demo version using image picker. Full camera integration requires a development build.')}
          style={styles.helpButton}
        >
          <Ionicons 
            name="information-circle-outline" 
            size={24} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Mock Camera View */}
      <View style={[styles.cameraContainer, { backgroundColor: colors.backgroundSecondary }]}>
        {/* Distance Meter */}
        <View style={styles.distanceMeter}>
          <View style={[styles.distanceIndicator, { backgroundColor: colors.card }]}>
            <Animated.View
              style={[
                styles.distanceBar,
                {
                  backgroundColor: getDistanceColor(),
                  transform: [{ scaleY: distanceAnim }],
                },
              ]}
            />
            <Text style={[styles.distanceText, { color: getDistanceColor() }]}>
              {getDistanceText()}
            </Text>
          </View>
        </View>

        {/* Hand Positioning Overlay */}
        <View style={styles.overlay}>
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <Mask id="handMask">
                <Rect width="100%" height="100%" fill="white" />
                {/* Hand cutout area */}
                <Rect
                  x={width * 0.2}
                  y={height * 0.35}
                  width={width * 0.6}
                  height={height * 0.3}
                  rx={20}
                  fill="black"
                />
              </Mask>
            </Defs>
            
            {/* Semi-transparent overlay */}
            <Rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.6)"
              mask="url(#handMask)"
            />
            
            {/* Hand frame border */}
            <Rect
              x={width * 0.2}
              y={height * 0.35}
              width={width * 0.6}
              height={width * 0.3}
              rx={20}
              fill="none"
              stroke={handDetected ? colors.success : colors.primary}
              strokeWidth={3}
              strokeDasharray={handDetected ? "0" : "10,5"}
            />
            
            {/* Corner indicators */}
            <Path
              d={`M ${width * 0.2 + 10} ${height * 0.35} L ${width * 0.2} ${height * 0.35} L ${width * 0.2} ${height * 0.35 + 10}`}
              stroke={handDetected ? colors.success : colors.primary}
              strokeWidth={4}
              fill="none"
            />
            <Path
              d={`M ${width * 0.8 - 10} ${height * 0.35} L ${width * 0.8} ${height * 0.35} L ${width * 0.8} ${height * 0.35 + 10}`}
              stroke={handDetected ? colors.success : colors.primary}
              strokeWidth={4}
              fill="none"
            />
            <Path
              d={`M ${width * 0.2 + 10} ${height * 0.65} L ${width * 0.2} ${height * 0.65} L ${width * 0.2} ${height * 0.65 - 10}`}
              stroke={handDetected ? colors.success : colors.primary}
              strokeWidth={4}
              fill="none"
            />
            <Path
              d={`M ${width * 0.8 - 10} ${height * 0.65} L ${width * 0.8} ${height * 0.65} L ${width * 0.8} ${height * 0.65 - 10}`}
              stroke={handDetected ? colors.success : colors.primary}
              strokeWidth={4}
              fill="none"
            />
          </Svg>

          {/* Hand icon in center */}
          <View style={styles.handIconContainer}>
            <Animated.View
              style={[
                styles.handIcon,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: handDetected ? 0.3 : 0.8,
                },
              ]}
            >
              <Ionicons
                name="hand-left-outline"
                size={80}
                color={handDetected ? colors.success : colors.primary}
              />
            </Animated.View>
          </View>
        </View>

        {/* Demo Notice */}
        <View style={[styles.demoNotice, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <Text style={[styles.demoText, { color: colors.text }]}>
            Demo Mode - Uses image picker instead of live camera
          </Text>
        </View>
      </View>

      {/* Status Bar */}
      <View style={[styles.statusBar, { backgroundColor: colors.card }]}>
        <Animated.View style={[styles.statusContent, { opacity: fadeAnim }]}>
          <View style={styles.statusIcon}>
            {scanState === 'success' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            )}
            {scanState === 'error' && (
              <Ionicons name="close-circle" size={24} color={colors.error} />
            )}
            {scanState === 'scanning' && (
              <Ionicons name="camera" size={24} color={colors.primary} />
            )}
            {scanState === 'idle' && (
              <Ionicons name="hand-left" size={24} color={colors.primary} />
            )}
          </View>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {getStatusText()}
          </Text>
        </Animated.View>
      </View>

      {/* Instructions */}
      <View style={[styles.instructions, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.instructionTitle, { color: colors.text }]}>
          Demo Instructions
        </Text>
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
          • Tap the capture button to open camera{'\n'}
          • Take a photo of your hand{'\n'}
          • Watch the simulated processing{'\n'}
          • Full live camera requires development build
        </Text>
      </View>

      {/* Capture Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.captureButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={capturePhoto}
          disabled={scanState === 'scanning'}
        >
          <Ionicons
            name="camera"
            size={24}
            color="white"
          />
          <Text style={styles.captureButtonText}>
            {scanState === 'scanning' ? 'Processing...' : 'Open Camera'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  helpButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  distanceMeter: {
    position: 'absolute',
    left: 20,
    top: '30%',
    bottom: '30%',
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  distanceIndicator: {
    width: 50,
    height: 120,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  distanceBar: {
    width: 6,
    height: 80,
    borderRadius: 3,
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoNotice: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  demoText: {
    fontSize: 12,
    flex: 1,
  },
  statusBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TouchlessIDDemo;