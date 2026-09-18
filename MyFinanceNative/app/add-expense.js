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
  useRouter,
} from 'expo-router';

import {
  getAccounts,
  getCreditCards,
  addExpenseWithPaymentSource,
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
  blue: '#E7F2FF',
  pink: '#FBE8ED',
  purple: '#F1E6F7',
  line: '#E5EAEA',
};

const categories = [
  ['🍔', 'Food'],
  ['🛒', 'Groceries'],
  ['🚗', 'Transport'],
  ['🏠', 'Home'],
  ['🛍️', 'Shopping'],
  ['💡', 'Utilities'],
  ['💊', 'Medical'],
  ['🎀', 'Other'],
];

const accountTypeInfo = {
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

export default function AddExpense() {
  const router = useRouter();

  const [accounts, setAccounts] =
    useState([]);

  const [cards, setCards] =
    useState([]);

  const [step, setStep] =
    useState(1);

  const [amount, setAmount] =
    useState('');

  const [category, setCategory] =
    useState('Groceries');

  const [description, setDescription] =
    useState('');

  const [
    paymentSourceType,
    setPaymentSourceType,
  ] = useState(null);

  const [
    paymentSourceId,
    setPaymentSourceId,
  ] = useState(null);

  const [installment, setInstallment] =
    useState(false);

  const [
    installmentMonths,
    setInstallmentMonths,
  ] = useState('3');

  const [notes, setNotes] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [
    savedResult,
    setSavedResult,
  ] = useState(null);

  async function loadSources() {
    const accountData =
      await getAccounts();

    const cardData =
      await getCreditCards();

    setAccounts(accountData);
    setCards(cardData);
  }

  useFocusEffect(
    useCallback(() => {
      loadSources();
    }, [])
  );

  const selectedAccount =
    useMemo(
      () =>
        accounts.find(
          (item) =>
            String(item.id) ===
            String(paymentSourceId)
        ),
      [accounts, paymentSourceId]
    );

  const selectedCard =
    useMemo(
      () =>
        cards.find(
          (item) =>
            String(item.id) ===
            String(paymentSourceId)
        ),
      [cards, paymentSourceId]
    );

  const selectedSource =
    paymentSourceType === 'account'
      ? selectedAccount
      : selectedCard;

  async function handleSave() {
    try {
      setSaving(true);

      const result =
        await addExpenseWithPaymentSource({
          amount,
          category,
          description,
          paymentSourceType,
          paymentSourceId,
          notes,
          installment,
          installmentMonths,
        });

      setSavedResult({
        amount: Number(amount),
        paymentType:
          result.paymentType,
        sourceName:
          result.sourceName,
        newBalance:
          result.newBalance,
        availableCredit:
          result.availableCredit,
      });

      setStep(6);
    } catch (error) {
      Alert.alert(
        'Could not save',
        error?.message ||
          'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setAmount('');
    setCategory('Groceries');
    setDescription('');
    setPaymentSourceType(null);
    setPaymentSourceId(null);
    setInstallment(false);
    setInstallmentMonths('3');
    setNotes('');
    setSavedResult(null);
    setStep(1);
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
      {step !== 6 && (
        <>
          <Text
            style={{
              fontSize: 29,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            Money went out 💸
          </Text>

          <Text
            style={{
              color: c.muted,
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            Let’s record what you spent and how you paid.
          </Text>
        </>
      )}

      {step === 1 && (
        <>
          <Text style={question}>
            How much did you spend?
          </Text>

          <View
            style={{
              backgroundColor:
                c.yellow,
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
              if (
                !amount ||
                Number(amount) <= 0
              ) {
                Alert.alert(
                  'Enter a valid amount'
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
          <Text style={question}>
            What was it for?
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 9,
              marginBottom: 18,
            }}
          >
            {categories.map(
              ([emoji, label]) => {
                const selected =
                  category === label;

                return (
                  <Pressable
                    key={label}
                    onPress={() =>
                      setCategory(label)
                    }
                    style={{
                      minWidth: 130,
                      flexGrow: 1,
                      padding: 13,
                      borderRadius: 18,
                      backgroundColor:
                        selected
                          ? c.yellow
                          : c.card,
                      borderWidth: 1,
                      borderColor:
                        selected
                          ? '#E8C96A'
                          : c.line,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 21,
                      }}
                    >
                      {emoji}
                    </Text>

                    <Text
                      style={{
                        marginTop: 6,
                        color: c.ink,
                        fontWeight:
                          selected
                            ? '800'
                            : '600',
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          <View style={whiteCard}>
            <Text style={smallLabel}>
              Merchant or description
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Example: SM Supermarket"
              style={inputStyle}
            />
          </View>

          <View style={buttonRow}>
            <Pressable
              onPress={() =>
                setStep(1)
              }
              style={secondaryButton}
            >
              <Text
                style={secondaryText}
              >
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setStep(3)
              }
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

      {step === 3 && (
        <>
          <Text style={question}>
            How did you pay?
          </Text>

          <Pressable
            onPress={() => {
              setPaymentSourceType(
                'account'
              );
              setPaymentSourceId(null);
              setStep(4);
            }}
            style={{
              backgroundColor:
                c.green,
              borderRadius: 22,
              padding: 16,
              marginBottom: 11,
            }}
          >
            <Text
              style={{
                fontSize: 22,
              }}
            >
              💵
            </Text>

            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: c.ink,
                marginTop: 7,
              }}
            >
              Cash / Bank / E-Wallet
            </Text>

            <Text
              style={{
                color: c.muted,
                marginTop: 3,
              }}
            >
              Pay from money you already have
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setPaymentSourceType(
                'credit_card'
              );
              setPaymentSourceId(null);
              setStep(4);
            }}
            style={{
              backgroundColor:
                c.purple,
              borderRadius: 22,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 22,
              }}
            >
              💳
            </Text>

            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: c.ink,
                marginTop: 7,
              }}
            >
              Credit Card
            </Text>

            <Text
              style={{
                color: c.muted,
                marginTop: 3,
              }}
            >
              Charge it to one of your cards
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setStep(2)
            }
            style={[
              secondaryButton,
              {
                marginTop: 14,
                width: '100%',
              },
            ]}
          >
            <Text
              style={secondaryText}
            >
              Back
            </Text>
          </Pressable>
        </>
      )}

      {step === 4 && (
        <>
          <Text style={question}>
            {paymentSourceType ===
            'credit_card'
              ? 'Which card did you use?'
              : 'Which account paid?'}
          </Text>

          {paymentSourceType ===
          'account' ? (
            <>
              {accounts.map(
                (account) => {
                  const selected =
                    String(
                      account.id
                    ) ===
                    String(
                      paymentSourceId
                    );

                  const info =
                    accountTypeInfo[
                      account.type
                    ] ||
                    accountTypeInfo.other;

                  return (
                    <Pressable
                      key={
                        account.id
                      }
                      onPress={() =>
                        setPaymentSourceId(
                          String(
                            account.id
                          )
                        )
                      }
                      style={{
                        backgroundColor:
                          selected
                            ? info.bg
                            : c.card,
                        borderRadius: 20,
                        padding: 14,
                        borderWidth: 1,
                        borderColor:
                          selected
                            ? c.teal
                            : c.line,
                        marginBottom: 9,
                        flexDirection:
                          'row',
                        alignItems:
                          'center',
                      }}
                    >
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 16,
                          backgroundColor:
                            info.bg,
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          marginRight: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 22,
                          }}
                        >
                          {info.icon}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight:
                              '800',
                            color: c.ink,
                          }}
                        >
                          {account.name}
                        </Text>

                        <Text
                          style={{
                            color:
                              c.muted,
                            fontSize: 12,
                          }}
                        >
                          Balance
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontWeight:
                            '800',
                          color: c.ink,
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
              )}
            </>
          ) : (
            <>
              {cards.map(
                (card) => {
                  const selected =
                    String(
                      card.id
                    ) ===
                    String(
                      paymentSourceId
                    );

                  const available =
                    Math.max(
                      Number(
                        card.creditLimit ||
                          0
                      ) -
                        Number(
                          card.currentBalance ||
                            0
                        ),
                      0
                    );

                  return (
                    <Pressable
                      key={card.id}
                      onPress={() =>
                        setPaymentSourceId(
                          String(
                            card.id
                          )
                        )
                      }
                      style={{
                        backgroundColor:
                          selected
                            ? c.purple
                            : c.card,
                        borderRadius: 20,
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
                          flexDirection:
                            'row',
                          justifyContent:
                            'space-between',
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontWeight:
                                '800',
                              color:
                                c.ink,
                            }}
                          >
                            {card.name}
                          </Text>

                          <Text
                            style={{
                              color:
                                c.muted,
                              fontSize:
                                12,
                              marginTop:
                                3,
                            }}
                          >
                            Available credit
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontWeight:
                              '800',
                            color:
                              c.teal,
                          }}
                        >
                          ₱
                          {available.toLocaleString()}
                        </Text>
                      </View>
                    </Pressable>
                  );
                }
              )}
            </>
          )}

          <View style={buttonRow}>
            <Pressable
              onPress={() =>
                setStep(3)
              }
              style={secondaryButton}
            >
              <Text
                style={secondaryText}
              >
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (
                  !paymentSourceId
                ) {
                  Alert.alert(
                    'Choose a payment source'
                  );
                  return;
                }

                if (
                  paymentSourceType ===
                  'credit_card'
                ) {
                  setStep(5);
                } else {
                  setInstallment(
                    false
                  );
                  setStep(5);
                }
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

      {step === 5 && (
        <>
          {paymentSourceType ===
          'credit_card' && (
            <>
              <Text style={question}>
                Straight or installment?
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <Pressable
                  onPress={() =>
                    setInstallment(
                      false
                    )
                  }
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 20,
                    backgroundColor:
                      !installment
                        ? c.green
                        : c.card,
                    borderWidth: 1,
                    borderColor:
                      !installment
                        ? c.teal
                        : c.line,
                  }}
                >
                  <Text
                    style={{
                      fontWeight:
                        '800',
                      color: c.ink,
                    }}
                  >
                    Straight
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    setInstallment(
                      true
                    )
                  }
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 20,
                    backgroundColor:
                      installment
                        ? c.purple
                        : c.card,
                    borderWidth: 1,
                    borderColor:
                      installment
                        ? c.teal
                        : c.line,
                  }}
                >
                  <Text
                    style={{
                      fontWeight:
                        '800',
                      color: c.ink,
                    }}
                  >
                    Installment
                  </Text>
                </Pressable>
              </View>

              {installment && (
                <View style={whiteCard}>
                  <Text style={smallLabel}>
                    Number of months
                  </Text>

                  <TextInput
                    value={
                      installmentMonths
                    }
                    onChangeText={
                      setInstallmentMonths
                    }
                    keyboardType="number-pad"
                    placeholder="3"
                    style={inputStyle}
                  />
                </View>
              )}
            </>
          )}

          <Text
            style={[
              question,
              {
                marginTop:
                  paymentSourceType ===
                  'credit_card'
                    ? 12
                    : 0,
              },
            ]}
          >
            Review
          </Text>

          <View style={whiteCard}>
            <Text
              style={{
                textAlign: 'center',
                color: c.muted,
                fontSize: 12,
              }}
            >
              Expense
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
              −₱
              {Number(
                amount || 0
              ).toLocaleString()}
            </Text>

            <View
              style={{
                marginTop: 18,
                borderTopWidth: 1,
                borderTopColor:
                  c.line,
                paddingTop: 14,
                gap: 10,
              }}
            >
              <View style={reviewRow}>
                <Text
                  style={reviewLabel}
                >
                  Category
                </Text>

                <Text
                  style={reviewValue}
                >
                  {category}
                </Text>
              </View>

              <View style={reviewRow}>
                <Text
                  style={reviewLabel}
                >
                  Paid with
                </Text>

                <Text
                  style={reviewValue}
                >
                  {selectedSource?.name}
                </Text>
              </View>

              {paymentSourceType ===
                'credit_card' && (
                <View style={reviewRow}>
                  <Text
                    style={reviewLabel}
                  >
                    Purchase type
                  </Text>

                  <Text
                    style={reviewValue}
                  >
                    {installment
                      ? `${installmentMonths} months`
                      : 'Straight'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View
            style={[
              whiteCard,
              {
                marginTop: 12,
              },
            ]}
          >
            <Text style={smallLabel}>
              Note
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional"
              multiline
              style={[
                inputStyle,
                {
                  minHeight: 70,
                  textAlignVertical:
                    'top',
                },
              ]}
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={primaryButton}
          >
            <Text style={primaryText}>
              {saving
                ? 'Saving...'
                : 'Add expense'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setStep(4)
            }
            style={[
              secondaryButton,
              {
                marginTop: 10,
                width: '100%',
              },
            ]}
          >
            <Text
              style={secondaryText}
            >
              Change payment method
            </Text>
          </Pressable>
        </>
      )}

      {step === 6 &&
        savedResult && (
          <>
            <View
              style={{
                backgroundColor:
                  c.green,
                borderRadius: 26,
                padding: 24,
                alignItems: 'center',
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                }}
              >
                ✓
              </Text>

              <Text
                style={{
                  fontSize: 23,
                  fontWeight: '800',
                  color: c.ink,
                  marginTop: 12,
                }}
              >
                Expense saved
              </Text>

              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '800',
                  color: c.ink,
                  marginTop: 7,
                }}
              >
                −₱
                {savedResult.amount.toLocaleString()}
              </Text>

              <Text
                style={{
                  color: c.muted,
                  marginTop: 7,
                  textAlign: 'center',
                }}
              >
                Paid with{' '}
                {savedResult.sourceName}
              </Text>

              {savedResult.paymentType ===
              'account' ? (
                <Text
                  style={{
                    marginTop: 10,
                    fontWeight: '800',
                    color: c.ink,
                  }}
                >
                  New balance: ₱
                  {Number(
                    savedResult.newBalance
                  ).toLocaleString()}
                </Text>
              ) : (
                <Text
                  style={{
                    marginTop: 10,
                    fontWeight: '800',
                    color: c.ink,
                  }}
                >
                  Available credit: ₱
                  {Number(
                    savedResult.availableCredit ||
                      0
                  ).toLocaleString()}
                </Text>
              )}
            </View>

            <Pressable
              onPress={() =>
                router.navigate(
                  '/transactions'
                )
              }
              style={primaryButton}
            >
              <Text
                style={primaryText}
              >
                View transactions
              </Text>
            </Pressable>

            <Pressable
              onPress={resetForm}
              style={[
                secondaryButton,
                {
                  marginTop: 10,
                  width: '100%',
                },
              ]}
            >
              <Text
                style={secondaryText}
              >
                Add another expense
              </Text>
            </Pressable>
          </>
        )}
    </ScrollView>
  );
}

const question = {
  fontSize: 18,
  fontWeight: '800',
  color: '#45484A',
  marginBottom: 12,
};

const whiteCard = {
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#E5EAEA',
  padding: 15,
};

const smallLabel = {
  color: '#92999B',
  fontSize: 12,
  marginBottom: 7,
};

const inputStyle = {
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 14,
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
  marginTop: 16,
  paddingHorizontal: 18,
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