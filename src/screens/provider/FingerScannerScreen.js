import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import Svg, { Rect, Defs, Mask } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const { width, height } = Dimensions.get('window');

const FingerScannerScreen = ({ navigation, route }) => {
  const { registrationData } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  
  const [status, setStatus] = useState('position'); // position, counting, captured
  const [countdown, setCountdown] = useState(2);
  const [handDetected, setHandDetected] = useState(false);
  
  const distanceValue = useSharedValue(0.5); // 0 (Too Close) to 1 (Too Far), 0.5 is Perfect
  
  // Simulated hand detection for UI demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'position') {
        const isDetected = Math.random() > 0.3;
        setHandDetected(isDetected);
        if (isDetected) {
            // Randomly move distance around perfect spot
            distanceValue.value = withTiming(0.4 + Math.random() * 0.2, { duration: 1000 });
        } else {
            distanceValue.value = withTiming(0.8, { duration: 1000 });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (handDetected && Math.abs(distanceValue.value - 0.5) < 0.1 && status === 'position') {
      startCountdown();
    }
  }, [handDetected, distanceValue.value, status]);

  const startCountdown = () => {
    setStatus('counting');
    let count = 2;
    setCountdown(count);
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        capture();
      }
    }, 1000);
  };

  const capture = () => {
    setStatus('captured');
    // Simulated capture
    setTimeout(() => {
      navigation.navigate('ProofOfService', { 
        registrationData: { 
          ...registrationData, 
          biometricVerified: true,
          biometricTimestamp: new Date().toISOString()
        } 
      });
    }, 1500);
  };

  const arrowStyle = useAnimatedStyle(() => {
    // Meter track height is about 300
    const translateY = interpolate(
      distanceValue.value,
      [0, 1],
      [130, -130], // Adjust based on meter track height
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
          <Text style={styles.permissionText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        active={status !== 'captured'}
      />

      {/* Vision Box Overlay */}
      <View style={styles.overlay}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <Mask id="mask">
              <Rect width="100%" height="100%" fill="white" />
              <Rect
                x={width * 0.15}
                y={height * 0.35}
                width={width * 0.7}
                height={height * 0.3}
                rx={20}
                fill="black"
              />
            </Mask>
          </Defs>
          <Rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.7)"
            mask="url(#mask)"
          />
          {/* Border for the cutout */}
          <Rect
            x={width * 0.15}
            y={height * 0.35}
            width={width * 0.7}
            height={height * 0.3}
            rx={20}
            fill="none"
            stroke={handDetected ? '#4CAF50' : '#FFFFFF'}
            strokeWidth={3}
            strokeDasharray={handDetected ? "0" : "10,5"}
          />
        </Svg>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>4 Fingers TouchlessID</Text>
        <Text style={styles.headerSubTitle}>Place your right hand in the box and stay still</Text>
      </View>

      {/* Distance Meter (Right-Side) */}
      <View style={styles.distanceMeterContainer}>
        <View style={styles.meterTrack}>
          <Text style={styles.meterLabel}>Too Far</Text>
          <View style={styles.meterLineContainer}>
             <View style={styles.meterLine} />
             <View style={[styles.meterLine, { backgroundColor: '#4CAF50', height: 2 }]} />
             <View style={styles.meterLine} />
          </View>
          <Animated.View style={[styles.arrowContainer, arrowStyle]}>
             <View style={styles.arrow} />
          </Animated.View>
          <Text style={styles.meterLabel}>Too Close</Text>
        </View>
      </View>

      {/* Countdown / Status */}
      {status === 'counting' && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {status === 'captured' && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Captured!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
  distanceMeterContainer: {
    position: 'absolute',
    right: 15,
    top: height * 0.3,
    height: 300,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  meterTrack: {
    flex: 1,
    width: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  meterLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  meterLineContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  meterLine: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  arrowContainer: {
    position: 'absolute',
    left: -15,
    top: '50%',
    marginTop: -10,
    zIndex: 20,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#4CAF50',
  },
  countdownContainer: {
    position: 'absolute',
    top: height * 0.45,
    left: width * 0.5,
    marginLeft: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  countdownText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  permissionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  }
});

export default FingerScannerScreen;
