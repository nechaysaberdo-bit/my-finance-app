import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAccounts } from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#4B4B4B',
  muted: '#919191',
  teal: '#25BFA6',
  tealSoft: '#DDF7F1',
  green: '#E7F5E8',
  blue: '#E7F2FF',
  purple: '#F1E6F7',
  gray: '#F0F1F2',
  line: '#E8EBEC',
};

const typeInfo = {
  cash: {
    label: 'Cash',
    emoji: '💵',
    bg: c.green,
  },
  bank: {
    label: 'Bank accounts',
    emoji: '🏦',
    bg: c.blue,
  },
  ewallet: {
    label: 'E-wallets',
    emoji: '📱',
    bg: c.tealSoft,
  },
  other: {
    label: 'Other',
    emoji: '◉',
    bg: c.purple,
  },
};

export default function Accounts() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);

  async function loadAccounts() {
    const data = await getAccounts();
    setAccounts(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const total = accounts
    .filter((a) => a.includedInAvailable !== false)
    .reduce(
      (sum, a) => sum + Number(a.balance || 0),
      0
    );

  const groups = ['cash', 'bank', 'ewallet', 'other'];

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
        My Accounts
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        See exactly where your money is.
      </Text>

      <View
        style={{
          backgroundColor: c.teal,
          borderRadius: 24,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: '#DFFAF4',
            fontSize: 13,
          }}
        >
          Available across accounts
        </Text>

        <Text
          style={{
            fontSize: 34,
            fontWeight: '800',
            color: '#FFFFFF',
            marginTop: 5,
          }}
        >
          ₱{total.toLocaleString()}
        </Text>

        <Text
          style={{
            color: '#E5FFF8',
            fontSize: 12,
            marginTop: 5,
          }}
        >
          Excludes accounts you choose not to count
        </Text>
      </View>

      {groups.map((type) => {
        const info = typeInfo[type];

        const items = accounts.filter(
          (a) => a.type === type
        );

        if (items.length === 0) {
          return null;
        }

        const groupTotal = items.reduce(
          (sum, a) => sum + Number(a.balance || 0),
          0
        );

        return (
          <View
            key={type}
            style={{
              backgroundColor: info.bg,
              borderRadius: 22,
              padding: 14,
              marginBottom: 13,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>
                  {info.emoji}
                </Text>

                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '800',
                    color: c.ink,
                    marginLeft: 9,
                  }}
                >
                  {info.label}
                </Text>
              </View>

              <Text
                style={{
                  fontWeight: '800',
                  color: c.ink,
                }}
              >
                ₱{groupTotal.toLocaleString()}
              </Text>
            </View>

            {items.map((account) => (
              <Pressable
                key={account.id}
                onPress={() =>
                  router.push({
                    pathname: '/account-detail',
                    params: {
                      id: account.id,
                    },
                  })
                }
                style={({ pressed }) => ({
                  backgroundColor: pressed
                    ? '#F7F7F7'
                    : '#FFFFFF',
                  borderRadius: 16,
                  padding: 13,
                  marginTop: 7,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: c.ink,
                    }}
                  >
                    {account.name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 11,
                      color: c.muted,
                      marginTop: 3,
                    }}
                  >
                    {account.includedInAvailable === false
                      ? 'Excluded from available money'
                      : 'Included in available money'}
                  </Text>
                </View>

                <View
                  style={{
                    alignItems: 'flex-end',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '800',
                      color: c.ink,
                    }}
                  >
                    ₱
                    {Number(
                      account.balance || 0
                    ).toLocaleString()}
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
              </Pressable>
            ))}
          </View>
        );
      })}

      {accounts.length === 0 && (
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 22,
            padding: 25,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: c.line,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 36 }}>
            👛
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: c.ink,
              marginTop: 10,
            }}
          >
            Add where you keep your money
          </Text>

          <Text
            style={{
              color: c.muted,
              textAlign: 'center',
              marginTop: 6,
              lineHeight: 19,
            }}
          >
            Add your wallet, bank accounts and e-wallets so transactions can update the correct balance.
          </Text>
        </View>
      )}

      <Pressable
        onPress={() =>
          router.push('/add-account')
        }
        style={{
          backgroundColor: c.teal,
          borderRadius: 18,
          minHeight: 54,
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
          ＋ Add account
        </Text>
      </Pressable>
    </ScrollView>
  );
}