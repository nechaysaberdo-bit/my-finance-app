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
  addLoan,
  getAccounts,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  tealSoft: '#DDF7F1',
  yellow: '#FFF4D6',
  pink: '#FBE8ED',
  purple: '#F1E6F7',
  blue: '#E7F2FF',
  green: '#E7F5E8',
  line: '#E5EAEA',
};

export default function AddLoan() {
  const router = useRouter();

  const [accounts, setAccounts] =
    useState([]);

  const [step, setStep] =
    useState(1);

  const [owner, setOwner] =
    useState('mine');

  const [name, setName] =
    useState('');

  const [source, setSource] =
    useState('');

  const [principal, setPrincipal] =
    useState('');

  const [
    remainingBalance,
    setRemainingBalance,
  ] = useState('');

  const [
    interestRate,
    setInterestRate,
  ] = useState('');

  const [
    monthlyPayment,
    setMonthlyPayment,
  ] = useState('');

  const [
    nextDueDate,
    setNextDueDate,
  ] = useState('');

  const [
    moneyReceived,
    setMoneyReceived,
  ] = useState(false);

  const [
    receivedIntoAccountId,
    setReceivedIntoAccountId,
  ] = useState(null);

  const [notes, setNotes] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  async function loadAccounts() {
    const data =
      await getAccounts();

    setAccounts(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(
        'Enter a loan name'
      );
      return;
    }

    if (
      !principal ||
      Number(principal) <= 0
    ) {
      Alert.alert(
        'Enter a valid loan amount'
      );
      return;
    }

    if (
      moneyReceived &&
      !receivedIntoAccountId
    ) {
      Alert.alert(
        'Choose where the money was received'
      );
      return;
    }

    try {
      setSaving(true);

      await addLoan({
        name,
        source,
        principal,

        remainingBalance:
          remainingBalance ||
          principal,

        interestRate,
        monthlyPayment,

        nextDueDate:
          nextDueDate || null,

        owner,

        receivedIntoAccountId:
          moneyReceived
            ? receivedIntoAccountId
            : null,

        notes,
      });

      setStep(5);
    } catch (error) {
      Alert.alert(
        'Could not save loan',
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
      {step !== 5 && (
        <>
          <Text
            style={{
              fontSize: 29,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            Add a loan 💸
          </Text>

          <Text
            style={{
              color: c.muted,
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            Let’s understand this debt before adding it.
          </Text>
        </>
      )}

      {step === 1 && (
        <>
          <Text style={question}>
            Whose loan is this?
          </Text>

          <ChoiceCard
            emoji="🌷"
            title="My loan"
            subtitle="A debt that belongs to me"
            selected={
              owner === 'mine'
            }
            color={c.pink}
            onPress={() =>
              setOwner('mine')
            }
          />

          <ChoiceCard
            emoji="👥"
            title="Someone else's loan"
            subtitle="I want to track it, but it isn't my debt"
            selected={
              owner === 'other'
            }
            color={c.blue}
            onPress={() =>
              setOwner('other')
            }
          />

          <Pressable
            onPress={() =>
              setStep(2)
            }
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
            Tell me about the loan
          </Text>

          <View style={whiteCard}>
            <Text style={label}>
              Loan name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Example: BPI Personal Loan"
              style={input}
            />

            <Text style={label}>
              Lender / provider
            </Text>

            <TextInput
              value={source}
              onChangeText={setSource}
              placeholder="Example: BPI"
              style={input}
            />

            <Text style={label}>
              Original loan amount
            </Text>

            <MoneyInput
              value={principal}
              onChangeText={
                setPrincipal
              }
            />

            <Text style={label}>
              Current remaining balance
            </Text>

            <MoneyInput
              value={
                remainingBalance
              }
              onChangeText={
                setRemainingBalance
              }
              placeholder={
                principal ||
                '0.00'
              }
            />

            <Text
              style={{
                color: c.muted,
                fontSize: 11,
                marginTop: -8,
              }}
            >
              Leave blank if this is a new loan.
            </Text>
          </View>

          <View style={buttonRow}>
            <BackButton
              onPress={() =>
                setStep(1)
              }
            />

            <ContinueButton
              onPress={() => {
                if (
                  !name.trim()
                ) {
                  Alert.alert(
                    'Enter a loan name'
                  );
                  return;
                }

                if (
                  !principal ||
                  Number(
                    principal
                  ) <= 0
                ) {
                  Alert.alert(
                    'Enter the original loan amount'
                  );
                  return;
                }

                setStep(3);
              }}
            />
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={question}>
            Did this loan put money into one of your accounts?
          </Text>

          <Text
            style={{
              color: c.muted,
              lineHeight: 20,
              marginBottom: 14,
            }}
          >
            Choose Yes only if you actually received the borrowed money as cash, into a bank account, or into an e-wallet.
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() =>
                setMoneyReceived(
                  true
                )
              }
              style={{
                flex: 1,
                padding: 17,
                borderRadius: 20,
                backgroundColor:
                  moneyReceived
                    ? c.green
                    : c.card,
                borderWidth: 1,
                borderColor:
                  moneyReceived
                    ? c.teal
                    : c.line,
              }}
            >
              <Text
                style={{
                  fontSize: 19,
                }}
              >
                💰
              </Text>

              <Text
                style={{
                  color: c.ink,
                  fontWeight: '800',
                  marginTop: 6,
                }}
              >
                Yes
              </Text>

              <Text
                style={{
                  color: c.muted,
                  fontSize: 11,
                  marginTop: 3,
                }}
              >
                I received the funds
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMoneyReceived(
                  false
                );

                setReceivedIntoAccountId(
                  null
                );
              }}
              style={{
                flex: 1,
                padding: 17,
                borderRadius: 20,
                backgroundColor:
                  !moneyReceived
                    ? c.purple
                    : c.card,
                borderWidth: 1,
                borderColor:
                  !moneyReceived
                    ? c.teal
                    : c.line,
              }}
            >
              <Text
                style={{
                  fontSize: 19,
                }}
              >
                📝
              </Text>

              <Text
                style={{
                  color: c.ink,
                  fontWeight: '800',
                  marginTop: 6,
                }}
              >
                No
              </Text>

              <Text
                style={{
                  color: c.muted,
                  fontSize: 11,
                  marginTop: 3,
                }}
              >
                Just track the debt
              </Text>
            </Pressable>
          </View>

          {moneyReceived && (
            <>
              <Text style={question}>
                Where did the money go?
              </Text>

              {accounts.length ===
              0 ? (
                <View
                  style={whiteCard}
                >
                  <Text
                    style={{
                      color:
                        c.muted,
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
                        account.id
                      ) ===
                      String(
                        receivedIntoAccountId
                      );

                    return (
                      <Pressable
                        key={
                          account.id
                        }
                        onPress={() =>
                          setReceivedIntoAccountId(
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
                          padding: 14,
                          borderWidth: 1,

                          borderColor:
                            selected
                              ? c.teal
                              : c.line,

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
                              fontSize:
                                11,
                              marginTop:
                                3,
                            }}
                          >
                            Current balance
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
            <BackButton
              onPress={() =>
                setStep(2)
              }
            />

            <ContinueButton
              onPress={() => {
                if (
                  moneyReceived &&
                  !receivedIntoAccountId
                ) {
                  Alert.alert(
                    'Choose the receiving account'
                  );
                  return;
                }

                setStep(4);
              }}
            />
          </View>
        </>
      )}

      {step === 4 && (
        <>
          <Text style={question}>
            Payment details
          </Text>

          <View style={whiteCard}>
            <Text style={label}>
              Interest rate
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TextInput
                value={interestRate}
                onChangeText={
                  setInterestRate
                }
                keyboardType="decimal-pad"
                placeholder="0"
                style={[
                  input,
                  {
                    flex: 1,
                  },
                ]}
              />

              <Text
                style={{
                  color: c.ink,
                  fontWeight: '800',
                  marginLeft: 8,
                  marginBottom: 16,
                }}
              >
                %
              </Text>
            </View>

            <Text style={label}>
              Regular payment
            </Text>

            <MoneyInput
              value={monthlyPayment}
              onChangeText={
                setMonthlyPayment
              }
            />

            <Text style={label}>
              Next due date
            </Text>

            <TextInput
              value={nextDueDate}
              onChangeText={
                setNextDueDate
              }
              placeholder="YYYY-MM-DD"
              style={input}
            />

            <Text
              style={{
                color: c.muted,
                fontSize: 11,
                marginTop: -8,
                marginBottom: 18,
              }}
            >
              We'll change this to the calendar picker with the other date fields later.
            </Text>

            <Text style={label}>
              Notes
            </Text>

            <TextInput
              value={notes}
              onChangeText={
                setNotes
              }
              placeholder="Optional"
              multiline
              style={[
                input,
                {
                  minHeight: 75,
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
              LOAN TO TRACK
            </Text>

            <Text
              style={{
                color: c.ink,
                fontSize: 19,
                fontWeight: '800',
                marginTop: 4,
              }}
            >
              {name}
            </Text>

            <Text
              style={{
                color: c.ink,
                fontSize: 29,
                fontWeight: '800',
                marginTop: 6,
              }}
            >
              ₱
              {Number(
                remainingBalance ||
                  principal ||
                  0
              ).toLocaleString()}
            </Text>

            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginTop: 5,
              }}
            >
              {owner === 'mine'
                ? 'My loan'
                : "Someone else's loan"}
              {source
                ? ` · ${source}`
                : ''}
            </Text>
          </View>

          <View style={buttonRow}>
            <BackButton
              onPress={() =>
                setStep(3)
              }
            />

            <Pressable
              onPress={handleSave}
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
                  : 'Add loan'}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {step === 5 && (
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
            <Text
              style={{
                fontSize: 31,
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
              Loan added
            </Text>

            <Text
              style={{
                fontSize: 30,
                fontWeight: '800',
                color: c.ink,
                marginTop: 8,
              }}
            >
              ₱
              {Number(
                remainingBalance ||
                  principal ||
                  0
              ).toLocaleString()}
            </Text>

            {moneyReceived && (
              <Text
                style={{
                  color: c.muted,
                  textAlign:
                    'center',
                  marginTop: 8,
                }}
              >
                The borrowed money was also added to the receiving account.
              </Text>
            )}
          </View>

          <Pressable
            onPress={() =>
              router.replace(
                '/loans'
              )
            }
            style={primaryButton}
          >
            <Text
              style={primaryText}
            >
              View loans
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function ChoiceCard({
  emoji,
  title,
  subtitle,
  selected,
  color,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: selected
          ? color
          : '#FFFFFF',
        borderRadius: 22,
        padding: 17,
        borderWidth: 1,
        borderColor: selected
          ? '#22BDA5'
          : '#E5EAEA',
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          fontSize: 23,
        }}
      >
        {emoji}
      </Text>

      <Text
        style={{
          color: '#45484A',
          fontWeight: '800',
          fontSize: 17,
          marginTop: 7,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: '#92999B',
          fontSize: 12,
          marginTop: 3,
        }}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}

function MoneyInput({
  value,
  onChangeText,
  placeholder = '0.00',
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5EAEA',
        borderRadius: 14,
        paddingHorizontal: 13,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          color: '#45484A',
          fontWeight: '800',
          fontSize: 17,
        }}
      >
        ₱
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: 13,
          color: '#45484A',
          fontSize: 15,
        }}
      />
    </View>
  );
}

function BackButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={secondaryButton}
    >
      <Text style={secondaryText}>
        Back
      </Text>
    </Pressable>
  );
}

function ContinueButton({
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
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
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 14,
  padding: 13,
  color: '#45484A',
  fontSize: 15,
  marginBottom: 16,
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