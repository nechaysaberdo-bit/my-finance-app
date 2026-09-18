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
  getBills,
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
  blue: '#E7F2FF',
  line: '#E5EAEA',
  red: '#D96A78',
};

export default function Bills() {
  const router = useRouter();

  const [bills, setBills] = useState([]);

  async function loadBills() {
    const data = await getBills();
    setBills(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [])
  );

  function getBillStatus(bill) {
    if (bill.status === 'paid') {
      return {
        label: 'Paid',
        bg: c.green,
        color: c.teal,
      };
    }

    if (!bill.dueDate) {
      return {
        label: 'Upcoming',
        bg: c.blue,
        color: c.ink,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(
      `${bill.dueDate}T00:00:00`
    );

    const difference =
      Math.ceil(
        (due.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    if (difference < 0) {
      return {
        label: 'Overdue',
        bg: c.pink,
        color: c.red,
      };
    }

    if (difference === 0) {
      return {
        label: 'Due today',
        bg: c.pink,
        color: c.red,
      };
    }

    if (difference <= 7) {
      return {
        label: 'Due soon',
        bg: c.yellow,
        color: c.ink,
      };
    }

    return {
      label: 'Upcoming',
      bg: c.blue,
      color: c.ink,
    };
  }

  function formatDueDate(dateString) {
    if (!dateString) {
      return 'No due date';
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      undefined,
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  }

  const unpaidBills = bills.filter(
    (bill) => bill.status !== 'paid'
  );

  const totalUpcoming =
    unpaidBills.reduce(
      (sum, bill) =>
        sum + Number(bill.amount || 0),
      0
    );

  const overdueBills =
    unpaidBills.filter((bill) => {
      if (!bill.dueDate) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const due = new Date(
        `${bill.dueDate}T00:00:00`
      );

      return due < today;
    });

  const overdueTotal =
    overdueBills.reduce(
      (sum, bill) =>
        sum + Number(bill.amount || 0),
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
        Bills 🧾
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Know what’s coming before the money leaves.
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
            backgroundColor: c.yellow,
            borderRadius: 20,
            padding: 15,
          }}
        >
          <Text
            style={{
              color: c.muted,
              fontSize: 12,
            }}
          >
            TO PAY
          </Text>

          <Text
            style={{
              fontSize: 23,
              fontWeight: '800',
              color: c.ink,
              marginTop: 5,
            }}
          >
            ₱{totalUpcoming.toLocaleString()}
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 11,
              marginTop: 4,
            }}
          >
            {unpaidBills.length} bill
            {unpaidBills.length === 1
              ? ''
              : 's'}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor:
              overdueBills.length > 0
                ? c.pink
                : c.green,
            borderRadius: 20,
            padding: 15,
          }}
        >
          <Text
            style={{
              color: c.muted,
              fontSize: 12,
            }}
          >
            OVERDUE
          </Text>

          <Text
            style={{
              fontSize: 23,
              fontWeight: '800',
              color:
                overdueBills.length > 0
                  ? c.red
                  : c.teal,
              marginTop: 5,
            }}
          >
            ₱{overdueTotal.toLocaleString()}
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 11,
              marginTop: 4,
            }}
          >
            {overdueBills.length === 0
              ? 'All clear ✨'
              : `${overdueBills.length} overdue`}
          </Text>
        </View>
      </View>

      {bills.length === 0 ? (
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: c.line,
            padding: 24,
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 34,
            }}
          >
            🧾
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginTop: 9,
            }}
          >
            Nothing due yet
          </Text>

          <Text
            style={{
              color: c.muted,
              textAlign: 'center',
              marginTop: 6,
              lineHeight: 19,
            }}
          >
            Add recurring bills and upcoming
            payments so they don’t surprise you.
          </Text>
        </View>
      ) : (
        bills.map((bill) => {
          const status =
            getBillStatus(bill);

          return (
            <View
              key={bill.id}
              style={{
                backgroundColor: c.card,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: c.line,
                padding: 16,
                marginBottom: 11,
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
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor:
                      status.bg,
                    alignItems: 'center',
                    justifyContent:
                      'center',
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 21,
                    }}
                  >
                    {bill.category ===
                    'Utilities'
                      ? '💡'
                      : bill.category ===
                        'Internet'
                      ? '🌐'
                      : bill.category ===
                        'Phone'
                      ? '📱'
                      : bill.category ===
                        'Rent'
                      ? '🏠'
                      : bill.category ===
                        'Insurance'
                      ? '🛡️'
                      : bill.category ===
                        'School'
                      ? '🎓'
                      : '🧾'}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '800',
                      color: c.ink,
                    }}
                  >
                    {bill.name}
                  </Text>

                  <Text
                    style={{
                      color: c.muted,
                      fontSize: 12,
                      marginTop: 3,
                    }}
                  >
                    {bill.category}
                    {bill.recurring
                      ? ` · ${bill.frequency}`
                      : ''}
                  </Text>
                </View>

                <View
                  style={{
                    alignItems: 'flex-end',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '800',
                      color: c.ink,
                    }}
                  >
                    ₱
                    {Number(
                      bill.amount || 0
                    ).toLocaleString()}
                  </Text>

                  <View
                    style={{
                      backgroundColor:
                        status.bg,
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      borderRadius: 999,
                      marginTop: 5,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          status.color,
                        fontSize: 10,
                        fontWeight: '800',
                      }}
                    >
                      {status.label}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: c.line,
                  marginTop: 13,
                  paddingTop: 11,
                  flexDirection: 'row',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Text
                    style={{
                      color: c.muted,
                      fontSize: 11,
                    }}
                  >
                    DUE
                  </Text>

                  <Text
                    style={{
                      color: c.ink,
                      fontSize: 13,
                      fontWeight: '700',
                      marginTop: 2,
                    }}
                  >
                    {formatDueDate(
                      bill.dueDate
                    )}
                  </Text>

                  {bill.autopay && (
                    <Text
                      style={{
                        color: c.teal,
                        fontSize: 11,
                        fontWeight: '700',
                        marginTop: 3,
                      }}
                    >
                      Autopay
                    </Text>
                  )}
                </View>

                {bill.status !==
                  'paid' && (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname:
                          '/pay-bill',
                        params: {
                          id: bill.id,
                        },
                      })
                    }
                    style={{
                      backgroundColor:
                        c.teal,
                      minHeight: 44,
                      paddingHorizontal: 18,
                      borderRadius: 15,
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                    }}
                  >
                    <Text
                      style={{
                        color:
                          '#FFFFFF',
                        fontWeight:
                          '800',
                      }}
                    >
                      Pay
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })
      )}

      <Pressable
        onPress={() =>
          router.push('/add-bill')
        }
        style={{
          backgroundColor: c.teal,
          minHeight: 54,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 3,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          ＋ Add bill
        </Text>
      </Pressable>
    </ScrollView>
  );
}