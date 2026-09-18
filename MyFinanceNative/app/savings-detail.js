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
  getSavingsGoals,
  getAccounts,
  getTransactions,
  depositToSavings,
  withdrawFromSavings,
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
  blue: '#E7F2FF',
  line: '#E5EAEA',
  red: '#D96A78',
};

export default function SavingsDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [mode, setMode] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function loadData() {
    const goalData = await getSavingsGoals();
    const accountData = await getAccounts();
    const txData = await getTransactions();

    setGoals(goalData);
    setAccounts(accountData);

    setTransactions(
      txData.filter(
        (item) =>
          String(item.savingsGoalId) === String(id)
      )
    );
  }

  useFocusEffect(
    useCallback(() => {
      setMode(null);
      setAmount('');
      setAccountId(null);
      setNotes('');
      setSuccessMessage('');
      loadData();
    }, [id])
  );

  const goal = useMemo(
    () =>
      goals.find(
        (item) =>
          String(item.id) === String(id)
      ),
    [goals, id]
  );

  const selectedAccount = useMemo(
    () =>
      accounts.find(
        (item) =>
          String(item.id) === String(accountId)
      ),
    [accounts, accountId]
  );

  if (!goal) {
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
          Savings goal not found
        </Text>
      </View>
    );
  }

  const current =
    Number(goal.currentAmount || 0);

  const target =
    Number(goal.targetAmount || 0);

  const progress =
    target > 0
      ? Math.min(
          (current / target) * 100,
          100
        )
      : 0;

  const remaining =
    Math.max(
      target - current,
      0
    );

  async function handleSave() {
    if (saving) return;

    const numericAmount =
      Number(amount || 0);

    if (numericAmount <= 0) {
      Alert.alert(
        'Enter a valid amount'
      );
      return;
    }

    if (!accountId) {
      Alert.alert(
        mode === 'deposit'
          ? 'Choose the source account'
          : 'Choose where the money should go'
      );
      return;
    }

    try {
      setSaving(true);

      if (mode === 'deposit') {
        const result =
          await depositToSavings({
            goalId: goal.id,
            accountId,
            amount: numericAmount,
            notes,
          });

        setSuccessMessage(
          `₱${numericAmount.toLocaleString()} added to ${goal.name}.`
        );
      }

      if (mode === 'withdraw') {
        const result =
          await withdrawFromSavings({
            goalId: goal.id,
            accountId,
            amount: numericAmount,
            notes,
          });

        setSuccessMessage(
          `₱${numericAmount.toLocaleString()} withdrawn from ${goal.name}.`
        );
      }

      setMode(null);
      setAmount('');
      setAccountId(null);
      setNotes('');

      await loadData();
    } catch (error) {
      Alert.alert(
        mode === 'deposit'
          ? 'Could not add savings'
          : 'Could not withdraw savings',
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
        maxWidth: 720,
        width: '100%',
        alignSelf: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 15,
            backgroundColor: c.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              color: c.ink,
            }}
          >
            ‹
          </Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: c.muted,
              fontSize: 12,
            }}
          >
            Savings goal
          </Text>

          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            {goal.name} 🌱
          </Text>
        </View>
      </View>

      {successMessage ? (
        <View
          style={{
            backgroundColor: c.green,
            borderRadius: 18,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              color: c.teal,
              fontWeight: '800',
            }}
          >
            ✓ {successMessage}
          </Text>
        </View>
      ) : null}

      <View
        style={{
          backgroundColor: c.green,
          borderRadius: 26,
          padding: 20,
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            color: c.muted,
            fontSize: 12,
          }}
        >
          SAVED
        </Text>

        <Text
          style={{
            fontSize: 34,
            fontWeight: '800',
            color: c.ink,
            marginTop: 5,
          }}
        >
          ₱{current.toLocaleString()}
        </Text>

        <Text
          style={{
            color: c.muted,
            marginTop: 4,
          }}
        >
          Target: ₱{target.toLocaleString()}
        </Text>

        <View
          style={{
            height: 9,
            backgroundColor: '#FFFFFF99',
            borderRadius: 99,
            overflow: 'hidden',
            marginTop: 14,
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: 9,
              borderRadius: 99,
              backgroundColor: c.teal,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 7,
          }}
        >
          <Text
            style={{
              color: c.muted,
              fontSize: 11,
            }}
          >
            {progress.toFixed(0)}% complete
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 11,
            }}
          >
            ₱{remaining.toLocaleString()} to go
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <Pressable
          onPress={() => {
            setMode('deposit');
            setAmount('');
            setAccountId(null);
            setNotes('');
            setSuccessMessage('');
          }}
          style={{
            flex: 1,
            minHeight: 54,
            borderRadius: 18,
            backgroundColor: c.teal,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '800',
            }}
          >
            + Add money
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setMode('withdraw');
            setAmount('');
            setAccountId(null);
            setNotes('');
            setSuccessMessage('');
          }}
          style={{
            flex: 1,
            minHeight: 54,
            borderRadius: 18,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.line,
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
            Withdraw
          </Text>
        </Pressable>
      </View>

      {mode && (
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: c.line,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginBottom: 12,
            }}
          >
            {mode === 'deposit'
              ? 'Add to savings'
              : 'Withdraw from savings'}
          </Text>

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
              style={moneyTextInput}
            />
          </View>

          <Text
            style={[
              label,
              {
                marginTop: 16,
              },
            ]}
          >
            {mode === 'deposit'
              ? 'Take money from'
              : 'Send money to'}
          </Text>

          {accounts.map((account) => {
            const selected =
              String(accountId) ===
              String(account.id);

            return (
              <Pressable
                key={account.id}
                onPress={() =>
                  setAccountId(
                    String(account.id)
                  )
                }
                style={{
                  backgroundColor: selected
                    ? c.tealSoft
                    : c.card,

                  borderRadius: 18,
                  borderWidth: 1,

                  borderColor: selected
                    ? c.teal
                    : c.line,

                  padding: 14,
                  marginBottom: 8,

                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
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
                      color: c.muted,
                      fontSize: 11,
                      marginTop: 3,
                    }}
                  >
                    Balance
                  </Text>
                </View>

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
            );
          })}

          <Text
            style={[
              label,
              {
                marginTop: 10,
              },
            ]}
          >
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
                textAlignVertical: 'top',
              },
            ]}
          />

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginTop: 12,
            }}
          >
            <Pressable
              onPress={() => {
                setMode(null);
                setAmount('');
                setAccountId(null);
                setNotes('');
              }}
              style={secondaryButton}
            >
              <Text style={secondaryText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[
                primaryButton,
                {
                  flex: 2,
                },
                saving && {
                  opacity: 0.65,
                },
              ]}
            >
              <Text style={primaryText}>
                {saving
                  ? 'Saving...'
                  : mode === 'deposit'
                  ? 'Add money'
                  : 'Withdraw'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: c.line,
          padding: 16,
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: c.ink,
            marginBottom: 10,
          }}
        >
          Goal details
        </Text>

        {[
          [
            'Target',
            `₱${target.toLocaleString()}`,
          ],
          [
            'Current',
            `₱${current.toLocaleString()}`,
          ],
          [
            'Protected',
            goal.excludeFromSafeToEnjoy
              ? 'Yes'
              : 'No',
          ],
          [
            'Status',
            goal.status || 'active',
          ],
        ].map(([labelText, value]) => (
          <View
            key={labelText}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: c.line,
            }}
          >
            <Text
              style={{
                color: c.muted,
              }}
            >
              {labelText}
            </Text>

            <Text
              style={{
                color: c.ink,
                fontWeight: '800',
              }}
            >
              {value}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: c.line,
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: c.ink,
            marginBottom: 10,
          }}
        >
          Activity
        </Text>

        {transactions.length === 0 ? (
          <Text
            style={{
              color: c.muted,
            }}
          >
            No savings activity yet.
          </Text>
        ) : (
          transactions.map((item) => {
            const deposit =
              item.subtype ===
              'savings_deposit';

            return (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: c.line,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: c.ink,
                      fontWeight: '700',
                    }}
                  >
                    {item.description}
                  </Text>

                  <Text
                    style={{
                      color: c.muted,
                      fontSize: 11,
                      marginTop: 3,
                    }}
                  >
                    {item.accountName || ''}
                    {item.date
                      ? ` · ${new Date(
                          item.date
                        ).toLocaleDateString()}`
                      : ''}
                  </Text>
                </View>

                <Text
                  style={{
                    color: deposit
                      ? c.teal
                      : c.ink,
                    fontWeight: '800',
                  }}
                >
                  {deposit ? '+' : '−'}₱
                  {Number(
                    item.amount || 0
                  ).toLocaleString()}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const label = {
  color: '#92999B',
  fontSize: 12,
  fontWeight: '600',
  marginBottom: 7,
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