import React, {
  useCallback,
  useState,
} from 'react';

import {
  ScrollView,
  Text,
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
  getTransactions,
  deleteAccount,
} from '../lib/storage';

const c = {
  bg: '#F6F9F8',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  tealSoft: '#DDF7F1',
  green: '#E9F6E6',
  blue: '#E5F2FC',
  pink: '#FBE8ED',
  line: '#E5EAEA',
  red: '#D96A78',
};

const accountTypeInfo = {
  cash: {
    icon: '💵',
    label: 'Cash',
    bg: c.green,
  },

  bank: {
    icon: '🏦',
    label: 'Bank account',
    bg: c.blue,
  },

  ewallet: {
    icon: '📱',
    label: 'E-Wallet',
    bg: c.tealSoft,
  },

  other: {
    icon: '◉',
    label: 'Other account',
    bg: '#F1E6F7',
  },
};

export default function AccountDetail() {
  const router = useRouter();
  const { id } =
    useLocalSearchParams();

  const [
    account,
    setAccount,
  ] = useState(null);

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  async function loadData() {
    const accounts =
      await getAccounts();

    const allTransactions =
      await getTransactions();

    const foundAccount =
      accounts.find(
        (item) =>
          String(item.id) ===
          String(id)
      );

    setAccount(
      foundAccount || null
    );

    const accountTransactions =
      allTransactions.filter(
        (item) =>
          String(
            item.accountId
          ) === String(id) ||
          String(
            item.fromAccountId
          ) === String(id) ||
          String(
            item.toAccountId
          ) === String(id)
      );

    setTransactions(
      accountTransactions
    );
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  if (!account) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.bg,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 30,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: c.ink,
          }}
        >
          Account not found
        </Text>

        <Pressable
          onPress={() =>
            router.replace(
              '/accounts'
            )
          }
          style={{
            marginTop: 16,
            backgroundColor: c.teal,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '800',
            }}
          >
            Back to accounts
          </Text>
        </Pressable>
      </View>
    );
  }

  const info =
    accountTypeInfo[
      account.type
    ] ||
    accountTypeInfo.other;

  function handleDelete() {
    const balance =
      Number(
        account.balance || 0
      );

    const activityCount =
      transactions.length;

    const warning =
      balance !== 0
        ? `${account.name} still has a balance of ₱${Math.abs(
            balance
          ).toLocaleString()}. Deleting it will remove the account from your current balances, but historical transactions will remain.`
        : activityCount > 0
        ? `${account.name} has ${activityCount} historical transaction${
            activityCount === 1
              ? ''
              : 's'
          }. Those transactions will remain in your history.`
        : `Delete ${account.name}?`;

    Alert.alert(
      'Delete account?',
      warning,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              await deleteAccount(
                String(account.id)
              );

              router.replace(
                '/accounts'
              );
            } catch (error) {
              Alert.alert(
                'Could not delete account',
                error?.message ||
                  'Something went wrong.'
              );
            }
          },
        },
      ]
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
        paddingBottom: 120,
        maxWidth: 720,
        width: '100%',
        alignSelf: 'center',
      }}
    >
      {/* HEADER */}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
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

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: c.muted,
            }}
          >
            {info.label}
          </Text>

          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            {account.name}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname:
                '/edit-account',

              params: {
                id: account.id,
              },
            })
          }
          style={{
            backgroundColor:
              c.card,
            borderWidth: 1,
            borderColor:
              c.line,
            borderRadius: 14,
            paddingHorizontal: 13,
            paddingVertical: 9,
          }}
        >
          <Text
            style={{
              color: c.ink,
              fontSize: 12,
              fontWeight: '800',
            }}
          >
            Edit
          </Text>
        </Pressable>
      </View>

      {/* BALANCE */}

      <View
        style={{
          backgroundColor: info.bg,
          borderRadius: 26,
          padding: 20,
          marginBottom: 14,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              backgroundColor:
                '#FFFFFFAA',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 13,
            }}
          >
            <Text
              style={{
                fontSize: 26,
              }}
            >
              {info.icon}
            </Text>
          </View>

          <View>
            <Text
              style={{
                color: c.muted,
                fontSize: 12,
              }}
            >
              Current balance
            </Text>

            <Text
              style={{
                fontSize: 32,
                fontWeight: '800',
                color: c.ink,
                marginTop: 2,
              }}
            >
              ₱
              {Number(
                account.balance ||
                  0
              ).toLocaleString()}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 16,
            paddingTop: 13,
            borderTopWidth: 1,
            borderTopColor:
              '#FFFFFFAA',
            flexDirection: 'row',
            justifyContent:
              'space-between',
          }}
        >
          <Text
            style={{
              color: c.muted,
              fontSize: 12,
            }}
          >
            Safe to Enjoy
          </Text>

          <Text
            style={{
              color: c.ink,
              fontWeight: '700',
              fontSize: 12,
            }}
          >
            {account.includedInAvailable ===
            false
              ? 'Not included'
              : 'Included ✓'}
          </Text>
        </View>
      </View>

      {/* ACTIONS */}

      <View
        style={{
          flexDirection: 'row',
          gap: 9,
          marginBottom: 20,
        }}
      >
        <Pressable
          onPress={() =>
            router.push({
              pathname:
                '/add-income',

              params: {
                accountId:
                  account.id,
              },
            })
          }
          style={actionButton}
        >
          <Text
            style={{
              fontSize: 20,
            }}
          >
            ＋
          </Text>

          <Text
            style={actionText}
          >
            Money in
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname:
                '/add-expense',

              params: {
                accountId:
                  account.id,
              },
            })
          }
          style={actionButton}
        >
          <Text
            style={{
              fontSize: 20,
            }}
          >
            −
          </Text>

          <Text
            style={actionText}
          >
            Money out
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname:
                '/transfer',

              params: {
                fromAccountId:
                  account.id,
              },
            })
          }
          style={[
            actionButton,
            {
              backgroundColor:
                c.teal,
              borderWidth: 0,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 20,
              color: '#FFFFFF',
            }}
          >
            ⇄
          </Text>

          <Text
            style={[
              actionText,
              {
                color:
                  '#FFFFFF',
              },
            ]}
          >
            Transfer
          </Text>
        </Pressable>
      </View>

      {/* ACTIVITY */}

      <View
        style={{
          flexDirection: 'row',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 19,
            fontWeight: '800',
            color: c.ink,
          }}
        >
          Activity
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: c.muted,
          }}
        >
          {transactions.length}{' '}
          transaction
          {transactions.length === 1
            ? ''
            : 's'}
        </Text>
      </View>

      {transactions.length ===
      0 ? (
        <View
          style={{
            backgroundColor:
              c.card,
            borderRadius: 22,
            padding: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: c.line,
          }}
        >
          <Text
            style={{
              fontSize: 32,
            }}
          >
            ✦
          </Text>

          <Text
            style={{
              color: c.ink,
              fontSize: 16,
              fontWeight: '800',
              marginTop: 8,
            }}
          >
            Nothing here yet
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 13,
              textAlign: 'center',
              lineHeight: 19,
              marginTop: 5,
            }}
          >
            Money coming in, going out and transfers will appear here.
          </Text>
        </View>
      ) : (
        transactions.map(
          (item) => {
            const transfer =
              item.type ===
              'transfer';

            const outgoingTransfer =
              transfer &&
              String(
                item.fromAccountId
              ) ===
                String(
                  account.id
                );

            const incoming =
              item.type ===
                'income' ||
              (transfer &&
                !outgoingTransfer);

            return (
              <View
                key={item.id}
                style={{
                  backgroundColor:
                    c.card,
                  borderRadius: 17,
                  padding: 13,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor:
                    c.line,
                  flexDirection:
                    'row',
                  alignItems:
                    'center',
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor:
                      incoming
                        ? c.green
                        : c.pink,
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    marginRight: 11,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {transfer
                      ? '⇄'
                      : incoming
                      ? '↓'
                      : '↑'}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      color: c.ink,
                      fontWeight:
                        '700',
                      fontSize: 14,
                    }}
                  >
                    {item.description ||
                      item.category ||
                      (transfer
                        ? 'Transfer'
                        : 'Transaction')}
                  </Text>

                  <Text
                    style={{
                      color:
                        c.muted,
                      fontSize: 11,
                      marginTop: 3,
                    }}
                  >
                    {item.date
                      ? new Date(
                          item.date
                        ).toLocaleDateString()
                      : 'Today'}
                  </Text>
                </View>

                <Text
                  style={{
                    fontWeight:
                      '800',
                    fontSize: 15,
                    color:
                      incoming
                        ? c.teal
                        : c.ink,
                  }}
                >
                  {incoming
                    ? '+'
                    : '−'}
                  ₱
                  {Number(
                    item.amount ||
                      0
                  ).toLocaleString()}
                </Text>
              </View>
            );
          }
        )
      )}

      {/* DELETE */}

      <View
        style={{
          marginTop: 22,
          paddingTop: 18,
          borderTopWidth: 1,
          borderTopColor: c.line,
        }}
      >
        <Pressable
          onPress={handleDelete}
          style={{
            minHeight: 50,
            borderRadius: 17,
            borderWidth: 1,
            borderColor:
              '#F1C7CF',
            backgroundColor:
              c.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: c.red,
              fontWeight: '800',
              fontSize: 13,
            }}
          >
            Delete account
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const actionButton = {
  flex: 1,
  backgroundColor: '#FFFFFF',
  borderRadius: 18,
  paddingVertical: 13,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E5EAEA',
};

const actionText = {
  color: '#45484A',
  fontWeight: '700',
  fontSize: 12,
  marginTop: 3,
};