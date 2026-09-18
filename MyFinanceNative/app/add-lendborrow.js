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
  getAccounts,
  getCreditCards,
  addLendBorrowRecord,
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
  blue: '#E7F2FF',
  line: '#E5EAEA',
};

export default function AddLendBorrow() {
  const router = useRouter();

  const [accounts, setAccounts] =
    useState([]);

  const [cards, setCards] =
    useState([]);

  const [step, setStep] =
    useState(1);

  const [direction, setDirection] =
    useState(null);

  const [person, setPerson] =
    useState('');

  const [amount, setAmount] =
    useState('');

  const [sourceType, setSourceType] =
    useState(null);

  const [sourceId, setSourceId] =
    useState(null);

  const [notes, setNotes] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  async function loadSources() {
    setAccounts(
      await getAccounts()
    );

    setCards(
      await getCreditCards()
    );
  }

  useFocusEffect(
  useCallback(() => {
    async function resetAndLoad() {
      // Reset the form every time this screen is opened
      setStep(1);
      setDirection(null);
      setPerson('');
      setAmount('');
      setSourceType(null);
      setSourceId(null);
      setNotes('');
      setSaving(false);

      // Reload current accounts and credit cards
      await loadSources();
    }

    resetAndLoad();
  }, [])
);

  async function handleSave() {
    try {
      setSaving(true);

      await addLendBorrowRecord({
        direction,
        person,
        amount,
        sourceType,
        sourceId,
        notes,
      });

      setStep(5);
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
            Lend / Borrow 🤝
          </Text>

          <Text
            style={{
              color: c.muted,
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            Let’s record what happened.
          </Text>
        </>
      )}

      {step === 1 && (
        <>
          <Text style={question}>
            What happened?
          </Text>

          <Pressable
            onPress={() => {
              setDirection('lent');
              setStep(2);
            }}
            style={{
              backgroundColor: c.green,
              borderRadius: 22,
              padding: 18,
              marginBottom: 11,
            }}
          >
            <Text style={{ fontSize: 24 }}>
              🤲
            </Text>

            <Text style={choiceTitle}>
              I lent money
            </Text>

            <Text style={choiceSubtitle}>
              Someone owes me
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setDirection(
                'borrowed'
              );
              setStep(2);
            }}
            style={{
              backgroundColor: c.blue,
              borderRadius: 22,
              padding: 18,
            }}
          >
            <Text style={{ fontSize: 24 }}>
              🙋
            </Text>

            <Text style={choiceTitle}>
              I borrowed money
            </Text>

            <Text style={choiceSubtitle}>
              I owe someone
            </Text>
          </Pressable>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={question}>
            Who is it with?
          </Text>

          <View style={whiteCard}>
            <Text style={label}>
              Person
            </Text>

            <TextInput
              value={person}
              onChangeText={setPerson}
              placeholder="Example: Anna"
              style={input}
            />

            <Text style={label}>
              Amount
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
                  padding: 13,
                  fontSize: 24,
                  fontWeight: '800',
                  color: c.ink,
                }}
              />
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (!person.trim()) {
                Alert.alert(
                  'Enter the person’s name'
                );

                return;
              }

              if (
                Number(amount) <= 0
              ) {
                Alert.alert(
                  'Enter a valid amount'
                );

                return;
              }

              setStep(3);
            }}
            style={primaryButton}
          >
            <Text style={primaryText}>
              Continue
            </Text>
          </Pressable>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={question}>
            {direction === 'lent'
              ? 'Where did the money come from?'
              : 'Where did you receive the money?'}
          </Text>

          {direction === 'lent' && (
            <>
              <Pressable
                onPress={() => {
                  setSourceType(
                    'account'
                  );
                  setSourceId(null);
                }}
                style={{
                  backgroundColor:
                    sourceType ===
                    'account'
                      ? c.green
                      : c.card,
                  borderRadius: 20,
                  padding: 15,
                  borderWidth: 1,
                  borderColor:
                    sourceType ===
                    'account'
                      ? c.teal
                      : c.line,
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
                  setSourceType(
                    'credit_card'
                  );
                  setSourceId(null);
                }}
                style={{
                  backgroundColor:
                    sourceType ===
                    'credit_card'
                      ? c.purple
                      : c.card,
                  borderRadius: 20,
                  padding: 15,
                  borderWidth: 1,
                  borderColor:
                    sourceType ===
                    'credit_card'
                      ? c.teal
                      : c.line,
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
            </>
          )}

          {direction ===
            'borrowed' && (
            <Text
              style={{
                color: c.muted,
                marginBottom: 14,
              }}
            >
              Borrowed money must land in one of your cash, bank, or e-wallet accounts.
            </Text>
          )}

          {(direction ===
            'borrowed' ||
            sourceType ===
              'account') &&
            accounts.map(
              (account) => (
                <Pressable
                  key={account.id}
                  onPress={() => {
                    setSourceType(
                      'account'
                    );
                    setSourceId(
                      String(
                        account.id
                      )
                    );
                  }}
                  style={{
                    backgroundColor:
                      String(
                        sourceId
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
                        sourceId
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
                      account.balance ||
                        0
                    ).toLocaleString()}
                  </Text>
                </Pressable>
              )
            )}

          {sourceType ===
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
                    setSourceId(
                      String(card.id)
                    )
                  }
                  style={{
                    backgroundColor:
                      String(
                        sourceId
                      ) ===
                      String(
                        card.id
                      )
                        ? c.purple
                        : c.card,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor:
                      String(
                        sourceId
                      ) ===
                      String(
                        card.id
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
                      fontWeight: '800',
                    }}
                  >
                    {card.name}
                  </Text>

                  <Text
                    style={{
                      color: c.teal,
                      fontWeight: '800',
                    }}
                  >
                    ₱
                    {available.toLocaleString()}
                  </Text>
                </Pressable>
              );
            })}

          <Pressable
            onPress={() => {
              if (
                !sourceType ||
                !sourceId
              ) {
                Alert.alert(
                  'Choose where the money moved'
                );

                return;
              }

              setStep(4);
            }}
            style={primaryButton}
          >
            <Text style={primaryText}>
              Review
            </Text>
          </Pressable>
        </>
      )}

      {step === 4 && (
        <>
          <Text style={question}>
            Looks right?
          </Text>

          <View style={whiteCard}>
            <Text
              style={{
                textAlign: 'center',
                color: c.muted,
              }}
            >
              {direction === 'lent'
                ? `Lent to ${person}`
                : `Borrowed from ${person}`}
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
              {direction === 'lent'
                ? 'Money leaves your selected source'
                : 'Money enters your selected account'}
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
                : 'Save'}
            </Text>
          </Pressable>
        </>
      )}

      {step === 5 && (
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
              Saved
            </Text>

            <Text
              style={{
                color: c.muted,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              {direction === 'lent'
                ? `${person} now owes you ₱${Number(
                    amount
                  ).toLocaleString()}.`
                : `You now owe ${person} ₱${Number(
                    amount
                  ).toLocaleString()}.`}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.replace(
                '/lendborrow'
              )
            }
            style={primaryButton}
          >
            <Text style={primaryText}>
              View lend / borrow
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

const choiceTitle = {
  color: '#45484A',
  fontSize: 17,
  fontWeight: '800',
  marginTop: 7,
};

const choiceSubtitle = {
  color: '#92999B',
  fontSize: 12,
  marginTop: 3,
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
  borderRadius: 16,
  paddingHorizontal: 13,
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