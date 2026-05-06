import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DocumentGuidelineScreen = ({ 
  documentType, 
  onContinue, 
  onSkip,
  showSkipOption = false 
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for important elements
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const getDocumentConfig = () => {
    switch (documentType) {
      case 'cnic_front':
        return {
          title: 'CNIC Front Side',
          subtitle: 'Take a clear photo of your CNIC front',
          icon: '🆔',
          instructions: [
            {
              icon: '📱',
              title: 'Hold your phone steady',
              description: 'Keep your device stable and at arm\'s length'
            },
            {
              icon: '🔲',
              title: 'Place CNIC within frame',
              description: 'Ensure all corners are visible and within the guide'
            },
            {
              icon: '💡',
              title: 'Good lighting required',
              description: 'Use natural light or bright indoor lighting'
            },
            {
              icon: '📝',
              title: 'All text must be visible',
              description: 'Make sure name, CNIC number, and photo are clear'
            },
            {
              icon: '🚫',
              title: 'Avoid blur and glare',
              description: 'No shadows, reflections, or blurry text'
            }
          ],
          tips: [
            'Clean your CNIC before taking photo',
            'Remove any plastic covers',
            'Take photo on a flat, dark surface'
          ]
        };
      
      case 'cnic_back':
        return {
          title: 'CNIC Back Side',
          subtitle: 'Take a clear photo of your CNIC back',
          icon: '🆔',
          instructions: [
            {
              icon: '🔄',
              title: 'Flip your CNIC over',
              description: 'Show the back side with address details'
            },
            {
              icon: '🔲',
              title: 'Place within frame',
              description: 'Ensure all corners and edges are visible'
            },
            {
              icon: '💡',
              title: 'Good lighting required',
              description: 'Use natural light or bright indoor lighting'
            },
            {
              icon: '📍',
              title: 'Address must be readable',
              description: 'Ensure address text is clear and visible'
            },
            {
              icon: '🚫',
              title: 'Avoid blur and glare',
              description: 'No shadows, reflections, or blurry text'
            }
          ],
          tips: [
            'Make sure address is fully visible',
            'Check for any wear or damage',
            'Use a contrasting background'
          ]
        };

      case 'certificate':
        return {
          title: 'Professional Certificate',
          subtitle: 'Upload your professional qualification certificate',
          icon: '📜',
          instructions: [
            {
              icon: '📋',
              title: 'Original certificate only',
              description: 'Use the original document, not a photocopy'
            },
            {
              icon: '🔲',
              title: 'Full document visible',
              description: 'Capture the entire certificate in frame'
            },
            {
              icon: '💡',
              title: 'Clear and bright lighting',
              description: 'Ensure all text and seals are readable'
            },
            {
              icon: '🏛️',
              title: 'Institution details visible',
              description: 'Make sure issuing authority is clear'
            },
            {
              icon: '📅',
              title: 'Date and signatures clear',
              description: 'Ensure dates and official signatures are visible'
            }
          ],
          tips: [
            'Flatten the certificate completely',
            'Use a scanner app if available',
            'Multiple certificates can be uploaded separately'
          ]
        };

      case 'selfie_with_cnic':
        return {
          title: 'Selfie with CNIC',
          subtitle: 'Take a selfie while holding your CNIC',
          icon: '🤳',
          instructions: [
            {
              icon: '🤳',
              title: 'Hold CNIC next to face',
              description: 'Position CNIC beside your face, not covering it'
            },
            {
              icon: '👤',
              title: 'Face clearly visible',
              description: 'Your entire face should be visible and well-lit'
            },
            {
              icon: '🆔',
              title: 'CNIC photo side visible',
              description: 'Show the front side with your photo'
            },
            {
              icon: '💡',
              title: 'Good lighting on face',
              description: 'Ensure your face is well-lit and clear'
            },
            {
              icon: '🚫',
              title: 'No accessories',
              description: 'Remove sunglasses, masks, or face coverings'
            }
          ],
          tips: [
            'Look directly at the camera',
            'Keep a neutral expression',
            'Make sure both you and CNIC are in focus'
          ]
        };

      default:
        return {
          title: 'Document Upload',
          subtitle: 'Follow these guidelines for best results',
          icon: '📄',
          instructions: [],
          tips: []
        };
    }
  };

  const config = getDocumentConfig();

  const renderDocumentFrame = () => (
    <Animated.View 
      style={[
        styles.documentFrame, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.primary,
          transform: [{ scale: pulseAnim }]
        }
      ]}
    >
      <View style={styles.frameCorners}>
        <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
      </View>
      
      <View style={styles.frameContent}>
        <Text style={[styles.frameIcon, { color: colors.primary }]}>{config.icon}</Text>
        <Text style={[styles.frameText, { color: colors.textSecondary }]}>
          {documentType === 'selfie_with_cnic' ? 'Position here' : 'Place document here'}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.headerIcon}>{config.icon}</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{config.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{config.subtitle}</Text>
        </View>

        {/* Document Frame Visualization */}
        <View style={styles.frameSection}>
          {renderDocumentFrame()}
        </View>

        {/* Instructions */}
        <ScrollView style={styles.instructionsContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Follow these steps:</Text>
          
          {config.instructions.map((instruction, index) => (
            <Animated.View
              key={index}
              style={[
                styles.instructionItem,
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={[styles.instructionIcon, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.instructionEmoji}>{instruction.icon}</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={[styles.instructionTitle, { color: colors.text }]}>
                  {instruction.title}
                </Text>
                <Text style={[styles.instructionDescription, { color: colors.textSecondary }]}>
                  {instruction.description}
                </Text>
              </View>
            </Animated.View>
          ))}

          {/* Tips Section */}
          {config.tips.length > 0 && (
            <View style={[styles.tipsSection, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <View style={styles.tipsHeader}>
                <Svg width="20" height="20" viewBox="0 0 24 24">
                  <Path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={colors.primary}
                  />
                </Svg>
                <Text style={[styles.tipsTitle, { color: colors.text }]}>Pro Tips</Text>
              </View>
              {config.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
                  <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          {showSkipOption && (
            <TouchableOpacity 
              style={[styles.skipButton, { borderColor: colors.border }]} 
              onPress={onSkip}
            >
              <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                Don't show again
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.continueButton, { backgroundColor: colors.primary }]} 
            onPress={onContinue}
          >
            <Text style={styles.continueButtonText}>Continue to Upload</Text>
            <Svg width="20" height="20" viewBox="0 0 24 24" style={{ marginLeft: 8 }}>
              <Path d="M9 6l6 6-6 6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </Svg>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  frameSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  documentFrame: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.45,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  frameCorners: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
  },
  topLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  frameContent: {
    alignItems: 'center',
  },
  frameIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  frameText: {
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  instructionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionEmoji: {
    fontSize: 20,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  tipsSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 20,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 20,
    gap: 12,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DocumentGuidelineScreen;