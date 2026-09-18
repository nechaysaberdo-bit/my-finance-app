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
} from 'react-native';

import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  getCreditCards,
  deleteCreditCard,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  tealSoft: '#DDF7F1',
  purple: '#F1E6F7',
  pink: '#FBE8ED',
  yellow: '#FFF4D6',
  blue: '#E7F2FF',
  line: '#E5EAEA',
  red: '#D96A78',
};

export default function CardDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [cards, setCards] = useState([]);

  async function loadCards() {
    const data = await getCreditCards();
    setCards(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [id])
  );

  const card = useMemo(
    () =>
      cards.find(
        (item) =>
          String(item.id) === String(id)
      ),
    [cards, id]
  );

  // ==============================
  // CARD NOT FOUND
  // ==============================

  if (!card) {
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
          Card not found
        </Text>

        <Pressable
          onPress={() =>
            router.replace('/credit')
          }
          style={{
            marginTop: 16,
            backgroundColor: c.teal,
            borderRadius: 16,
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '800',
            }}
          >
            Back to cards
          </Text>
        </Pressable>
      </View>
    );
  }

  // ==============================
  // DELETE CARD
  // ==============================

  function handleDeleteCard() {
    Alert.alert(
      'Delete credit card?',
      `Delete ${card.name}? Historical transactions will remain, but this card will no longer be available as a payment source.`,
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
              await deleteCreditCard(
                card.id
              );

              router.replace(
                '/credit'
              );
            } catch (error) {
              Alert.alert(
                'Could not delete card',
                error?.message ||
                  'Something went wrong.'
              );
            }
          },
        },
      ]
    );
  }

  // ==============================
  // CARD CALCULATIONS
  // ==============================

  const creditLimit =
    Number(card.creditLimit || 0);

  const currentBalance =
    Number(card.currentBalance || 0);

  const statementBalance =
    Number(card.statementBalance || 0);

  const amountDue =
    Number(card.amountDue || 0);

  const minimumDue =
    Number(card.minimumDue || 0);

  const availableCredit =
    Math.max(
      creditLimit - currentBalance,
      0
    );

  const utilization =
    creditLimit > 0
      ? Math.min(
          (
            currentBalance /
            creditLimit
          ) * 100,
          100
        )
      : 0;

  const dueStatus =
    getDueStatus(
      card.dueDate,
      amountDue
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
            {card.issuer ||
              'Credit Card'}
          </Text>

          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            {card.name} 💳
          </Text>
        </View>
      </View>

      {/* CURRENT BALANCE */}

      <View
        style={{
          backgroundColor: c.purple,
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
          CURRENT BALANCE
        </Text>

        <Text
          style={{
            fontSize: 34,
            fontWeight: '800',
            color: c.ink,
            marginTop: 4,
          }}
        >
          ₱{currentBalance.toLocaleString()}
        </Text>

        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={{
                color: c.muted,
                fontSize: 11,
              }}
            >
              CREDIT LIMIT
            </Text>

            <Text
              style={{
                fontWeight: '800',
                color: c.ink,
                marginTop: 3,
              }}
            >
              ₱{creditLimit.toLocaleString()}
            </Text>
          </View>

          <View
            style={{
              alignItems: 'flex-end',
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 11,
              }}
            >
              AVAILABLE
            </Text>

            <Text
              style={{
                fontWeight: '800',
                color: c.teal,
                marginTop: 3,
              }}
            >
              ₱{availableCredit.toLocaleString()}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 8,
            backgroundColor: '#FFFFFF99',
            borderRadius: 99,
            marginTop: 14,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${utilization}%`,
              height: 8,
              backgroundColor:
                utilization >= 80
                  ? c.red
                  : c.teal,
              borderRadius: 99,
            }}
          />
        </View>

        <Text
          style={{
            color: c.muted,
            fontSize: 11,
            marginTop: 7,
          }}
        >
          {utilization.toFixed(0)}% utilization
        </Text>
      </View>

      {/* CURRENT STATEMENT */}

      <View
        style={{
          backgroundColor: c.yellow,
          borderRadius: 22,
          padding: 17,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 11,
              }}
            >
              AMOUNT DUE
            </Text>

            <Text
              style={{
                color: c.ink,
                fontSize: 29,
                fontWeight: '800',
                marginTop: 4,
              }}
            >
              ₱{amountDue.toLocaleString()}
            </Text>

            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Statement: ₱
              {statementBalance.toLocaleString()}
            </Text>
          </View>

          <View
            style={{
              backgroundColor:
                dueStatus.bg,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                color:
                  dueStatus.color,
                fontSize: 10,
                fontWeight: '800',
              }}
            >
              {dueStatus.label}
            </Text>
          </View>
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#E9DBB8',
            marginTop: 14,
            paddingTop: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={{
                color: c.muted,
                fontSize: 10,
              }}
            >
              DUE DATE
            </Text>

            <Text
              style={{
                color: c.ink,
                fontWeight: '800',
                marginTop: 2,
              }}
            >
              {card.dueDate
                ? formatDate(
                    card.dueDate
                  )
                : 'Not set'}
            </Text>
          </View>

          <View
            style={{
              alignItems: 'flex-end',
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 10,
              }}
            >
              MINIMUM
            </Text>

            <Text
              style={{
                color: c.ink,
                fontWeight: '800',
                marginTop: 2,
              }}
            >
              ₱{minimumDue.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* EDIT + UPDATE STATEMENT */}

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <Pressable
          onPress={() =>
            router.push({
              pathname:
                '/edit-credit-card',
              params: {
                cardId: card.id,
              },
            })
          }
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: 16,
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
              fontSize: 13,
            }}
          >
            Edit card info
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname:
                '/update-statement',
              params: {
                cardId: card.id,
              },
            })
          }
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: 16,
            backgroundColor:
              c.tealSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: c.teal,
              fontWeight: '800',
              fontSize: 13,
            }}
          >
            Update statement
          </Text>
        </Pressable>
      </View>

      {/* CARD DETAILS */}

      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 22,
          padding: 16,
          borderWidth: 1,
          borderColor: c.line,
          marginBottom: 14,
        }}
      >
        <DetailRow
          label="Issuer"
          value={
            card.issuer || '—'
          }
        />

        <DetailRow
          label="Statement date"
          value={
            card.statementDate
              ? formatDate(
                  card.statementDate
                )
              : 'Not set'
          }
        />

        <DetailRow
          label="Cutoff day"
          value={
            card.cutoffDay
              ? `Day ${card.cutoffDay}`
              : 'Not set'
          }
        />

        <DetailRow
          label="Due after cutoff"
          value={
            card.dueDaysAfterCutoff
              ? `${card.dueDaysAfterCutoff} days`
              : '—'
          }
        />

        <DetailRow
          label="Statement balance"
          value={`₱${statementBalance.toLocaleString()}`}
        />

        <DetailRow
          label="Amount due"
          value={`₱${amountDue.toLocaleString()}`}
        />

        <DetailRow
          label="Minimum due"
          value={`₱${minimumDue.toLocaleString()}`}
        />

        <DetailRow
          label="Status"
          value={
            card.status ||
            'active'
          }
          last
        />
      </View>

      {/* INSTALLMENTS + SOA */}

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <Pressable
          onPress={() =>
            router.push({
              pathname:
                '/installment',
              params: {
                cardId: card.id,
              },
            })
          }
          style={secondaryAction}
        >
          <Text
            style={{
              color: c.ink,
              fontWeight: '800',
            }}
          >
            Installments
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname: '/soa',
              params: {
                cardId: card.id,
              },
            })
          }
          style={secondaryAction}
        >
          <Text
            style={{
              color: c.ink,
              fontWeight: '800',
            }}
          >
            SOA
          </Text>
        </Pressable>
      </View>

      {/* RECORD PAYMENT */}

      <Pressable
        style={{
          backgroundColor: c.teal,
          minHeight: 54,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 12,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontWeight: '800',
          }}
        >
          Record card payment
        </Text>
      </Pressable>

      {/* DELETE */}

      <Pressable
        onPress={handleDeleteCard}
        style={{
          minHeight: 50,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 12,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: '#F1C7CF',
        }}
      >
        <Text
          style={{
            color: c.red,
            fontWeight: '800',
            fontSize: 13,
          }}
        >
          Delete credit card
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// ==============================
// DETAIL ROW
// ==============================

function DetailRow({
  label,
  value,
  last = false,
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth:
          last ? 0 : 1,
        borderBottomColor:
          '#E5EAEA',
      }}
    >
      <Text
        style={{
          color: '#92999B',
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: '#45484A',
          fontWeight: '800',
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// ==============================
// DUE STATUS
// ==============================

function getDueStatus(
  dueDate,
  amountDue
) {
  if (
    Number(amountDue || 0) <= 0
  ) {
    return {
      label: 'Nothing due',
      bg: '#E7F5E8',
      color: '#22BDA5',
    };
  }

  if (!dueDate) {
    return {
      label: 'Due',
      bg: '#F1E6F7',
      color: '#45484A',
    };
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const due =
    new Date(
      `${dueDate}T00:00:00`
    );

  const days =
    Math.ceil(
      (
        due.getTime() -
        today.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    );

  if (days < 0) {
    return {
      label: 'Overdue',
      bg: '#FBE8ED',
      color: '#D96A78',
    };
  }

  if (days === 0) {
    return {
      label: 'Due today',
      bg: '#FBE8ED',
      color: '#D96A78',
    };
  }

  if (days <= 7) {
    return {
      label: `Due in ${days}d`,
      bg: '#FFF4D6',
      color: '#45484A',
    };
  }

  return {
    label: `Due ${formatDate(
      dueDate
    )}`,
    bg: '#E7F2FF',
    color: '#45484A',
  };
}

// ==============================
// DATE FORMATTER
// ==============================

function formatDate(
  dateString
) {
  return new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

const secondaryAction = {
  flex: 1,
  minHeight: 52,
  borderRadius: 17,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  alignItems: 'center',
  justifyContent: 'center',
};