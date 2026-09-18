import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';

import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  getBills,
  getAccounts,
  getCreditCards,
  payBill,
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
  purple: '#F1E6F7',
  line: '#E5EAEA',
};

export default function PayBill() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [bill, setBill] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);

  const [
    paymentSourceType,
    setPaymentSourceType,
  ] = useState(null);

  const [
    paymentSourceId,
    setPaymentSourceId,
  ] = useState(null);

  const [step, setStep] = useState(1);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedResult, setSavedResult] = useState(null);

  async function loadData() {
    const allBills = await getBills();
    const accountData = await getAccounts();
    const cardData = await getCreditCards();

    const foundBill = allBills.find(
      (item) => String(item.id) === String(id)
    );

    setBill(foundBill || null);
    setAccounts(accountData);
    setCards(cardData);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const selectedAccount = useMemo(
    () =>
      accounts.find(
        (item) =>
          String(item.id) === String(paymentSourceId)
      ),
    [accounts, paymentSourceId]
  );

  const selectedCard = useMemo(
    () =>
      cards.find(
        (item) =>
          String(item.id) === String(paymentSourceId)
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

      const result = await payBill({
        billId: bill.id,
        paymentSourceType,
        paymentSourceId,
        notes,
      });

      setSavedResult(result);
      setStep(4);
    } catch (error) {
      Alert.alert(
        'Could not pay bill',
        error?.message || 'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (!bill) {
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
          Bill not found
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
      {step !== 4 && (
        <>
          <Text
            style={{
              fontSize: 29,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            Pay bill 🧾
          </Text>

          <Text
            style={{
              color: c.muted,
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            Record how this bill was paid.
          </Text>
        </>
      )}

      {step === 1 && (
        <>
          <View
            style={{
              backgroundColor: c.yellow,
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
              BILL
            </Text>

            <Text
              style={{
                fontSize: 21,
                fontWeight: '800',
                color: c.ink,
                marginTop: 4,
              }}
            >
              {bill.name}
            </Text>

            <Text
              style={{
                fontSize: 34,
                fontWeight: '800',
                color: c.ink,
                marginTop: 10,
              }}
            >
              ₱{Number(
                bill.amount || 0
              ).toLocaleString()}
            </Text>
          </View>

          <Text style={question}>
            How did you pay?
          </Text>

          <Pressable
            onPress={() => {
              setPaymentSourceType('account');
              setPaymentSourceId(null);
              setStep(2);
            }}
            style={{
              backgroundColor: c.green,
              borderRadius: 22,
              padding: 16,
              marginBottom: 11,
            }}
          >
            <Text style={{ fontSize: 22 }}>💵</Text>

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
          </Pressable>

          <Pressable
            onPress={() => {
              setPaymentSourceType('credit_card');
              setPaymentSourceId(null);
              setStep(2);
            }}
            style={{
              backgroundColor: c.purple,
              borderRadius: 22,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 22 }}>💳</Text>

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
          </Pressable>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={question}>
            {paymentSourceType === 'credit_card'
              ? 'Which card did you use?'
              : 'Which account paid?'}
          </Text>

          {paymentSourceType === 'account'
            ? accounts.map((account) => {
                const selected =
                  String(account.id) ===
                  String(paymentSourceId);

                return (
                  <Pressable
                    key={account.id}
                    onPress={() =>
                      setPaymentSourceId(
                        String(account.id)
                      )
                    }
                    style={{
                      backgroundColor: selected
                        ? c.tealSoft
                        : c.card,
                      borderRadius: 20,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: selected
                        ? c.teal
                        : c.line,
                      marginBottom: 9,
                      flexDirection: 'row',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View>
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
                          color: c.muted,
                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        Balance
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontWeight: '800',
                        color: c.ink,
                      }}
                    >
                      ₱{Number(
                        account.balance || 0
                      ).toLocaleString()}
                    </Text>
                  </Pressable>
                );
              })
            : cards.map((card) => {
                const selected =
                  String(card.id) ===
                  String(paymentSourceId);

                const available =
                  Number(card.creditLimit || 0) -
                  Number(card.currentBalance || 0);

                return (
                  <Pressable
                    key={card.id}
                    onPress={() =>
                      setPaymentSourceId(
                        String(card.id)
                      )
                    }
                    style={{
                      backgroundColor: selected
                        ? c.purple
                        : c.card,
                      borderRadius: 20,
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
                          }}
                        >
                          {card.name}
                        </Text>

                        <Text
                          style={{
                            color: c.muted,
                            fontSize: 12,
                            marginTop: 3,
                          }}
                        >
                          Available credit
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontWeight: '800',
                          color: c.teal,
                        }}
                      >
                        ₱{available.toLocaleString()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}

          <View style={buttonRow}>
            <Pressable
              onPress={() => setStep(1)}
              style={secondaryButton}
            >
              <Text style={secondaryText}>
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!paymentSourceId) {
                  Alert.alert(
                    'Choose a payment source'
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
                Review
              </Text>
            </Pressable>
          </View>
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
                textAlign: 'center',
                color: c.muted,
                fontSize: 12,
              }}
            >
              Paying
            </Text>

            <Text
              style={{
                textAlign: 'center',
                fontSize: 24,
                fontWeight: '800',
                color: c.ink,
                marginTop: 5,
              }}
            >
              {bill.name}
            </Text>

            <Text
              style={{
                textAlign: 'center',
                fontSize: 34,
                fontWeight: '800',
                color: c.ink,
                marginTop: 8,
              }}
            >
              ₱{Number(
                bill.amount || 0
              ).toLocaleString()}
            </Text>

            <View
              style={{
                marginTop: 18,
                borderTopWidth: 1,
                borderTopColor: c.line,
                paddingTop: 14,
              }}
            >
              <View style={reviewRow}>
                <Text style={reviewLabel}>
                  Paid with
                </Text>

                <Text style={reviewValue}>
                  {selectedSource?.name}
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
                  textAlignVertical: 'top',
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
                : 'Confirm payment'}
            </Text>
          </Pressable>
        </>
      )}

      {step === 4 && savedResult && (
        <>
          <View
            style={{
              backgroundColor: c.green,
              borderRadius: 26,
              padding: 24,
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 30 }}>✓</Text>

            <Text
              style={{
                fontSize: 23,
                fontWeight: '800',
                color: c.ink,
                marginTop: 12,
              }}
            >
              Bill paid
            </Text>

            <Text
              style={{
                fontSize: 30,
                fontWeight: '800',
                color: c.ink,
                marginTop: 7,
              }}
            >
              ₱{Number(
                bill.amount || 0
              ).toLocaleString()}
            </Text>

            <Text
              style={{
                color: c.muted,
                marginTop: 7,
                textAlign: 'center',
              }}
            >
              Paid with {savedResult.sourceName}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.navigate('/bills')
            }
            style={primaryButton}
          >
            <Text style={primaryText}>
              Back to bills
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.navigate('/transactions')
            }
            style={[
              secondaryButton,
              {
                marginTop: 10,
                width: '100%',
              },
            ]}
          >
            <Text style={secondaryText}>
              View transactions
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