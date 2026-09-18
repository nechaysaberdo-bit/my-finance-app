import React, {
  useCallback,
  useState,
} from 'react';

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
  getLendBorrowRecords,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  green: '#E7F5E8',
  pink: '#FBE8ED',
  blue: '#E7F2FF',
  purple: '#F1E6F7',
  line: '#E5EAEA',
};

export default function LendBorrow() {
  const router = useRouter();

  const [records, setRecords] =
    useState([]);

  const [
    showSettled,
    setShowSettled,
  ] = useState(false);

  async function loadRecords() {
    const data =
      await getLendBorrowRecords();

    setRecords(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const activeRecords =
    records.filter(
      (item) =>
        item.status !== 'paid' &&
        Number(
          item.remainingAmount || 0
        ) > 0
    );

  const settledRecords =
    records.filter(
      (item) =>
        item.status === 'paid' ||
        Number(
          item.remainingAmount || 0
        ) <= 0
    );

  const lent =
    activeRecords.filter(
      (item) =>
        item.direction === 'lent'
    );

  const borrowed =
    activeRecords.filter(
      (item) =>
        item.direction ===
        'borrowed'
    );

  const owedToMe =
    lent.reduce(
      (sum, item) =>
        sum +
        Number(
          item.remainingAmount ||
            0
        ),
      0
    );

  const iOwe =
    borrowed.reduce(
      (sum, item) =>
        sum +
        Number(
          item.remainingAmount ||
            0
        ),
      0
    );

  function openRecord(item) {
    router.push({
      pathname:
        '/lendborrow-detail',

      params: {
        id: item.id,
      },
    });
  }

  function RecordCard({
    item,
    settled = false,
  }) {
    const isLent =
      item.direction === 'lent';

    return (
      <Pressable
        onPress={() =>
          openRecord(item)
        }
        style={({ pressed }) => ({
          backgroundColor:
            pressed
              ? isLent
                ? c.green
                : c.blue
              : c.card,

          borderRadius: 20,

          borderWidth: 1,

          borderColor:
            settled
              ? '#DCE3E2'
              : c.line,

          padding: 15,

          marginBottom: 10,

          opacity:
            settled ? 0.82 : 1,
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
              width: 46,
              height: 46,

              borderRadius: 15,

              backgroundColor:
                settled
                  ? '#EEF2F1'
                  : isLent
                  ? c.green
                  : c.blue,

              alignItems: 'center',
              justifyContent:
                'center',

              marginRight: 12,
            }}
          >
            <Text
              style={{
                fontSize: 20,
              }}
            >
              {settled
                ? '✓'
                : isLent
                ? '🤲'
                : '🙋'}
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
                fontWeight: '800',
                fontSize: 16,
              }}
            >
              {item.person}
            </Text>

            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginTop: 3,
              }}
            >
              {settled
                ? isLent
                  ? 'Fully repaid'
                  : 'Fully paid back'
                : isLent
                ? 'Owes me'
                : 'I owe'}
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
                color:
                  settled
                    ? c.teal
                    : c.ink,

                fontWeight: '800',

                fontSize: 17,
              }}
            >
              {settled
                ? 'Settled'
                : `₱${Number(
                    item.remainingAmount ||
                      0
                  ).toLocaleString()}`}
            </Text>

            <Text
              style={{
                color: c.muted,
                fontSize: 18,
              }}
            >
              ›
            </Text>
          </View>
        </View>

        {settled && (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor:
                c.line,

              marginTop: 10,

              paddingTop: 9,

              flexDirection: 'row',

              justifyContent:
                'space-between',
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 11,
              }}
            >
              ORIGINAL AMOUNT
            </Text>

            <Text
              style={{
                color: c.ink,
                fontWeight: '700',
                fontSize: 12,
              }}
            >
              ₱
              {Number(
                item.originalAmount ||
                  0
              ).toLocaleString()}
            </Text>
          </View>
        )}
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
        Lend & Borrow ↔
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Keep track of money between you and other people.
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
              c.green,

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
            OWED TO ME
          </Text>

          <Text
            style={{
              fontSize: 23,
              fontWeight: '800',
              color: c.teal,
              marginTop: 5,
            }}
          >
            ₱
            {owedToMe.toLocaleString()}
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 11,
              marginTop: 4,
            }}
          >
            {lent.length} active
          </Text>
        </View>

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
            I OWE
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
            {iOwe.toLocaleString()}
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 11,
              marginTop: 4,
            }}
          >
            {borrowed.length}{' '}
            active
          </Text>
        </View>
      </View>

      {activeRecords.length ===
      0 ? (
        <View
          style={{
            backgroundColor:
              c.card,

            borderRadius: 22,

            borderWidth: 1,
            borderColor: c.line,

            padding: 24,

            alignItems:
              'center',

            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 34,
            }}
          >
            ✨
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginTop: 9,
            }}
          >
            All settled
          </Text>

          <Text
            style={{
              color: c.muted,
              textAlign: 'center',
              marginTop: 6,
              lineHeight: 19,
            }}
          >
            You currently have no outstanding lend or borrow balances.
          </Text>
        </View>
      ) : (
        <>
          {lent.length > 0 && (
            <>
              <Text
                style={{
                  color: c.ink,
                  fontSize: 17,
                  fontWeight: '800',
                  marginBottom: 10,
                }}
              >
                Owed to me
              </Text>

              {lent.map((item) => (
                <RecordCard
                  key={item.id}
                  item={item}
                />
              ))}
            </>
          )}

          {borrowed.length >
            0 && (
            <>
              <Text
                style={{
                  color: c.ink,
                  fontSize: 17,
                  fontWeight: '800',

                  marginTop:
                    lent.length
                      ? 8
                      : 0,

                  marginBottom: 10,
                }}
              >
                I owe
              </Text>

              {borrowed.map(
                (item) => (
                  <RecordCard
                    key={item.id}
                    item={item}
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
            '/add-lendborrow'
          )
        }
        style={{
          backgroundColor: c.teal,

          minHeight: 54,

          borderRadius: 18,

          alignItems: 'center',
          justifyContent:
            'center',

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
          ＋ Add lend / borrow
        </Text>
      </Pressable>

      {/* SETTLED HISTORY */}

      {settledRecords.length >
        0 && (
        <View
          style={{
            marginTop: 22,
          }}
        >
          <Pressable
            onPress={() =>
              setShowSettled(
                !showSettled
              )
            }
            style={{
              backgroundColor:
                c.card,

              borderWidth: 1,
              borderColor:
                c.line,

              borderRadius: 18,

              paddingHorizontal:
                16,

              minHeight: 54,

              flexDirection: 'row',

              alignItems: 'center',

              justifyContent:
                'space-between',
            }}
          >
            <View>
              <Text
                style={{
                  color: c.ink,
                  fontWeight: '800',
                  fontSize: 15,
                }}
              >
                ✓ Paid / Settled
              </Text>

              <Text
                style={{
                  color: c.muted,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                {
                  settledRecords.length
                }{' '}
                completed
              </Text>
            </View>

            <Text
              style={{
                color: c.muted,
                fontSize: 18,
              }}
            >
              {showSettled
                ? '⌃'
                : '⌄'}
            </Text>
          </Pressable>

          {showSettled && (
            <View
              style={{
                marginTop: 10,
              }}
            >
              {settledRecords.map(
                (item) => (
                  <RecordCard
                    key={item.id}
                    item={item}
                    settled
                  />
                )
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}