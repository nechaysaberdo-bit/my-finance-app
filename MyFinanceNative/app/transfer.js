import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

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
  transferBetweenAccounts,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  tealSoft: '#DDF7F1',
  blue: '#E7F2FF',
  green: '#E7F5E8',
  line: '#E5EAEA',
};

export default function Transfer() {
  const router = useRouter();

  const { fromAccountId } =
    useLocalSearchParams();

  const [accounts, setAccounts] =
    useState([]);

  const [fromId, setFromId] =
    useState(
      fromAccountId
        ? String(fromAccountId)
        : null
    );

  const [toId, setToId] =
    useState(null);

  const [amount, setAmount] =
    useState('');

  const [note, setNote] =
    useState('');

  const [step, setStep] =
    useState(1);

  const [saving, setSaving] =
    useState(false);

  async function loadAccounts() {
    const data = await getAccounts();
    setAccounts(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const fromAccount =
    useMemo(
      () =>
        accounts.find(
          (a) =>
            String(a.id) ===
            String(fromId)
        ),
      [accounts, fromId]
    );

  const toAccount =
    useMemo(
      () =>
        accounts.find(
          (a) =>
            String(a.id) ===
            String(toId)
        ),
      [accounts, toId]
    );

  const otherAccounts =
    accounts.filter(
      (a) =>
        String(a.id) !==
        String(fromId)
    );

  async function saveTransfer() {
    try {
      setSaving(true);

      await transferBetweenAccounts({
        fromAccountId: fromId,
        toAccountId: toId,
        amount,
        note,
      });

      Alert.alert(
        'Transfer complete ✨',
        `₱${Number(
          amount
        ).toLocaleString()} moved from ${
          fromAccount?.name
        } to ${toAccount?.name}.`
      );

      router.replace('/accounts');
    } catch (error) {
      Alert.alert(
        'Could not transfer',
        error?.message ||
          'Something went wrong.'
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
        Move money ⇄
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        Transfer between your own accounts without recording an expense.
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
            Where is the money coming from?
          </Text>

          {accounts.map((account) => {
            const selected =
              String(account.id) ===
              String(fromId);

            return (
              <Pressable
                key={account.id}
                onPress={() =>
                  setFromId(
                    String(account.id)
                  )
                }
                style={{
                  backgroundColor: selected
                    ? c.tealSoft
                    : c.card,
                  borderRadius: 19,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: selected
                    ? c.teal
                    : c.line,
                  marginBottom: 9,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent:
                      'space-between',
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontWeight: '800',
                        color: c.ink,
                        fontSize: 15,
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
                      {account.type}
                    </Text>
                  </View>

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
                </View>
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => {
              if (!fromId) {
                Alert.alert(
                  'Choose an account first'
                );
                return;
              }

              setStep(2);
            }}
            style={primaryButton}
          >
            <Text style={primaryText}>
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
            Where should it go?
          </Text>

          {otherAccounts.map(
            (account) => {
              const selected =
                String(account.id) ===
                String(toId);

              return (
                <Pressable
                  key={account.id}
                  onPress={() =>
                    setToId(
                      String(account.id)
                    )
                  }
                  style={{
                    backgroundColor:
                      selected
                        ? c.blue
                        : c.card,
                    borderRadius: 19,
                    padding: 14,
                    borderWidth: 1,
                    borderColor:
                      selected
                        ? c.teal
                        : c.line,
                    marginBottom: 9,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent:
                        'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '800',
                        color: c.ink,
                      }}
                    >
                      {account.name}
                    </Text>

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
                  </View>
                </Pressable>
              );
            }
          )}

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginTop: 8,
            }}
          >
            <Pressable
              onPress={() =>
                setStep(1)
              }
              style={secondaryButton}
            >
              <Text
                style={{
                  fontWeight: '800',
                  color: c.ink,
                }}
              >
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!toId) {
                  Alert.alert(
                    'Choose where to send it'
                  );
                  return;
                }

                setStep(3);
              }}
              style={[
                primaryButton,
                { flex: 2 },
              ]}
            >
              <Text style={primaryText}>
                Continue
              </Text>
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
              marginBottom: 12,
            }}
          >
            How much?
          </Text>

          <View
            style={{
              backgroundColor: c.tealSoft,
              borderRadius: 24,
              padding: 18,
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 12,
              }}
            >
              {fromAccount?.name}
              {' → '}
              {toAccount?.name}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 7,
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
                keyboardType="decimal-pad"
                placeholder="0.00"
                style={{
                  flex: 1,
                  fontSize: 34,
                  fontWeight: '800',
                  color: c.ink,
                }}
              />
            </View>

            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginTop: 7,
              }}
            >
              Available: ₱
              {Number(
                fromAccount?.balance || 0
              ).toLocaleString()}
            </Text>
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
                marginBottom: 6,
              }}
            >
              Note
            </Text>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional"
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
              onPress={() =>
                setStep(2)
              }
              style={secondaryButton}
            >
              <Text
                style={{
                  fontWeight: '800',
                  color: c.ink,
                }}
              >
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (
                  !amount ||
                  Number(amount) <= 0
                ) {
                  Alert.alert(
                    'Enter an amount'
                  );
                  return;
                }

                setStep(4);
              }}
              style={[
                primaryButton,
                { flex: 2 },
              ]}
            >
              <Text style={primaryText}>
                Review
              </Text>
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
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 13,
                color: c.muted,
              }}
            >
              Moving
            </Text>

            <Text
              style={{
                textAlign: 'center',
                fontSize: 32,
                fontWeight: '800',
                color: c.ink,
                marginTop: 4,
              }}
            >
              ₱
              {Number(
                amount || 0
              ).toLocaleString()}
            </Text>

            <View
              style={{
                marginTop: 18,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent:
                  'space-between',
              }}
            >
              <View>
                <Text
                  style={{
                    color: c.muted,
                    fontSize: 11,
                  }}
                >
                  FROM
                </Text>

                <Text
                  style={{
                    fontWeight: '800',
                    color: c.ink,
                    marginTop: 3,
                  }}
                >
                  {fromAccount?.name}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 24,
                  color: c.teal,
                }}
              >
                →
              </Text>

              <View
                style={{
                  alignItems: 'flex-end',
                }}
              >
                <Text
                  style={{
                    color: c.muted,
                    fontSize: 11,
                  }}
                >
                  TO
                </Text>

                <Text
                  style={{
                    fontWeight: '800',
                    color: c.ink,
                    marginTop: 3,
                  }}
                >
                  {toAccount?.name}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={saveTransfer}
            disabled={saving}
            style={primaryButton}
          >
            <Text style={primaryText}>
              {saving
                ? 'Moving money...'
                : 'Confirm transfer'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setStep(3)
            }
            style={[
              secondaryButton,
              {
                marginTop: 9,
                width: '100%',
              },
            ]}
          >
            <Text
              style={{
                fontWeight: '800',
                color: c.ink,
              }}
            >
              Change amount
            </Text>
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
  marginTop: 8,
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
  marginTop: 8,
};