import React, { useState } from 'react';
import OnboardingScreen1 from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';
import OnboardingScreen3 from './OnboardingScreen3';

const OnboardingContainer = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState(1);

  const handleNext = () => {
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleBack = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  switch (currentScreen) {
    case 1:
      return <OnboardingScreen1 navigation={navigation} onNext={handleNext} />;
    case 2:
      return <OnboardingScreen2 navigation={navigation} onNext={handleNext} onBack={handleBack} />;
    case 3:
      return <OnboardingScreen3 navigation={navigation} onBack={handleBack} />;
    default:
      return <OnboardingScreen1 navigation={navigation} onNext={handleNext} />;
  }
};

export default OnboardingContainer;
