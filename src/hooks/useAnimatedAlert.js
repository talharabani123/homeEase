import { useState } from 'react';

export const useAnimatedAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });

  const showAlert = (title, message, type = 'info', buttons = []) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const showSuccess = (title, message, buttons = []) => {
    showAlert(title, message, 'success', buttons);
  };

  const showError = (title, message, buttons = []) => {
    showAlert(title, message, 'error', buttons);
  };

  const showWarning = (title, message, buttons = []) => {
    showAlert(title, message, 'warning', buttons);
  };

  const showInfo = (title, message, buttons = []) => {
    showAlert(title, message, 'info', buttons);
  };

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};