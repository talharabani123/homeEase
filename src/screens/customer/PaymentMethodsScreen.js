import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';

const METHODS = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    subtitle: 'Pay via JazzCash mobile wallet',
    color: '#E65100',
    lightColor: '#FFF3E0',
    icon: () => (
      <Svg width="36" height="36" viewBox="0 0 36 36">
        <Rect x="2" y="8" width="32" height="20" rx="4" fill="#E65100" />
        <Path d="M8 18h6M14 14v8M20 14l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    ),
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    subtitle: 'Pay via EasyPaisa mobile wallet',
    color: '#2E7D32',
    lightColor: '#E8F5E9',
    icon: () => (
      <Svg width="36" height="36" viewBox="0 0 36 36">
        <Rect x="2" y="8" width="32" height="20" rx="4" fill="#2E7D32" />
        <Circle cx="18" cy="18" r="5" fill="none" stroke="#fff" strokeWidth="2" />
        <Path d="M18 13v2M18 21v2M13 18h2M21 18h2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    id: 'cash',
    name: 'Cash',
    subtitle: 'Pay with cash on delivery',
    color: '#795548',
    lightColor: '#EFEBE9',
    icon: () => (
      <Svg width="36" height="36" viewBox="0 0 36 36">
        <Rect x="4" y="10" width="28" height="16" rx="2" fill="#795548" />
        <Text x="18" y="20" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">5000</Text>
        <Path d="M8 14h4M24 14h4M8 22h4M24 22h4" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        <Circle cx="18" cy="18" r="3" fill="none" stroke="#fff" strokeWidth="1.5" />
      </Svg>
    ),
  },
];

const PaymentMethodsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(null);   // currently selected method id
  const [modal, setModal]       = useState(null);   // method shown in modal

  const handleSelect = (method) => {
    setSelected(method.id);
    setModal(method);
  };

  const handleConfirm = () => {
    setModal(null);
  };

  const handleCancel = () => {
    setSelected(null);
    setModal(null);
  };

  return (
    <ScreenWrapper variant="default">
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path d="M15 18L9 12L15 6" stroke={colors.text} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* Body */}
      <View style={styles.body}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select your preferred payment method
        </Text>

        {METHODS.map((method) => {
          const isSelected = selected === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: isSelected ? method.color : colors.border },
                isSelected && { backgroundColor: method.lightColor },
              ]}
              onPress={() => handleSelect(method)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: isSelected ? method.color + '22' : colors.backgroundSecondary }]}>
                {method.icon()}
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
                <Text style={[styles.methodSub, { color: colors.textSecondary }]}>{method.subtitle}</Text>
              </View>
              {/* Radio indicator */}
              <View style={[styles.radio, { borderColor: isSelected ? method.color : colors.border }]}>
                {isSelected && <View style={[styles.radioDot, { backgroundColor: method.color }]} />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Info note */}
        <View style={[styles.infoBox, { backgroundColor: colors.primaryLight, borderColor: COLORS.primaryGreen }]}>
          <Svg width="18" height="18" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill={COLORS.primaryGreen} />
            <Path d="M12 8v4M12 16v.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Your payment details are secure. No card information is stored.
          </Text>
        </View>
      </View>

      {/* ── Themed confirmation modal ── */}
      <Modal
        visible={!!modal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.overlay} onPress={handleCancel}>
          <Pressable style={[styles.modalBox, { backgroundColor: colors.card }]} onPress={() => {}}>
            {/* Colored top strip */}
            {modal && (
              <View style={[styles.modalStrip, { backgroundColor: modal.color }]} />
            )}

            {/* Icon */}
            {modal && (
              <View style={[styles.modalIconWrap, { backgroundColor: modal.lightColor }]}>
                {modal.icon()}
              </View>
            )}

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modal?.name} Selected
            </Text>
            <Text style={[styles.modalMsg, { color: colors.textSecondary }]}>
              {modal?.name} has been set as your payment method.
              You can change this anytime.
            </Text>

            {/* Buttons */}
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: modal?.color || COLORS.primaryGreen }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmBtnText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  body: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  subtitle: { fontSize: 14, marginBottom: 20, lineHeight: 20 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16, borderWidth: 2,
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  cardText: { flex: 1 },
  methodName: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  methodSub:  { fontSize: 13 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  radioDot: { width: 11, height: 11, borderRadius: 6 },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 14, borderRadius: 12, borderWidth: 1,
    marginTop: 8, gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalBox: {
    width: '100%', borderRadius: 20, overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  modalStrip: { width: '100%', height: 6 },
  modalIconWrap: {
    width: 80, height: 80, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 28, marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalMsg: {
    fontSize: 14, textAlign: 'center', lineHeight: 20,
    paddingHorizontal: 20, marginBottom: 28,
  },
  confirmBtn: {
    width: '85%', paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', marginBottom: 10,
  },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelBtn: { paddingVertical: 12, marginBottom: 20 },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
});

export default PaymentMethodsScreen;
