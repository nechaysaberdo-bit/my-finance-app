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
  getCreditCards,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  purple: '#F1E6F7',
  pink: '#FBE8ED',
  blue: '#E7F2FF',
  line: '#E5EAEA',
};

export default function CreditCards() {
  const router = useRouter();
  const [cards, setCards] = useState([]);

  async function loadCards() {
    const data = await getCreditCards();
    setCards(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  const totalOwed = cards.reduce(
    (sum, card) =>
      sum + Number(card.currentBalance || 0),
    0
  );

  const totalAvailable = cards.reduce(
    (sum, card) =>
      sum +
      Math.max(
        Number(card.creditLimit || 0) -
          Number(card.currentBalance || 0),
        0
      ),
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
        Credit Cards 💳
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Balances, available credit, statements and installments.
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
            backgroundColor: c.pink,
            borderRadius: 20,
            padding: 15,
          }}
        >
          <Text style={{ color: c.muted }}>
            Total owed
          </Text>

          <Text
            style={{
              fontSize: 23,
              fontWeight: '800',
              color: c.ink,
              marginTop: 5,
            }}
          >
            ₱{totalOwed.toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: c.blue,
            borderRadius: 20,
            padding: 15,
          }}
        >
          <Text style={{ color: c.muted }}>
            Available credit
          </Text>

          <Text
            style={{
              fontSize: 23,
              fontWeight: '800',
              color: c.ink,
              marginTop: 5,
            }}
          >
            ₱{totalAvailable.toLocaleString()}
          </Text>
        </View>
      </View>

      {cards.length === 0 ? (
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
          <Text style={{ fontSize: 34 }}>
            💳
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginTop: 9,
            }}
          >
            No credit cards yet
          </Text>

          <Text
            style={{
              color: c.muted,
              textAlign: 'center',
              marginTop: 6,
              lineHeight: 19,
            }}
          >
            Add your cards so expenses and bills can use them as payment sources.
          </Text>
        </View>
      ) : (
        cards.map((card) => {
          const creditLimit =
            Number(card.creditLimit || 0);

          const currentBalance =
            Number(card.currentBalance || 0);

          const available =
            Math.max(
              creditLimit - currentBalance,
              0
            );

          const utilization =
            creditLimit > 0
              ? Math.min(
                  (currentBalance /
                    creditLimit) *
                    100,
                  100
                )
              : 0;

          return (
            <Pressable
              key={card.id}
              onPress={() =>
                router.push({
                  pathname: '/card',
                  params: {
                    id: card.id,
                  },
                })
              }
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? c.purple
                  : c.card,

                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: c.line,
                marginBottom: 12,
              })}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '800',
                      color: c.ink,
                    }}
                  >
                    {card.name}
                  </Text>

                  <Text
                    style={{
                      color: c.muted,
                      marginTop: 3,
                      fontSize: 12,
                    }}
                  >
                    {card.issuer ||
                      'Credit card'}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 22,
                    color: c.muted,
                  }}
                >
                  ›
                </Text>
              </View>

              <View
                style={{
                  marginTop: 15,
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
                    CURRENT BALANCE
                  </Text>

                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '800',
                      color: c.ink,
                      marginTop: 3,
                    }}
                  >
                    ₱{currentBalance.toLocaleString()}
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
                      fontSize: 20,
                      fontWeight: '800',
                      color: c.teal,
                      marginTop: 3,
                    }}
                  >
                    ₱{available.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  height: 8,
                  backgroundColor: '#EEF0F1',
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
                        ? '#D96A78'
                        : c.teal,
                    borderRadius: 99,
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
                  {utilization.toFixed(0)}% utilization
                </Text>

                <Text
                  style={{
                    color: c.muted,
                    fontSize: 11,
                  }}
                >
                  Cutoff: {card.cutoffDay}
                </Text>
              </View>
            </Pressable>
          );
        })
      )}

      <Pressable
        onPress={() =>
          router.push('/add-credit-card')
        }
        style={{
          backgroundColor: c.teal,
          minHeight: 54,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          ＋ Add credit card
        </Text>
      </Pressable>
    </ScrollView>
  );
}