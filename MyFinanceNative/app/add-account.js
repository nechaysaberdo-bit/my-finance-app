import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from 'react-native';

import { useRouter } from 'expo-router';
import { addAccount } from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#4B4B4B',
  muted: '#8D8D8D',
  teal: '#25BFA6',
  green: '#E7F5E8',
  blue: '#E7F2FF',
  aqua: '#DDF7F1',
  purple: '#F1E6F7',
  line: '#E5E9EA',
};

const accountTypes = [
  {
    id: 'cash',
    label: 'Cash',
    emoji: '💵',
    description: 'Wallet or physical cash',
    color: c.green,
  },
  {
    id: 'bank',
    label: 'Bank',
    emoji: '🏦',
    description: 'Savings or checking account',
    color: c.blue,
  },
  {
    id: 'ewallet',
    label: 'E-Wallet',
    emoji: '📱',
    description: 'GCash, Maya and similar',
    color: c.aqua,
  },
  {
    id: 'other',
    label: 'Other',
    emoji: '◉',
    description: 'Wise, PayPal or custom',
    color: c.purple,
  },
];

export default function AddAccount() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [type, setType] = useState(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [included, setIncluded] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!type) {
      Alert.alert(
        'Choose an account type',
        'Select where this money is kept.'
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert(
        'Account name required',
        'Give this account a name.'
      );
      return;
    }

    try {
      setSaving(true);

      await addAccount({
        type,
        name: name.trim(),
        balance: Number(balance || 0),
        currency: 'PHP',
        includedInAvailable: included,
      });

      Alert.alert(
        'Account added 🎉',
        `${name} is now part of My Accounts.`
      );

      router.replace('/accounts');
    } catch (error) {
      Alert.alert(
        'Could not save',
        'Something went wrong while saving this account.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: c.bg,
      }}
      contentContainerStyle={{
        padding: 18,
        paddingBottom: 110,
        maxWidth: 680,
        width: '100%',
        alignSelf: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 29,
          fontWeight: '800',
          color: c.ink,
        }}
      >
        Add account
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        Tell me where you keep this money.
      </Text>

      {step === 1 && (
        <>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginBottom: 12,
            }}
          >
            What kind of account is it?
          </Text>

          {accountTypes.map((item) => {
            const selected = type === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => setType(item.id)}
                style={{
                  backgroundColor: selected
                    ? item.color
                    : c.card,
                  borderRadius: 20,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: selected
                    ? c.teal
                    : c.line,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 16,
                    backgroundColor: item.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 13,
                  }}
                >
                  <Text style={{ fontSize: 23 }}>
                    {item.emoji}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '800',
                      color: c.ink,
                    }}
                  >
                    {item.label}
                  </Text>

                  <Text
                    style={{
                      color: c.muted,
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    {item.description}
                  </Text>
                </View>

                {selected && (
                  <Text
                    style={{
                      fontSize: 20,
                      color: c.teal,
                    }}
                  >
                    ✓
                  </Text>
                )}
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => {
              if (!type) {
                Alert.alert(
                  'Choose one first',
                  'Select Cash, Bank, E-Wallet or Other.'
                );
                return;
              }

              setStep(2);
            }}
            style={{
              backgroundColor: c.teal,
              minHeight: 54,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: 16,
              }}
            >
              Continue
            </Text>
          </Pressable>
        </>
      )}

      {step === 2 && (
        <>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginBottom: 12,
            }}
          >
            Name this account
          </Text>

          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 22,
              padding: 16,
              borderWidth: 1,
              borderColor: c.line,
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 13,
                marginBottom: 7,
              }}
            >
              Account name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={
                type === 'cash'
                  ? 'Example: Wallet'
                  : type === 'bank'
                  ? 'Example: BPI Savings'
                  : type === 'ewallet'
                  ? 'Example: GCash'
                  : 'Example: Wise'
              }
              style={{
                borderWidth: 1,
                borderColor: c.line,
                borderRadius: 14,
                padding: 14,
                fontSize: 16,
                color: c.ink,
                marginBottom: 18,
              }}
            />

            <Text
              style={{
                color: c.muted,
                fontSize: 13,
                marginBottom: 7,
              }}
            >
              Current balance
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F8FAFA',
                borderRadius: 16,
                paddingHorizontal: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: '800',
                  color: c.ink,
                  marginRight: 5,
                }}
              >
                ₱
              </Text>

              <TextInput
                value={balance}
                onChangeText={setBalance}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={{
                  flex: 1,
                  fontSize: 28,
                  fontWeight: '800',
                  color: c.ink,
                  paddingVertical: 15,
                }}
              />
            </View>
          </View>

          <View
            style={{
              marginTop: 14,
              backgroundColor: c.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: c.line,
              padding: 15,
            }}
          >
            <Pressable
              onPress={() =>
                setIncluded(!included)
              }
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '800',
                    color: c.ink,
                  }}
                >
                  Count toward Safe to Enjoy
                </Text>

                <Text
                  style={{
                    color: c.muted,
                    fontSize: 12,
                    marginTop: 3,
                    paddingRight: 20,
                  }}
                >
                  Turn this off for money you don't want treated as spendable.
                </Text>
              </View>

              <View
                style={{
                  width: 50,
                  height: 29,
                  borderRadius: 99,
                  padding: 3,
                  backgroundColor: included
                    ? c.teal
                    : '#D8DEDF',
                  justifyContent: 'center',
                  alignItems: included
                    ? 'flex-end'
                    : 'flex-start',
                }}
              >
                <View
                  style={{
                    width: 23,
                    height: 23,
                    borderRadius: 99,
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </View>
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginTop: 18,
            }}
          >
            <Pressable
              onPress={() => setStep(1)}
              style={{
                flex: 1,
                minHeight: 52,
                borderRadius: 17,
                borderWidth: 1,
                borderColor: c.line,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: c.card,
              }}
            >
              <Text
                style={{
                  color: c.ink,
                  fontWeight: '800',
                }}
              >
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={{
                flex: 2,
                minHeight: 52,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: c.teal,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '800',
                }}
              >
                {saving
                  ? 'Saving...'
                  : 'Create account'}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}