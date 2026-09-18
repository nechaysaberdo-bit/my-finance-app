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
  getLoans,
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
  purple: '#F1E6F7',
  blue: '#E7F2FF',
  line: '#E5EAEA',
};

export default function Loans() {
  const router = useRouter();

  const [loans, setLoans] = useState([]);

  async function loadLoans() {
    const data = await getLoans();
    setLoans(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadLoans();
    }, [])
  );

  const mine = loans.filter(
    (loan) =>
      loan.owner === 'mine' &&
      loan.status !== 'paid'
  );

  const others = loans.filter(
    (loan) =>
      loan.owner === 'other' &&
      loan.status !== 'paid'
  );

  const mineRemaining = mine.reduce(
    (sum, loan) =>
      sum +
      Number(
        loan.remainingBalance || 0
      ),
    0
  );

  const othersRemaining =
    others.reduce(
      (sum, loan) =>
        sum +
        Number(
          loan.remainingBalance || 0
        ),
      0
    );

  function LoanCard({ loan }) {
    const principal =
      Number(
        loan.principal || 0
      );

    const remaining =
      Number(
        loan.remainingBalance || 0
      );

    const paid =
      Math.max(
        principal - remaining,
        0
      );

    const progress =
      principal > 0
        ? Math.min(
            (paid / principal) *
              100,
            100
          )
        : 0;

    const isMine =
      loan.owner === 'mine';

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/loan',
            params: {
              id: loan.id,
            },
          })
        }
        style={({ pressed }) => ({
          backgroundColor:
            pressed
              ? isMine
                ? c.pink
                : c.blue
              : c.card,

          borderRadius: 22,
          padding: 16,
          borderWidth: 1,
          borderColor: c.line,
          marginBottom: 11,
        })}
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
                isMine
                  ? c.pink
                  : c.blue,

              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text
              style={{
                fontSize: 21,
              }}
            >
              {isMine
                ? '💸'
                : '👥'}
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
              {loan.name}
            </Text>

            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginTop: 3,
              }}
            >
              {loan.source ||
                'Loan'}
              {' · '}
              {isMine
                ? 'Mine'
                : "Someone else's"}
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
            justifyContent:
              'space-between',
          }}
        >
          <View>
            <Text
              style={{
                color: c.muted,
                fontSize: 11,
              }}
            >
              REMAINING
            </Text>

            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: c.ink,
                marginTop: 3,
              }}
            >
              ₱
              {remaining.toLocaleString()}
            </Text>
          </View>

          <View
            style={{
              alignItems:
                'flex-end',
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 11,
              }}
            >
              PAYMENT
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: c.ink,
                marginTop: 3,
              }}
            >
              ₱
              {Number(
                loan.monthlyPayment ||
                  0
              ).toLocaleString()}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 8,
            backgroundColor:
              '#EEF0F1',
            borderRadius: 99,
            marginTop: 14,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width:
                `${progress}%`,
              height: 8,
              borderRadius: 99,
              backgroundColor:
                c.teal,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent:
              'space-between',
            marginTop: 7,
          }}
        >
          <Text
            style={{
              color: c.muted,
              fontSize: 11,
            }}
          >
            {progress.toFixed(0)}
            % paid
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 11,
            }}
          >
            {loan.nextDueDate
              ? `Next: ${loan.nextDueDate}`
              : 'No due date'}
          </Text>
        </View>
      </Pressable>
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
        Loans 💸
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Track balances, payments and payoff progress.
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
            backgroundColor:
              c.pink,
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
            MY LOANS
          </Text>

          <Text
            style={{
              fontSize: 23,
              fontWeight: '800',
              color: c.ink,
              marginTop: 5,
            }}
          >
            ₱
            {mineRemaining.toLocaleString()}
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 11,
              marginTop: 4,
            }}
          >
            {mine.length} active
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor:
              c.blue,
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
            OTHERS
          </Text>

          <Text
            style={{
              fontSize: 23,
              fontWeight: '800',
              color: c.ink,
              marginTop: 5,
            }}
          >
            ₱
            {othersRemaining.toLocaleString()}
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 11,
              marginTop: 4,
            }}
          >
            {others.length} active
          </Text>
        </View>
      </View>

      {loans.length === 0 ? (
        <View
          style={{
            backgroundColor:
              c.card,
            borderRadius: 22,
            padding: 24,
            borderWidth: 1,
            borderColor: c.line,
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 34,
            }}
          >
            💸
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginTop: 9,
            }}
          >
            No loans yet
          </Text>

          <Text
            style={{
              color: c.muted,
              textAlign: 'center',
              marginTop: 6,
              lineHeight: 19,
            }}
          >
            Add a loan to track its balance, payments and payoff progress.
          </Text>
        </View>
      ) : (
        <>
          {mine.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '800',
                  color: c.ink,
                  marginBottom: 10,
                }}
              >
                My loans
              </Text>

              {mine.map(
                (loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                  />
                )
              )}
            </>
          )}

          {others.length >
            0 && (
            <>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: '800',
                  color: c.ink,
                  marginTop: 8,
                  marginBottom: 10,
                }}
              >
                Someone else's
              </Text>

              {others.map(
                (loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                  />
                )
              )}
            </>
          )}
        </>
      )}

      <Pressable
        onPress={() =>
          router.push(
            '/add-loan'
          )
        }
        style={{
          backgroundColor:
            c.teal,
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
          ＋ Add loan
        </Text>
      </Pressable>
    </ScrollView>
  );
}