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
  getLendBorrowRecords,
  getAccounts,
  getCreditCards,
  repayLendBorrow,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  tealSoft: '#DDF7F1',
  green: '#E7F5E8',
  pink: '#FBE8ED',
  purple: '#F1E6F7',
  line: '#E5EAEA',
};

export default function RepayLendBorrow() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [record, setRecord] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);

  const [amount, setAmount] = useState('');

  const [
    paymentSourceType,
    setPaymentSourceType,
  ] = useState(null);

  const [
    paymentSourceId,
    setPaymentSourceId,
  ] = useState(null);

  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  async function loadData() {
    const records =
      await getLendBorrowRecords();

    const found =
      records.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    setRecord(found || null);
    setAccounts(await getAccounts());
    setCards(await getCreditCards());
  }

  useFocusEffect(
  useCallback(() => {
    async function resetAndLoad() {
      setAmount('');
      setPaymentSourceType(null);
      setPaymentSourceId(null);
      setNotes('');
      setStep(1);
      setSaving(false);
      setResult(null);

      await loadData();
    }

    resetAndLoad();
  }, [id])
);

  const selectedSource = useMemo(() => {
    if (
      paymentSourceType ===
      'account'
    ) {
      return accounts.find(
        (item) =>
          String(item.id) ===
          String(paymentSourceId)
      );
    }

    return cards.find(
      (item) =>
        String(item.id) ===
        String(paymentSourceId)
    );
  }, [
    accounts,
    cards,
    paymentSourceType,
    paymentSourceId,
  ]);

  if (!record) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Record not found</Text>
      </View>
    );
  }

  const isLent =
    record.direction === 'lent';

  async function handleSave() {
    try {
      setSaving(true);

      const saved =
        await repayLendBorrow({
          recordId: record.id,
          amount,
          paymentSourceType,
          paymentSourceId,
          notes,
        });

      setResult(saved);
      setStep(4);
    } catch (error) {
      Alert.alert(
        'Could not save repayment',
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
      {step !== 4 && (
        <>
          <Text
            style={{
              fontSize: 29,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            {isLent
              ? 'Repayment received 🤝'
              : 'Repay borrowed money 🤝'}
          </Text>

          <Text
            style={{
              color: c.muted,
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            {isLent
              ? `${record.person} is paying you back.`
              : `You’re paying ${record.person} back.`}
          </Text>
        </>
      )}

      {step === 1 && (
        <>
          <View
            style={{
              backgroundColor:
                isLent
                  ? c.green
                  : c.pink,
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
              REMAINING
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
                record.remainingAmount ||
                  0
              ).toLocaleString()}
            </Text>
          </View>

          <Text style={question}>
            How much?
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
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              style={{
                flex: 1,
                fontSize: 24,
                fontWeight: '800',
                padding: 13,
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
            {isLent
              ? 'Where did you receive the repayment?'
              : 'How are you paying?'}
          </Text>

          {isLent ? (
            accounts.map((account) => (
              <Pressable
                key={account.id}
                onPress={() => {
                  setPaymentSourceType(
                    'account'
                  );
                  setPaymentSourceId(
                    String(account.id)
                  );
                }}
                style={{
                  backgroundColor:
                    String(
                      paymentSourceId
                    ) ===
                    String(account.id)
                      ? c.tealSoft
                      : c.card,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor:
                    String(
                      paymentSourceId
                    ) ===
                    String(account.id)
                      ? c.teal
                      : c.line,
                  padding: 14,
                  marginBottom: 9,
                  flexDirection: 'row',
                  justifyContent:
                    'space-between',
                }}
              >
                <Text
                  style={{
                    color: c.ink,
                    fontWeight: '800',
                  }}
                >
                  {account.name}
                </Text>

                <Text
                  style={{
                    color: c.ink,
                    fontWeight: '800',
                  }}
                >
                  ₱
                  {Number(
                    account.balance || 0
                  ).toLocaleString()}
                </Text>
              </Pressable>
            ))
          ) : (
            <>
              <Pressable
                onPress={() => {
                  setPaymentSourceType(
                    'account'
                  );
                  setPaymentSourceId(null);
                }}
                style={{
                  backgroundColor:
                    paymentSourceType ===
                    'account'
                      ? c.green
                      : c.card,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor:
                    paymentSourceType ===
                    'account'
                      ? c.teal
                      : c.line,
                  padding: 14,
                  marginBottom: 9,
                }}
              >
                <Text
                  style={{
                    fontWeight: '800',
                    color: c.ink,
                  }}
                >
                  💵 Cash / Bank / E-Wallet
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setPaymentSourceType(
                    'credit_card'
                  );
                  setPaymentSourceId(null);
                }}
                style={{
                  backgroundColor:
                    paymentSourceType ===
                    'credit_card'
                      ? c.purple
                      : c.card,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor:
                    paymentSourceType ===
                    'credit_card'
                      ? c.teal
                      : c.line,
                  padding: 14,
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontWeight: '800',
                    color: c.ink,
                  }}
                >
                  💳 Credit Card
                </Text>
              </Pressable>

              {paymentSourceType ===
                'account' &&
                accounts.map(
                  (account) => (
                    <Pressable
                      key={account.id}
                      onPress={() =>
                        setPaymentSourceId(
                          String(
                            account.id
                          )
                        )
                      }
                      style={{
                        backgroundColor:
                          String(
                            paymentSourceId
                          ) ===
                          String(
                            account.id
                          )
                            ? c.tealSoft
                            : c.card,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor:
                          String(
                            paymentSourceId
                          ) ===
                          String(
                            account.id
                          )
                            ? c.teal
                            : c.line,
                        padding: 14,
                        marginBottom: 9,
                        flexDirection:
                          'row',
                        justifyContent:
                          'space-between',
                      }}
                    >
                      <Text
                        style={{
                          color: c.ink,
                          fontWeight:
                            '800',
                        }}
                      >
                        {account.name}
                      </Text>

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
                  )
                )}

              {paymentSourceType ===
                'credit_card' &&
                cards.map((card) => {
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
                          String(card.id)
                        )
                      }
                      style={{
                        backgroundColor:
                          String(
                            paymentSourceId
                          ) ===
                          String(card.id)
                            ? c.purple
                            : c.card,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor:
                          String(
                            paymentSourceId
                          ) ===
                          String(card.id)
                            ? c.teal
                            : c.line,
                        padding: 14,
                        marginBottom: 9,
                        flexDirection:
                          'row',
                        justifyContent:
                          'space-between',
                      }}
                    >
                      <Text
                        style={{
                          color: c.ink,
                          fontWeight:
                            '800',
                        }}
                      >
                        {card.name}
                      </Text>

                      <Text
                        style={{
                          color: c.teal,
                          fontWeight:
                            '800',
                        }}
                      >
                        ₱
                        {available.toLocaleString()}
                      </Text>
                    </Pressable>
                  );
                })}
            </>
          )}

          <Pressable
            onPress={() => {
              if (
                !paymentSourceType ||
                !paymentSourceId
              ) {
                Alert.alert(
                  'Choose a payment source'
                );
                return;
              }

              setStep(3);
            }}
            style={primaryButton}
          >
            <Text style={primaryText}>
              Review
            </Text>
          </Pressable>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={question}>
            Looks right?
          </Text>

          <View style={whiteCard}>
            <Text
              style={{
                color: c.muted,
                textAlign: 'center',
              }}
            >
              {isLent
                ? `Repayment from ${record.person}`
                : `Repayment to ${record.person}`}
            </Text>

            <Text
              style={{
                color: c.ink,
                textAlign: 'center',
                fontSize: 34,
                fontWeight: '800',
                marginTop: 8,
              }}
            >
              ₱
              {Number(
                amount || 0
              ).toLocaleString()}
            </Text>

            <Text
              style={{
                color: c.muted,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              {selectedSource?.name}
            </Text>
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
                : 'Confirm repayment'}
            </Text>
          </Pressable>
        </>
      )}

      {step === 4 && result && (
        <>
          <View
            style={{
              backgroundColor: c.green,
              borderRadius: 26,
              padding: 25,
              alignItems: 'center',
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
                fontWeight: '800',
                color: c.ink,
                marginTop: 10,
              }}
            >
              Repayment recorded
            </Text>

            <Text
              style={{
                color: c.muted,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Remaining: ₱
              {Number(
                result.newRemaining
              ).toLocaleString()}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.replace({
                pathname:
                  '/lendborrow-detail',
                params: {
                  id: record.id,
                },
              })
            }
            style={primaryButton}
          >
            <Text style={primaryText}>
              Back to record
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
  borderRadius: 22,
  borderWidth: 1,
  borderColor: '#E5EAEA',
  padding: 16,
};

const moneyInput = {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 18,
  paddingHorizontal: 14,
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