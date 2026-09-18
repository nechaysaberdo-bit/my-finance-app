import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from 'react-native';

import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  getAccounts,
  addIncomeToAccount,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  tealSoft: '#DDF7F1',
  green: '#E7F5E8',
  blue: '#E7F2FF',
  purple: '#F1E6F7',
  line: '#E5EAEA',
};

const categories = [
  'Salary',
  'Freelance',
  'Business',
  'Commission',
  'Other',
];

const typeInfo = {
  cash: {
    icon: '💵',
    bg: c.green,
  },
  bank: {
    icon: '🏦',
    bg: c.blue,
  },
  ewallet: {
    icon: '📱',
    bg: c.tealSoft,
  },
  other: {
    icon: '◉',
    bg: c.purple,
  },
};

export default function AddIncome() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [accounts, setAccounts] = useState([]);
  const [step, setStep] = useState(1);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(
    params.accountId ? String(params.accountId) : null
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadAccounts() {
    const data = await getAccounts();
    setAccounts(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const selectedAccount = useMemo(
    () =>
      accounts.find(
        (item) => String(item.id) === String(accountId)
      ),
    [accounts, accountId]
  );

  async function handleSave() {
    try {
      setSaving(true);

      const result = await addIncomeToAccount({
        amount,
        category,
        description,
        accountId,
        notes,
      });

      Alert.alert(
        'Income added ✨',
        `₱${Number(amount).toLocaleString()} was added to ${
          result.account.name
        }.\n\nNew balance: ₱${Number(
          result.account.balance
        ).toLocaleString()}`
      );

      router.replace('/transactions');
    } catch (error) {
      Alert.alert(
        'Could not save',
        error?.message || 'Something went wrong.'
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
        Money came in ✨
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        Let’s record where it came from and where it landed.
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
            How much did you receive?
          </Text>

          <View
            style={{
              backgroundColor: c.tealSoft,
              borderRadius: 24,
              padding: 18,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 34,
                  fontWeight: '800',
                  color: c.ink,
                  marginRight: 4,
                }}
              >
                ₱
              </Text>

              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={{
                  flex: 1,
                  fontSize: 36,
                  fontWeight: '800',
                  color: c.ink,
                }}
              />
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (!amount || Number(amount) <= 0) {
                Alert.alert('Enter a valid amount');
                return;
              }

              setStep(2);
            }}
            style={primaryButton}
          >
            <Text style={primaryText}>Continue</Text>
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
            What kind of income was it?
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 9,
              marginBottom: 18,
            }}
          >
            {categories.map((item) => {
              const selected = category === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 11,
                    borderRadius: 999,
                    backgroundColor: selected
                      ? c.green
                      : c.card,
                    borderWidth: 1,
                    borderColor: selected
                      ? c.teal
                      : c.line,
                  }}
                >
                  <Text
                    style={{
                      color: c.ink,
                      fontWeight: selected ? '800' : '600',
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: c.line,
              padding: 15,
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginBottom: 7,
              }}
            >
              Description
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Example: September salary"
              style={{
                borderWidth: 1,
                borderColor: c.line,
                borderRadius: 14,
                padding: 13,
                color: c.ink,
              }}
            />
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
              style={secondaryButton}
            >
              <Text style={secondaryText}>Back</Text>
            </Pressable>

            <Pressable
              onPress={() => setStep(3)}
              style={[primaryButton, { flex: 2, marginTop: 0 }]}
            >
              <Text style={primaryText}>Continue</Text>
            </Pressable>
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginBottom: 4,
            }}
          >
            Where did the money go?
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            Tap the actual account that received it.
          </Text>

          {accounts.length === 0 ? (
            <View
              style={{
                backgroundColor: c.card,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: c.line,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontWeight: '800',
                  color: c.ink,
                }}
              >
                No accounts yet
              </Text>

              <Text
                style={{
                  color: c.muted,
                  marginTop: 5,
                }}
              >
                Add a Cash, Bank or E-Wallet account first.
              </Text>

              <Pressable
                onPress={() => router.push('/add-account')}
                style={primaryButton}
              >
                <Text style={primaryText}>Add account</Text>
              </Pressable>
            </View>
          ) : (
            accounts.map((account) => {
              const selected =
                String(account.id) === String(accountId);

              const info =
                typeInfo[account.type] || typeInfo.other;

              return (
                <Pressable
                  key={account.id}
                  onPress={() =>
                    setAccountId(String(account.id))
                  }
                  style={{
                    backgroundColor: selected
                      ? info.bg
                      : c.card,
                    borderRadius: 20,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: selected
                      ? c.teal
                      : c.line,
                    marginBottom: 9,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: info.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>
                      {info.icon}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '800',
                        color: c.ink,
                      }}
                    >
                      {account.name}
                    </Text>

                    <Text
                      style={{
                        color: c.muted,
                        fontSize: 12,
                        marginTop: 3,
                      }}
                    >
                      Current balance
                    </Text>
                  </View>

                  <View
                    style={{
                      alignItems: 'flex-end',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '800',
                        color: c.ink,
                      }}
                    >
                      ₱
                      {Number(
                        account.balance || 0
                      ).toLocaleString()}
                    </Text>

                    {selected && (
                      <Text
                        style={{
                          color: c.teal,
                          fontWeight: '800',
                          marginTop: 3,
                        }}
                      >
                        ✓ Selected
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })
          )}

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginTop: 10,
            }}
          >
            <Pressable
              onPress={() => setStep(2)}
              style={secondaryButton}
            >
              <Text style={secondaryText}>Back</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!accountId) {
                  Alert.alert('Choose an account');
                  return;
                }

                setStep(4);
              }}
              style={[primaryButton, { flex: 2, marginTop: 0 }]}
            >
              <Text style={primaryText}>Review</Text>
            </Pressable>
          </View>
        </>
      )}

      {step === 4 && (
        <>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginBottom: 12,
            }}
          >
            Looks right?
          </Text>

          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: c.line,
              padding: 18,
            }}
          >
            <Text
              style={{
                color: c.muted,
                textAlign: 'center',
                fontSize: 12,
              }}
            >
              Income
            </Text>

            <Text
              style={{
                textAlign: 'center',
                fontSize: 34,
                fontWeight: '800',
                color: c.ink,
                marginTop: 4,
              }}
            >
              +₱{Number(amount || 0).toLocaleString()}
            </Text>

            <View
              style={{
                marginTop: 18,
                borderTopWidth: 1,
                borderTopColor: c.line,
                paddingTop: 14,
                gap: 10,
              }}
            >
              <View style={reviewRow}>
                <Text style={reviewLabel}>Category</Text>
                <Text style={reviewValue}>{category}</Text>
              </View>

              <View style={reviewRow}>
                <Text style={reviewLabel}>Received in</Text>
                <Text style={reviewValue}>
                  {selectedAccount?.name}
                </Text>
              </View>

              <View style={reviewRow}>
                <Text style={reviewLabel}>Balance after</Text>
                <Text style={reviewValue}>
                  ₱
                  {(
                    Number(selectedAccount?.balance || 0) +
                    Number(amount || 0)
                  ).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: c.line,
              padding: 15,
              marginTop: 12,
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginBottom: 7,
              }}
            >
              Note
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional"
              multiline
              style={{
                minHeight: 70,
                borderWidth: 1,
                borderColor: c.line,
                borderRadius: 14,
                padding: 13,
                color: c.ink,
                textAlignVertical: 'top',
              }}
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={primaryButton}
          >
            <Text style={primaryText}>
              {saving ? 'Saving...' : 'Add income'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStep(3)}
            style={[secondaryButton, { width: '100%' }]}
          >
            <Text style={secondaryText}>Change account</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const primaryButton = {
  flex: 1,
  minHeight: 54,
  borderRadius: 18,
  backgroundColor: '#22BDA5',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 16,
};

const primaryText = {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '800',
};

const secondaryButton = {
  flex: 1,
  minHeight: 54,
  borderRadius: 18,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  alignItems: 'center',
  justifyContent: 'center',
};

const secondaryText = {
  color: '#45484A',
  fontWeight: '800',
};

const reviewRow = {
  flexDirection: 'row',
  justifyContent: 'space-between',
};

const reviewLabel = {
  color: '#92999B',
  fontSize: 13,
};

const reviewValue = {
  color: '#45484A',
  fontSize: 13,
  fontWeight: '800',
};