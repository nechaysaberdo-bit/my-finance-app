import React, {
  useCallback,
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
  useRouter,
} from 'expo-router';

import {
  addSavingsGoal,
  depositToSavings,
  getAccounts,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  tealSoft: '#DDF7F1',
  green: '#E7F5E8',
  yellow: '#FFF4D6',
  pink: '#FBE8ED',
  line: '#E5EAEA',
  red: '#D96A78',
};

export default function AddSavings() {
  const router = useRouter();

  const [accounts, setAccounts] = useState([]);

  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState(null);

  const [
    excludeFromSafeToEnjoy,
    setExcludeFromSafeToEnjoy,
  ] = useState(true);

  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadAccounts() {
    const data = await getAccounts();
    setAccounts(data);
  }

  function resetForm() {
    setStep(1);
    setName('');
    setTargetAmount('');
    setInitialDeposit('');
    setSourceAccountId(null);
    setExcludeFromSafeToEnjoy(true);
    setNotes('');
    setSaving(false);
    setErrorMessage('');
  }

  useFocusEffect(
    useCallback(() => {
      resetForm();
      loadAccounts();
    }, [])
  );

  function showError(message) {
    setErrorMessage(message);
  }

  async function handleSave() {
    if (saving) return;

    setErrorMessage('');

    const numericTarget =
      Number(targetAmount || 0);

    const numericDeposit =
      Number(initialDeposit || 0);

    if (!name.trim()) {
      showError(
        'Enter a savings goal name.'
      );
      return;
    }

    if (numericTarget <= 0) {
      showError(
        'Enter a valid target amount.'
      );
      return;
    }

    if (numericDeposit < 0) {
      showError(
        'Initial deposit cannot be negative.'
      );
      return;
    }

    if (
      numericDeposit > 0 &&
      !sourceAccountId
    ) {
      showError(
        'Choose where the initial deposit comes from.'
      );
      return;
    }

    if (numericDeposit > 0) {
      const selectedAccount =
        accounts.find(
          (account) =>
            String(account.id) ===
            String(sourceAccountId)
        );

      if (!selectedAccount) {
        showError(
          'Selected account could not be found.'
        );
        return;
      }

      if (
        Number(
          selectedAccount.balance || 0
        ) < numericDeposit
      ) {
        showError(
          `${selectedAccount.name} only has ₱${Number(
            selectedAccount.balance || 0
          ).toLocaleString()}.`
        );
        return;
      }
    }

    try {
      setSaving(true);

      const goal =
        await addSavingsGoal({
          name: name.trim(),
          targetAmount:
            numericTarget,

          currentAmount: 0,

          excludeFromSafeToEnjoy,

          notes,
        });

      if (numericDeposit > 0) {
        await depositToSavings({
          goalId: goal.id,

          accountId:
            sourceAccountId,

          amount:
            numericDeposit,

          notes:
            'Initial savings deposit',
        });
      }

      // Visible success state
      setStep(4);
    } catch (error) {
      console.error(
        'Savings goal save error:',
        error
      );

      showError(
        error?.message ||
          'Something went wrong while creating the savings goal.'
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
      {step !== 4 && (
        <>
          <Text
            style={{
              fontSize: 29,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            New savings goal 🌱
          </Text>

          <Text
            style={{
              color: c.muted,
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            Give this money something to work toward.
          </Text>
        </>
      )}

      {errorMessage ? (
        <View
          style={{
            backgroundColor: c.pink,

            borderWidth: 1,
            borderColor: '#F2CAD2',

            borderRadius: 16,

            padding: 13,

            marginBottom: 14,
          }}
        >
          <Text
            style={{
              color: c.red,
              fontWeight: '700',
            }}
          >
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {/* STEP 1 */}

      {step === 1 && (
        <>
          <Text style={question}>
            What are you saving for?
          </Text>

          <View style={whiteCard}>
            <Text style={label}>
              Goal name
            </Text>

            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value);
                setErrorMessage('');
              }}
              placeholder="Example: Emergency Fund"
              style={input}
            />

            <Text style={label}>
              Target amount
            </Text>

            <View style={moneyInput}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '800',
                  color: c.ink,
                }}
              >
                ₱
              </Text>

              <TextInput
                value={targetAmount}
                onChangeText={(value) => {
                  setTargetAmount(value);
                  setErrorMessage('');
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                style={moneyTextInput}
              />
            </View>
          </View>

          <Pressable
            onPress={() => {
              setErrorMessage('');

              if (!name.trim()) {
                showError(
                  'Enter a goal name.'
                );
                return;
              }

              if (
                Number(
                  targetAmount || 0
                ) <= 0
              ) {
                showError(
                  'Enter a valid target amount.'
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

      {/* STEP 2 */}

      {step === 2 && (
        <>
          <Text style={question}>
            Add money now?
          </Text>

          <Text
            style={{
              color: c.muted,
              marginBottom: 12,
              lineHeight: 19,
            }}
          >
            You can start at ₱0 or move money into this goal immediately.
          </Text>

          <View style={whiteCard}>
            <Text style={label}>
              Initial deposit
            </Text>

            <View style={moneyInput}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '800',
                  color: c.ink,
                }}
              >
                ₱
              </Text>

              <TextInput
                value={initialDeposit}
                onChangeText={(value) => {
                  setInitialDeposit(
                    value
                  );

                  setErrorMessage('');
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                style={moneyTextInput}
              />
            </View>
          </View>

          {Number(
            initialDeposit || 0
          ) > 0 && (
            <>
              <Text
                style={[
                  question,
                  {
                    marginTop: 16,
                  },
                ]}
              >
                Where is the money coming from?
              </Text>

              {accounts.length === 0 ? (
                <View style={whiteCard}>
                  <Text
                    style={{
                      color: c.muted,
                    }}
                  >
                    You don't have any accounts yet.
                  </Text>
                </View>
              ) : (
                accounts.map(
                  (account) => {
                    const selected =
                      String(
                        sourceAccountId
                      ) ===
                      String(
                        account.id
                      );

                    return (
                      <Pressable
                        key={
                          account.id
                        }
                        onPress={() => {
                          setSourceAccountId(
                            String(
                              account.id
                            )
                          );

                          setErrorMessage(
                            ''
                          );
                        }}
                        style={{
                          backgroundColor:
                            selected
                              ? c.tealSoft
                              : c.card,

                          borderRadius:
                            20,

                          borderWidth: 1,

                          borderColor:
                            selected
                              ? c.teal
                              : c.line,

                          padding: 14,

                          marginBottom:
                            9,

                          flexDirection:
                            'row',

                          justifyContent:
                            'space-between',

                          alignItems:
                            'center',
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              color:
                                c.ink,

                              fontWeight:
                                '800',
                            }}
                          >
                            {
                              account.name
                            }
                          </Text>

                          <Text
                            style={{
                              color:
                                c.muted,

                              fontSize:
                                11,

                              marginTop:
                                3,
                            }}
                          >
                            Available balance
                          </Text>
                        </View>

                        <Text
                          style={{
                            color:
                              c.ink,

                            fontWeight:
                              '800',
                          }}
                        >
                          ₱
                          {Number(
                            account.balance ||
                              0
                          ).toLocaleString()}
                        </Text>
                      </Pressable>
                    );
                  }
                )
              )}
            </>
          )}

          <View style={buttonRow}>
            <Pressable
              onPress={() => {
                setErrorMessage('');
                setStep(1);
              }}
              style={secondaryButton}
            >
              <Text style={secondaryText}>
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setErrorMessage('');

                if (
                  Number(
                    initialDeposit ||
                      0
                  ) > 0 &&
                  !sourceAccountId
                ) {
                  showError(
                    'Choose where the initial deposit comes from.'
                  );

                  return;
                }

                setStep(3);
              }}
              style={[
                primaryButton,
                {
                  flex: 2,
                  marginTop: 0,
                },
              ]}
            >
              <Text style={primaryText}>
                Continue
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {/* STEP 3 */}

      {step === 3 && (
        <>
          <Text style={question}>
            Protect this money?
          </Text>

          <Pressable
            onPress={() =>
              setExcludeFromSafeToEnjoy(
                !excludeFromSafeToEnjoy
              )
            }
            style={{
              backgroundColor:
                excludeFromSafeToEnjoy
                  ? c.green
                  : c.card,

              borderRadius: 22,

              borderWidth: 1,

              borderColor:
                excludeFromSafeToEnjoy
                  ? c.teal
                  : c.line,

              padding: 17,
            }}
          >
            <View
              style={{
                flexDirection: 'row',

                justifyContent:
                  'space-between',

                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flex: 1,
                  paddingRight: 18,
                }}
              >
                <Text
                  style={{
                    color: c.ink,

                    fontWeight: '800',

                    fontSize: 16,
                  }}
                >
                  Exclude from Safe to Enjoy
                </Text>

                <Text
                  style={{
                    color: c.muted,

                    fontSize: 12,

                    marginTop: 4,

                    lineHeight: 18,
                  }}
                >
                  This savings balance won't be treated as spendable money.
                </Text>
              </View>

              <Text
                style={{
                  color: c.teal,

                  fontWeight: '800',

                  fontSize: 18,
                }}
              >
                {excludeFromSafeToEnjoy
                  ? '✓'
                  : '○'}
              </Text>
            </View>
          </Pressable>

          <View
            style={[
              whiteCard,
              {
                marginTop: 12,
              },
            ]}
          >
            <Text style={label}>
              Notes
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional"
              multiline
              style={[
                input,
                {
                  minHeight: 70,
                  textAlignVertical:
                    'top',
                },
              ]}
            />
          </View>

          <View
            style={{
              backgroundColor:
                c.yellow,

              borderRadius: 22,

              padding: 16,

              marginTop: 12,
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 11,
              }}
            >
              GOAL
            </Text>

            <Text
              style={{
                color: c.ink,

                fontSize: 18,

                fontWeight: '800',

                marginTop: 4,
              }}
            >
              {name}
            </Text>

            <Text
              style={{
                color: c.ink,

                fontSize: 28,

                fontWeight: '800',

                marginTop: 5,
              }}
            >
              ₱
              {Number(
                targetAmount || 0
              ).toLocaleString()}
            </Text>

            {Number(
              initialDeposit || 0
            ) > 0 && (
              <Text
                style={{
                  color: c.muted,

                  marginTop: 5,

                  fontSize: 12,
                }}
              >
                Starting with ₱
                {Number(
                  initialDeposit
                ).toLocaleString()}
              </Text>
            )}
          </View>

          <View style={buttonRow}>
            <Pressable
              onPress={() => {
                setErrorMessage('');
                setStep(2);
              }}
              style={secondaryButton}
            >
              <Text style={secondaryText}>
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[
                primaryButton,

                {
                  flex: 2,
                  marginTop: 0,
                },

                saving && {
                  opacity: 0.65,
                },
              ]}
            >
              <Text style={primaryText}>
                {saving
                  ? 'Creating goal...'
                  : 'Create goal'}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {/* SUCCESS */}

      {step === 4 && (
        <>
          <View
            style={{
              backgroundColor:
                c.green,

              borderRadius: 26,

              padding: 25,

              alignItems: 'center',

              marginTop: 12,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,

                borderRadius: 22,

                backgroundColor:
                  '#FFFFFFAA',

                alignItems: 'center',
                justifyContent:
                  'center',
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                }}
              >
                ✓
              </Text>
            </View>

            <Text
              style={{
                color: c.ink,

                fontSize: 23,

                fontWeight: '800',

                marginTop: 12,
              }}
            >
              Goal created
            </Text>

            <Text
              style={{
                color: c.ink,

                fontSize: 21,

                fontWeight: '800',

                marginTop: 8,
              }}
            >
              {name}
            </Text>

            <Text
              style={{
                color: c.muted,

                textAlign: 'center',

                marginTop: 6,
              }}
            >
              Target ₱
              {Number(
                targetAmount || 0
              ).toLocaleString()}
            </Text>

            {Number(
              initialDeposit || 0
            ) > 0 && (
              <View
                style={{
                  backgroundColor:
                    '#FFFFFF99',

                  borderRadius: 15,

                  paddingHorizontal:
                    14,

                  paddingVertical:
                    9,

                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    color: c.ink,

                    fontWeight: '700',
                  }}
                >
                  ₱
                  {Number(
                    initialDeposit
                  ).toLocaleString()}{' '}
                  saved already
                </Text>
              </View>
            )}
          </View>

          <Pressable
            onPress={() =>
              router.replace(
                '/savings'
              )
            }
            style={primaryButton}
          >
            <Text style={primaryText}>
              View savings
            </Text>
          </Pressable>

          <Pressable
            onPress={resetForm}
            style={[
              secondaryButton,
              {
                width: '100%',
                marginTop: 10,
              },
            ]}
          >
            <Text style={secondaryText}>
              Add another goal
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const question = {
  color: '#45484A',
  fontSize: 18,
  fontWeight: '800',
  marginBottom: 12,
};

const whiteCard = {
  backgroundColor: '#FFFFFF',

  borderRadius: 22,

  borderWidth: 1,

  borderColor: '#E5EAEA',

  padding: 16,
};

const label = {
  color: '#92999B',

  fontSize: 12,

  fontWeight: '600',

  marginBottom: 7,
};

const input = {
  borderWidth: 1,

  borderColor: '#E5EAEA',

  borderRadius: 14,

  padding: 13,

  color: '#45484A',

  marginBottom: 16,
};

const moneyInput = {
  flexDirection: 'row',

  alignItems: 'center',

  borderWidth: 1,

  borderColor: '#E5EAEA',

  borderRadius: 18,

  paddingHorizontal: 14,
};

const moneyTextInput = {
  flex: 1,

  fontSize: 24,

  fontWeight: '800',

  padding: 13,

  color: '#45484A',
};

const buttonRow = {
  flexDirection: 'row',

  gap: 10,

  marginTop: 18,
};

const primaryButton = {
  minHeight: 54,

  borderRadius: 18,

  backgroundColor: '#22BDA5',

  alignItems: 'center',

  justifyContent: 'center',

  paddingHorizontal: 18,

  marginTop: 16,
};

const primaryText = {
  color: '#FFFFFF',

  fontWeight: '800',

  fontSize: 15,
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