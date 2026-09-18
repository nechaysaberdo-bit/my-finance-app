import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  getTransactions,
  deleteTransaction,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  green: '#E7F5E8',
  yellow: '#FFF4D6',
  pink: '#FBE8ED',
  line: '#E5EAEA',
  red: '#D96A78',
};

export default function Transactions() {
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);

  async function loadTransactions() {
    const data = await getTransactions();
    setTransactions(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  async function handleDelete(id) {
    await deleteTransaction(id);
    await loadTransactions();
  }

  const incomeTotal = transactions
    .filter((item) => item.type === 'income')
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const expenseTotal = transactions
    .filter((item) => item.type === 'expense')
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: c.bg,
      }}
      contentContainerStyle={{
        padding: 18,
        paddingBottom: 110,
        maxWidth: 760,
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
        Transactions
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Everything coming in, going out and moving between accounts.
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginBottom: 18,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: c.green,
            borderRadius: 18,
            padding: 14,
          }}
        >
          <Text style={{ color: c.muted }}>
            Income
          </Text>

          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: c.teal,
              marginTop: 4,
            }}
          >
            ₱{incomeTotal.toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: c.yellow,
            borderRadius: 18,
            padding: 14,
          }}
        >
          <Text style={{ color: c.muted }}>
            Expenses
          </Text>

          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: c.ink,
              marginTop: 4,
            }}
          >
            ₱{expenseTotal.toLocaleString()}
          </Text>
        </View>
      </View>

      {transactions.length === 0 ? (
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 22,
            padding: 24,
            borderWidth: 1,
            borderColor: c.line,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 32 }}>
            ✦
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginTop: 8,
            }}
          >
            No transactions yet
          </Text>

          <Text
            style={{
              color: c.muted,
              textAlign: 'center',
              marginTop: 6,
              lineHeight: 19,
            }}
          >
            Add income, expenses or transfers and they’ll appear here.
          </Text>
        </View>
      ) : (
        transactions.map((item) => {
          const isIncome = item.type === 'income';
          const isTransfer = item.type === 'transfer';

          return (
            <View
              key={item.id}
              style={{
                backgroundColor: c.card,
                borderRadius: 19,
                borderWidth: 1,
                borderColor: c.line,
                padding: 14,
                marginBottom: 10,
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
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: isIncome
                      ? c.green
                      : isTransfer
                      ? '#E7F2FF'
                      : c.pink,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 11,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>
                    {isIncome
                      ? '↓'
                      : isTransfer
                      ? '⇄'
                      : '↑'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '800',
                      color: c.ink,
                    }}
                  >
                    {item.description ||
                      item.category ||
                      (isTransfer
                        ? 'Transfer'
                        : 'Transaction')}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: c.muted,
                      marginTop: 3,
                    }}
                  >
                    {item.category || item.type}
                    {item.accountName
                      ? ` · ${item.accountName}`
                      : ''}
                  </Text>

                  <Text
                    style={{
                      fontSize: 11,
                      color: c.muted,
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
                    fontSize: 16,
                    fontWeight: '800',
                    color: isIncome
                      ? c.teal
                      : c.ink,
                  }}
                >
                  {isTransfer
                    ? ''
                    : isIncome
                    ? '+'
                    : '−'}
                  ₱
                  {Number(
                    item.amount || 0
                  ).toLocaleString()}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginTop: 8,
                }}
              >
                <Pressable
                  onPress={() =>
                    handleDelete(item.id)
                  }
                  style={{
                    minHeight: 44,
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                  }}
                >
                  <Text
                    style={{
                      color: c.red,
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}