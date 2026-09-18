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
  getLoans,
  getAccounts,
  getCreditCards,
  payLoan,
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
  purple: '#F1E6F7',
  blue: '#E7F2FF',
  line: '#E5EAEA',
};

export default function PayLoan() {
  const router = useRouter();
  const { id } =
    useLocalSearchParams();

  const [loan, setLoan] =
    useState(null);

  const [accounts, setAccounts] =
    useState([]);

  const [cards, setCards] =
    useState([]);

  const [
    paymentSourceType,
    setPaymentSourceType,
  ] = useState(null);

  const [
    paymentSourceId,
    setPaymentSourceId,
  ] = useState(null);

  const [amount, setAmount] =
    useState('');

  const [
    paymentType,
    setPaymentType,
  ] = useState('regular');

  const [notes, setNotes] =
    useState('');

  const [step, setStep] =
    useState(1);

  const [saving, setSaving] =
    useState(false);

  const [result, setResult] =
    useState(null);

  async function loadData() {
    const loans =
      await getLoans();

    const accountData =
      await getAccounts();

    const cardData =
      await getCreditCards();

    const found =
      loans.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    setLoan(found || null);
    setAccounts(accountData);
    setCards(cardData);

    if (
      found?.monthlyPayment
    ) {
      setAmount(
        String(
          found.monthlyPayment
        )
      );
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const selectedAccount =
    useMemo(
      () =>
        accounts.find(
          (item) =>
            String(item.id) ===
            String(
              paymentSourceId
            )
        ),
      [
        accounts,
        paymentSourceId,
      ]
    );

  const selectedCard =
    useMemo(
      () =>
        cards.find(
          (item) =>
            String(item.id) ===
            String(
              paymentSourceId
            )
        ),
      [
        cards,
        paymentSourceId,
      ]
    );

  const selectedSource =
    paymentSourceType ===
    'account'
      ? selectedAccount
      : selectedCard;

  async function handlePayment() {
    if (
      !paymentSourceType ||
      !paymentSourceId
    ) {
      Alert.alert(
        'Choose a payment source'
      );
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      Alert.alert(
        'Enter a payment amount'
      );
      return;
    }

    try {
      setSaving(true);

      const saved =
        await payLoan({
          loanId: loan.id,
          paymentSourceType,
          paymentSourceId,
          amount,
          paymentType,
          notes,
        });

      setResult(saved);
      setStep(5);
    } catch (error) {
      Alert.alert(
        'Could not record payment',
        error?.message ||
          'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (!loan) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: c.ink,
            fontWeight: '800',
          }}
        >
          Loan not found
        </Text>
      </View>
    );
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
      {step !== 5 && (
        <>
          <Text
            style={{
              fontSize: 29,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            Loan payment 💸
          </Text>

          <Text
            style={{
              color: c.muted,
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            Record a payment toward {loan.name}.
          </Text>
        </>
      )}

      {step === 1 && (
        <>
          <View
            style={{
              backgroundColor:
                c.pink,
              borderRadius: 24,
              padding: 20,
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 12,
              }}
            >
              REMAINING BALANCE
            </Text>

            <Text
              style={{
                color: c.ink,
                fontSize: 34,
                fontWeight: '800',
                marginTop: 5,
              }}
            >
              ₱
              {Number(
                loan.remainingBalance ||
                  0
              ).toLocaleString()}
            </Text>

            {Number(
              loan.monthlyPayment ||
                0
            ) > 0 && (
              <Text
                style={{
                  color: c.muted,
                  marginTop: 8,
                }}
              >
                Regular payment: ₱
                {Number(
                  loan.monthlyPayment
                ).toLocaleString()}
              </Text>
            )}
          </View>

          <Text style={question}>
            What kind of payment?
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <Choice
              emoji="🌷"
              title="Regular"
              subtitle="Scheduled payment"
              selected={
                paymentType ===
                'regular'
              }
              onPress={() => {
                setPaymentType(
                  'regular'
                );

                if (
                  loan.monthlyPayment
                ) {
                  setAmount(
                    String(
                      loan.monthlyPayment
                    )
                  );
                }
              }}
            />

            <Choice
              emoji="✨"
              title="Extra"
              subtitle="Pay down faster"
              selected={
                paymentType ===
                'extra'
              }
              onPress={() => {
                setPaymentType(
                  'extra'
                );

                setAmount('');
              }}
            />
          </View>

          <Text
            style={[
              question,
              {
                marginTop: 20,
              },
            ]}
          >
            How much?
          </Text>

          <View style={moneyInput}>
            <Text
              style={{
                fontSize: 25,
                fontWeight: '800',
                color: c.ink,
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
                padding: 13,
                fontSize: 24,
                fontWeight: '800',
                color: c.ink,
              }}
            />
          </View>

          <Pressable
            onPress={() => {
              if (
                Number(amount) <= 0
              ) {
                Alert.alert(
                  'Enter a payment amount'
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
            How are you paying?
          </Text>

          <Pressable
            onPress={() => {
              setPaymentSourceType(
                'account'
              );
              setPaymentSourceId(
                null
              );
              setStep(3);
            }}
            style={{
              backgroundColor:
                c.green,
              borderRadius: 22,
              padding: 16,
              marginBottom: 11,
            }}
          >
            <Text style={{ fontSize: 22 }}>
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
              Pay using money you already have
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setPaymentSourceType(
                'credit_card'
              );
              setPaymentSourceId(
                null
              );
              setStep(3);
            }}
            style={{
              backgroundColor:
                c.purple,
              borderRadius: 22,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 22 }}>
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
              Charge the loan payment to a card
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStep(1)}
            style={[
              secondaryButton,
              {
                width: '100%',
                marginTop: 14,
              },
            ]}
          >
            <Text style={secondaryText}>
              Back
            </Text>
          </Pressable>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={question}>
            {paymentSourceType ===
            'credit_card'
              ? 'Which credit card?'
              : 'Which account?'}
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
                            ? c.tealSoft
                            : c.card,

                        borderRadius: 20,
                        borderWidth: 1,

                        borderColor:
                          selected
                            ? c.teal
                            : c.line,

                        padding: 15,
                        marginBottom: 9,

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
                            fontSize: 11,
                            marginTop: 3,
                          }}
                        >
                          Available balance
                        </Text>
                      </View>

                      <Text
                        style={{
                          color: c.ink,
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
                        borderWidth: 1,

                        borderColor:
                          selected
                            ? c.teal
                            : c.line,

                        padding: 15,
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
                              color:
                                c.ink,
                              fontWeight:
                                '800',
                            }}
                          >
                            {card.name}
                          </Text>

                          <Text
                            style={{
                              color:
                                c.muted,
                              fontSize: 11,
                              marginTop: 3,
                            }}
                          >
                            Available credit
                          </Text>
                        </View>

                        <Text
                          style={{
                            color:
                              c.teal,
                            fontWeight:
                              '800',
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
                setStep(2)
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

                setStep(4);
              }}
              style={[
                primaryButton,
                {
                  flex: 2,
                  marginTop: 0,
                },
              ]}
            >
              <Text
                style={primaryText}
              >
                Review
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {step === 4 && (
        <>
          <Text style={question}>
            Ready to record it?
          </Text>

          <View style={whiteCard}>
            <Text
              style={{
                color: c.muted,
                textAlign: 'center',
              }}
            >
              {paymentType ===
              'extra'
                ? 'Extra payment'
                : 'Regular payment'}
            </Text>

            <Text
              style={{
                color: c.ink,
                fontSize: 22,
                fontWeight: '800',
                textAlign: 'center',
                marginTop: 5,
              }}
            >
              {loan.name}
            </Text>

            <Text
              style={{
                color: c.ink,
                fontSize: 34,
                fontWeight: '800',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              ₱
              {Number(
                amount || 0
              ).toLocaleString()}
            </Text>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor:
                  c.line,
                marginTop: 17,
                paddingTop: 13,
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
                <Text
                  style={{
                    color:
                      c.muted,
                    fontSize: 12,
                  }}
                >
                  Paid with
                </Text>

                <Text
                  style={{
                    color: c.ink,
                    fontWeight:
                      '800',
                  }}
                >
                  {selectedSource?.name}
                </Text>
              </View>

              <View
                style={{
                  flexDirection:
                    'row',
                  justifyContent:
                    'space-between',
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    color:
                      c.muted,
                    fontSize: 12,
                  }}
                >
                  Loan after payment
                </Text>

                <Text
                  style={{
                    color: c.teal,
                    fontWeight:
                      '800',
                  }}
                >
                  ₱
                  {Math.max(
                    Number(
                      loan.remainingBalance ||
                        0
                    ) -
                      Number(
                        amount ||
                          0
                      ),
                    0
                  ).toLocaleString()}
                </Text>
              </View>
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
            <Text style={label}>
              Note
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
              onPress={
                handlePayment
              }
              disabled={saving}
              style={[
                primaryButton,
                {
                  flex: 2,
                  marginTop: 0,
                },
              ]}
            >
              <Text
                style={primaryText}
              >
                {saving
                  ? 'Saving...'
                  : 'Confirm payment'}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {step === 5 &&
        result && (
          <>
            <View
              style={{
                backgroundColor:
                  c.green,
                borderRadius: 26,
                padding: 25,
                alignItems:
                  'center',
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                }}
              >
                ✓
              </Text>

              <Text
                style={{
                  fontSize: 23,
                  fontWeight:
                    '800',
                  color: c.ink,
                  marginTop: 10,
                }}
              >
                Payment recorded
              </Text>

              <Text
                style={{
                  fontSize: 30,
                  fontWeight:
                    '800',
                  color: c.ink,
                  marginTop: 7,
                }}
              >
                ₱
                {Number(
                  result.amountPaid
                ).toLocaleString()}
              </Text>

              <Text
                style={{
                  color: c.muted,
                  textAlign:
                    'center',
                  marginTop: 8,
                }}
              >
                Paid with{' '}
                {result.sourceName}
              </Text>
            </View>

            <View
              style={{
                backgroundColor:
                  c.yellow,
                borderRadius: 22,
                padding: 17,
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  color: c.muted,
                  fontSize: 11,
                }}
              >
                NEW LOAN BALANCE
              </Text>

              <Text
                style={{
                  color: c.ink,
                  fontSize: 27,
                  fontWeight:
                    '800',
                  marginTop: 4,
                }}
              >
                ₱
                {Number(
                  result.newLoanBalance
                ).toLocaleString()}
              </Text>

              {result.paymentSourceType ===
                'credit_card' && (
                <Text
                  style={{
                    color:
                      c.muted,
                    marginTop: 8,
                  }}
                >
                  Available credit: ₱
                  {Number(
                    result.availableCredit ||
                      0
                  ).toLocaleString()}
                </Text>
              )}

              {result.paymentSourceType ===
                'account' && (
                <Text
                  style={{
                    color:
                      c.muted,
                    marginTop: 8,
                  }}
                >
                  Account balance: ₱
                  {Number(
                    result.newSourceBalance ||
                      0
                  ).toLocaleString()}
                </Text>
              )}
            </View>

            <Pressable
              onPress={() =>
                router.replace({
                  pathname:
                    '/loan',
                  params: {
                    id: loan.id,
                  },
                })
              }
              style={primaryButton}
            >
              <Text
                style={primaryText}
              >
                Back to loan
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.replace(
                  '/transactions'
                )
              }
              style={[
                secondaryButton,
                {
                  width: '100%',
                  marginTop: 10,
                },
              ]}
            >
              <Text
                style={secondaryText}
              >
                View transaction
              </Text>
            </Pressable>
          </>
        )}
    </ScrollView>
  );
}

function Choice({
  emoji,
  title,
  subtitle,
  selected,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor:
          selected
            ? '#DDF7F1'
            : '#FFFFFF',

        borderRadius: 20,
        padding: 15,

        borderWidth: 1,

        borderColor:
          selected
            ? '#22BDA5'
            : '#E5EAEA',
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
          color: '#45484A',
          fontWeight: '800',
          marginTop: 6,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: '#92999B',
          fontSize: 11,
          marginTop: 3,
        }}
      >
        {subtitle}
      </Text>
    </Pressable>
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

const moneyInput = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 18,
  paddingHorizontal: 15,
};

const label = {
  color: '#92999B',
  fontSize: 12,
  marginBottom: 7,
};

const input = {
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