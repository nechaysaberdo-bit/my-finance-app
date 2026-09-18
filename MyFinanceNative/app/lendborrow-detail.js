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
  getLendBorrowRecords,
  getTransactions,
  deleteLendBorrowRecord,
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
  yellow: '#FFF4D6',
  line: '#E5EAEA',
  red: '#D96A78',
};

export default function LendBorrowDetail() {
  const router = useRouter();
  const { id } =
    useLocalSearchParams();

  const [records, setRecords] =
    useState([]);

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  async function loadData() {
    const recordData =
      await getLendBorrowRecords();

    const txData =
      await getTransactions();

    setRecords(recordData);

    setTransactions(
      txData.filter(
        (item) =>
          String(
            item.lendBorrowId
          ) === String(id)
      )
    );
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const record = useMemo(
    () =>
      records.find(
        (item) =>
          String(item.id) ===
          String(id)
      ),
    [records, id]
  );

  if (!record) {
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
            color: c.ink,
            fontWeight: '800',
            fontSize: 18,
          }}
        >
          Record not found
        </Text>

        <Pressable
          onPress={() =>
            router.replace(
              '/lendborrow'
            )
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
            Back to Lend / Borrow
          </Text>
        </Pressable>
      </View>
    );
  }

  const original =
    Number(
      record.originalAmount || 0
    );

  const remaining =
    Number(
      record.remainingAmount || 0
    );

  const paid = Math.max(
    original - remaining,
    0
  );

  const progress =
    original > 0
      ? Math.min(
          (paid / original) * 100,
          100
        )
      : 0;

  const isLent =
    record.direction === 'lent';

  const settled =
    remaining <= 0 ||
    record.status === 'settled' ||
    record.status === 'paid';

  function handleDelete() {
    const historyCount =
      transactions.length;

    const message =
      historyCount > 0
        ? `This record has ${historyCount} related transaction${
            historyCount === 1
              ? ''
              : 's'
          }. The Lend/Borrow record will be removed, but those historical transactions will remain.`
        : `Delete this ${isLent ? 'lend' : 'borrow'} record for ${record.person}?`;

    Alert.alert(
      'Delete record?',
      message,
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
              await deleteLendBorrowRecord(
                record.id
              );

              router.replace(
                '/lendborrow'
              );
            } catch (error) {
              Alert.alert(
                'Could not delete record',
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
            borderWidth: 1,
            borderColor: c.line,
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
            {isLent
              ? 'Money I lent'
              : 'Money I borrowed'}
          </Text>

          <Text
            style={{
              color: c.ink,
              fontSize: 24,
              fontWeight: '800',
            }}
          >
            {record.person}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname:
                '/edit-lendborrow',
              params: {
                id: record.id,
              },
            })
          }
          style={{
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: 14,
            paddingHorizontal: 14,
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
          backgroundColor:
            settled
              ? c.green
              : isLent
              ? c.green
              : c.blue,

          borderRadius: 26,
          padding: 20,
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            color: c.muted,
            fontSize: 11,
          }}
        >
          {settled
            ? 'PAID / SETTLED'
            : isLent
            ? 'STILL OWED TO ME'
            : 'I STILL OWE'}
        </Text>

        <Text
          style={{
            color: c.ink,
            fontSize: 34,
            fontWeight: '800',
            marginTop: 4,
          }}
        >
          ₱
          {remaining.toLocaleString()}
        </Text>

        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            justifyContent:
              'space-between',
          }}
        >
          <View>
            <Text
              style={{
                color: c.muted,
                fontSize: 10,
              }}
            >
              ORIGINAL
            </Text>

            <Text
              style={{
                color: c.ink,
                fontWeight: '800',
                marginTop: 3,
              }}
            >
              ₱
              {original.toLocaleString()}
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
                fontSize: 10,
              }}
            >
              REPAID
            </Text>

            <Text
              style={{
                color: c.teal,
                fontWeight: '800',
                marginTop: 3,
              }}
            >
              ₱
              {paid.toLocaleString()}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 8,
            backgroundColor:
              '#FFFFFF99',
            borderRadius: 99,
            marginTop: 14,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: 8,
              backgroundColor:
                c.teal,
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
          {progress.toFixed(0)}% repaid
        </Text>
      </View>

      {/* DETAILS */}

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
          label="Type"
          value={
            isLent
              ? 'I lent money'
              : 'I borrowed money'
          }
        />

        <DetailRow
          label="Person"
          value={record.person}
        />

        <DetailRow
          label="Due date"
          value={
            record.dueDate
              ? formatDate(
                  record.dueDate
                )
              : 'Not set'
          }
        />

        <DetailRow
          label="Original source"
          value={
            record.sourceName ||
            '—'
          }
        />

        <DetailRow
          label="Status"
          value={
            settled
              ? 'Paid / Settled'
              : 'Active'
          }
          last={
            !record.notes
          }
        />

        {!!record.notes && (
          <DetailRow
            label="Notes"
            value={record.notes}
            last
          />
        )}
      </View>

      {/* REPAY */}

      {!settled && (
        <Pressable
          onPress={() =>
            router.push({
              pathname:
                '/repay-lendborrow',

              params: {
                id: record.id,
              },
            })
          }
          style={{
            backgroundColor: c.teal,
            minHeight: 54,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent:
              'center',
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: 15,
            }}
          >
            {isLent
              ? 'Record repayment received'
              : 'Record repayment'}
          </Text>
        </Pressable>
      )}

      {/* HISTORY */}

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
            color: c.ink,
            fontSize: 18,
            fontWeight: '800',
          }}
        >
          History
        </Text>

        <Text
          style={{
            color: c.muted,
            fontSize: 11,
          }}
        >
          {transactions.length}{' '}
          transaction
          {transactions.length === 1
            ? ''
            : 's'}
        </Text>
      </View>

      {transactions.length === 0 ? (
        <View
          style={{
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: 20,
            padding: 22,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 28,
            }}
          >
            ◌
          </Text>

          <Text
            style={{
              color: c.ink,
              fontWeight: '800',
              marginTop: 7,
            }}
          >
            No activity yet
          </Text>
        </View>
      ) : (
        transactions.map(
          (item) => (
            <View
              key={item.id}
              style={{
                backgroundColor:
                  c.card,
                borderWidth: 1,
                borderColor:
                  c.line,
                borderRadius: 17,
                padding: 13,
                marginBottom: 8,
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
                    c.yellow,
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
                  ↔
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
                  }}
                >
                  {item.description ||
                    'Payment'}
                </Text>

                <Text
                  style={{
                    color: c.muted,
                    fontSize: 11,
                    marginTop: 3,
                  }}
                >
                  {item.date
                    ? new Date(
                        item.date
                      ).toLocaleDateString()
                    : ''}
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
                  item.amount || 0
                ).toLocaleString()}
              </Text>
            </View>
          )
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
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: '#F1C7CF',
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
            Delete record
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent:
          'space-between',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth:
          last ? 0 : 1,
        borderBottomColor:
          '#E5EAEA',
        gap: 15,
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
          flex: 1,
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

function formatDate(date) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}