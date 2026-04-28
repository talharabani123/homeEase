/**
 * useAlert Hook
 * Easy-to-use hook for showing custom alerts
 * 
 * Usage:
 * const alert = useAlert();
 * alert.show('Success', 'Account created!', 'success');
 * alert.error('Error', 'Something went wrong');
 * alert.confirm('Delete?', 'Are you sure?', onConfirm);
 */

import { useState, useCallback } from 'react';

export const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  });

  const show = useCallback((title, message, type = 'info', buttons = []) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      buttons,
    });
  }, []);

  const hide = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const success = useCallback((title, message, onPress) => {
    show(title, message, 'success', onPress ? [{ text: 'OK', onPress }] : []);
  }, [show]);

  const error = useCallback((title, message, onPress) => {
    show(title, message, 'error', onPress ? [{ text: 'OK', onPress }] : []);
  }, [show]);

  const warning = useCallback((title, message, onPress) => {
    show(title, message, 'warning', onPress ? [{ text: 'OK', onPress }] : []);
  }, [show]);

  const info = useCallback((title, message, onPress) => {
    show(title, message, 'info', onPress ? [{ text: 'OK', onPress }] : []);
  }, [show]);

  const confirm = useCallback((title, message, onConfirm, onCancel) => {
    show(title, message, 'warning', [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Confirm', onPress: onConfirm },
    ]);
  }, [show]);

  return {
    ...alertConfig,
    show,
    hide,
    success,
    error,
    warning,
    info,
    confirm,
  };
};
