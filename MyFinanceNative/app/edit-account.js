import React, {
  useCallback,
  useEffect,
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
  getAccounts,
  updateAccount,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  green: '#E7F5E8',
  blue: '#E7F2FF',
  aqua: '#DDF7F1',
  purple: '#F1E6F7',
  line: '#E5EAEA',
};

const accountTypes = [
  {
    id: 'cash',
    label: 'Cash',
    emoji: '💵',
    color: c.green,
  },
  {
    id: 'bank',
    label: 'Bank',
    emoji: '🏦',
    color: c.blue,
  },
  {
    id: 'ewallet',
    label: 'E-Wallet',
    emoji: '📱',
    color: c.aqua,
  },
  {
    id: 'other',
    label: 'Other',
    emoji: '◉',
    color: c.purple,
  },
];

export default function EditAccount() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [accounts, setAccounts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [included, setIncluded] = useState(true);

  const [saving, setSaving] = useState(false);

  async function loadData() {
    const data = await getAccounts();

    setAccounts(data);
  }

  useFocusEffect(
    useCallback(() => {
      setLoaded(false);
      loadData();
    }, [id])
  );

  const account = useMemo(
    () =>
      accounts.find(
        (item) =>
          String(item.id) === String(id)
      ),
    [accounts, id]
  );

  useEffect(() => {
    if (!account || loaded) {
      return;
    }

    setName(account.name || '');
    setType(account.type || 'bank');

    setBalance(
      String(
        Number(account.balance || 0)
      )
    );

    setIncluded(
      account.includedInAvailable !== false
    );

    setLoaded(true);
  }, [account, loaded]);

  async function handleSave() {
    if (saving) {
      return;
    }

    if (!name.trim()) {
      Alert.alert(
        'Account name required'
      );

      return;
    }

    const numericBalance =
      Number(balance || 0);

    if (
      Number.isNaN(numericBalance)
    ) {
      Alert.alert(
        'Enter a valid balance'
      );

      return;
    }

    try {
      setSaving(true);

      await updateAccount(
        String(id),
        {
          name: name.trim(),
          type,
          balance: numericBalance,
          includedInAvailable:
            included,
          updatedAt:
            new Date().toISOString(),
        }
      );

      router.replace({
        pathname:
          '/account-detail',

        params: {
          id,
        },
      });
    } catch (error) {
      Alert.alert(
        'Could not update account',
        error?.message ||
          'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (!account) {
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
          Loading account...
        </Text>
      </View>
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
        maxWidth: 680,
        width: '100%',
        alignSelf: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 18,
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
              color: c.ink,
              fontSize: 22,
            }}
          >
            ‹
          </Text>
        </Pressable>

        <View>
          <Text
            style={{
              color: c.muted,
              fontSize: 12,
            }}
          >
            Account settings
          </Text>

          <Text
            style={{
              color: c.ink,
              fontSize: 24,
              fontWeight: '800',
            }}
          >
            Edit account
          </Text>
        </View>
      </View>

      <Text style={label}>
        Account type
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 18,
        }}
      >
        {accountTypes.map(
          (item) => {
            const selected =
              type === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  setType(item.id)
                }
                style={{
                  minWidth: 135,
                  flexGrow: 1,
                  backgroundColor:
                    selected
                      ? item.color
                      : c.card,
                  borderWidth: 1,
                  borderColor:
                    selected
                      ? c.teal
                      : c.line,
                  borderRadius: 18,
                  padding: 13,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                  }}
                >
                  {item.emoji}
                </Text>

                <Text
                  style={{
                    color: c.ink,
                    fontWeight: '800',
                    marginTop: 5,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }
        )}
      </View>

      <View style={card}>
        <Text style={label}>
          Account name
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          style={input}
        />

        <Text style={label}>
          Current balance
        </Text>

        <View style={moneyInput}>
          <Text
            style={{
              color: c.ink,
              fontSize: 22,
              fontWeight: '800',
            }}
          >
            ₱
          </Text>

          <TextInput
            value={balance}
            onChangeText={setBalance}
            keyboardType="decimal-pad"
            style={{
              flex: 1,
              padding: 13,
              color: c.ink,
              fontSize: 22,
              fontWeight: '800',
            }}
          />
        </View>
      </View>

      <View
        style={[
          card,
          {
            marginTop: 12,
          },
        ]}
      >
        <Pressable
          onPress={() =>
            setIncluded(!included)
          }
          style={{
            flexDirection: 'row',
            justifyContent:
              'space-between',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flex: 1,
              paddingRight: 20,
            }}
          >
            <Text
              style={{
                color: c.ink,
                fontSize: 15,
                fontWeight: '800',
              }}
            >
              Count toward Safe to Enjoy
            </Text>

            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginTop: 4,
                lineHeight: 18,
              }}
            >
              Turn this off if this money should not be treated as spendable.
            </Text>
          </View>

          <View
            style={{
              width: 50,
              height: 29,
              borderRadius: 99,
              padding: 3,
              backgroundColor:
                included
                  ? c.teal
                  : '#D7DEDE',
              alignItems:
                included
                  ? 'flex-end'
                  : 'flex-start',
              justifyContent:
                'center',
            }}
          >
            <View
              style={{
                width: 23,
                height: 23,
                borderRadius: 99,
                backgroundColor:
                  '#FFFFFF',
              }}
            />
          </View>
        </Pressable>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={{
          minHeight: 54,
          backgroundColor: c.teal,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 18,
          opacity:
            saving ? 0.6 : 1,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontWeight: '800',
            fontSize: 15,
          }}
        >
          {saving
            ? 'Saving...'
            : 'Save account'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: 22,
  borderWidth: 1,
  borderColor: '#E5EAEA',
  padding: 16,
};

const label = {
  color: '#92999B',
  fontSize: 12,
  fontWeight: '600',
  marginBottom: 7,
};

const input = {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 14,
  padding: 13,
  color: '#45484A',
  fontSize: 15,
  marginBottom: 16,
};

const moneyInput = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 14,
  paddingHorizontal: 13,
};