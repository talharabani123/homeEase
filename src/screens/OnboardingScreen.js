import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Find Trusted Home Services',
    description: 'Say goodbye to stress! Instantly connect with trusted professionals for cleaning, repairs',
  },
  {
    id: 2,
    title: 'Book Services Instantly',
    description: 'Choose from verified professionals and get help within minutes',
  },
  {
    id: 3,
    title: 'Track in Real-Time',
    description: 'Monitor your service provider arrival and stay updated throughout',
  },
];

// Logo Component
const Logo = () => (
  <View style={styles.logoContainer}>
    <Svg width="32" height="32" viewBox="0 0 32 32">
      <Circle cx="12" cy="16" r="10" fill={COLORS.textBlack} opacity="0.9" />
      <Circle cx="20" cy="16" r="10" fill={COLORS.textBlack} opacity="0.9" />
    </Svg>
    <Text style={styles.logoText}>HomeEase</Text>
  </View>
);

// Isometric Illustration Component
const IsometricIllustration = () => (
  <View style={styles.illustrationContainer}>
    {/* Desk */}
    <View style={styles.desk}>
      <View style={styles.deskTop} />
      <View style={styles.deskLeg1} />
      <View style={styles.deskLeg2} />
    </View>
    
    {/* Laptop */}
    <View style={styles.laptop}>
      <View style={styles.laptopScreen} />
      <View style={styles.laptopBase} />
    </View>
    
    {/* People */}
    <View style={styles.person1}>
      <View style={styles.personHead} />
      <View style={styles.personBody1} />
    </View>
    
    <View style={styles.person2}>
      <View style={styles.personHead} />
      <View style={styles.personBody2} />
    </View>
    
    {/* Plant */}
    <View style={styles.plant}>
      <View style={styles.plantPot} />
      <Text style={styles.plantLeaves}>🌿</Text>
    </View>
    
    {/* Lamp */}
    <View style={styles.lamp}>
      <View style={styles.lampShade} />
      <View style={styles.lampStand} />
    </View>
  </View>
);

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: width * nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const curvePathData = `M 0 0 Q ${width / 2} 80 ${width} 0 L ${width} 80 L 0 80 Z`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.primaryGreen} />
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingData.map((item) => (
          <View key={item.id} style={styles.slide}>
            {/* Header Section with Curved Bottom - 45% */}
            <View style={styles.headerSection}>
              <Logo />
              <IsometricIllustration />
              
              {/* Curved Bottom */}
              <Svg
                height="80"
                width={width}
                style={styles.curvedBottom}
                viewBox={`0 0 ${width} 80`}
              >
                <Path
                  d={curvePathData}
                  fill={COLORS.white}
                />
              </Svg>
            </View>

            {/* Content Section - 55% */}
            <View style={styles.contentSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              
              {/* Progress Indicators */}
              <View style={styles.progressContainer}>
                {onboardingData.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      currentIndex === index ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Circular Button with Progress Ring */}
      <TouchableOpacity onPress={handleNext} style={styles.buttonContainer}>
        <Svg width="80" height="80" style={styles.progressRing}>
          <Circle
            cx="40"
            cy="40"
            r="36"
            stroke={COLORS.buttonRing}
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${(currentIndex + 1) * (226 / onboardingData.length)} 226`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
        </Svg>
        <View style={styles.nextButton}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  slide: {
    width: width,
    height: height,
  },
  
  // Header Section (45%)
  headerSection: {
    height: height * 0.45,
    backgroundColor: COLORS.primaryGreen,
    paddingTop: 60,
    alignItems: 'center',
    position: 'relative',
  },
  
  // Logo
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: TYPOGRAPHY.logoSize,
    fontWeight: TYPOGRAPHY.logoWeight,
    color: COLORS.textBlack,
    marginLeft: 8,
  },
  
  // Illustration
  illustrationContainer: {
    width: 280,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  desk: {
    position: 'absolute',
    bottom: 40,
  },
  deskTop: {
    width: 160,
    height: 80,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 8,
    transform: [{ perspective: 400 }, { rotateX: '60deg' }],
  },
  deskLeg1: {
    position: 'absolute',
    width: 8,
    height: 40,
    backgroundColor: '#6bb8d9',
    left: 20,
    top: 60,
  },
  deskLeg2: {
    position: 'absolute',
    width: 8,
    height: 40,
    backgroundColor: '#6bb8d9',
    right: 20,
    top: 60,
  },
  laptop: {
    position: 'absolute',
    bottom: 80,
    left: 100,
  },
  laptopScreen: {
    width: 50,
    height: 35,
    backgroundColor: '#4a4a4a',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#333',
  },
  laptopBase: {
    width: 60,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    marginTop: -2,
  },
  person1: {
    position: 'absolute',
    bottom: 100,
    left: 60,
  },
  person2: {
    position: 'absolute',
    bottom: 100,
    right: 60,
  },
  personHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f4c2a8',
    marginBottom: 4,
  },
  personBody1: {
    width: 32,
    height: 40,
    backgroundColor: '#9b7fd4',
    borderRadius: 8,
  },
  personBody2: {
    width: 32,
    height: 40,
    backgroundColor: '#7fb87e',
    borderRadius: 8,
  },
  plant: {
    position: 'absolute',
    bottom: 100,
    left: 20,
  },
  plantPot: {
    width: 20,
    height: 24,
    backgroundColor: '#8cd9f5',
    borderRadius: 4,
  },
  plantLeaves: {
    fontSize: 20,
    position: 'absolute',
    top: -10,
    left: 0,
  },
  lamp: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
  lampShade: {
    width: 24,
    height: 16,
    backgroundColor: '#8cd9f5',
    borderRadius: 12,
  },
  lampStand: {
    width: 4,
    height: 60,
    backgroundColor: '#6bb8d9',
    marginLeft: 10,
  },
  
  // Curved Bottom
  curvedBottom: {
    position: 'absolute',
    bottom: -1,
    left: 0,
  },
  
  // Content Section (55%)
  contentSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.mainHeading,
    fontWeight: TYPOGRAPHY.headerWeight,
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: TYPOGRAPHY.headingLineHeight,
  },
  description: {
    fontSize: TYPOGRAPHY.subHeading,
    fontWeight: TYPOGRAPHY.bodyWeight,
    color: COLORS.textGrey,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.bodyLineHeight,
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  
  // Progress Indicators
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 32,
    backgroundColor: COLORS.primaryGreen,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.progressGrey,
  },
  
  // Button
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.buttonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  arrowText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
