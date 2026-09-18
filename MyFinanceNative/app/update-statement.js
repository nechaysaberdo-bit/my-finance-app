import React, {
  useCallback,
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
  getCreditCards,
  updateCreditCardStatement,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  tealSoft: '#DDF7F1',
  purple: '#F1E6F7',
  yellow: '#FFF4D6',
  line: '#E5EAEA',
};

export default function UpdateStatement() {
  const router = useRouter();

  const { cardId } =
    useLocalSearchParams();

  const [cards, setCards] =
    useState([]);

  const [loaded, setLoaded] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    statementBalance,
    setStatementBalance,
  ] = useState('');

  const [
    amountDue,
    setAmountDue,
  ] = useState('');

  const [
    minimumDue,
    setMinimumDue,
  ] = useState('');

  const [
    statementDate,
    setStatementDate,
  ] = useState('');

  const [
    dueDate,
    setDueDate,
  ] = useState('');

  async function loadCard() {
    const data =
      await getCreditCards();

    setCards(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadCard();
    }, [cardId])
  );

  const card = useMemo(
    () =>
      cards.find(
        (item) =>
          String(item.id) ===
          String(cardId)
      ),
    [cards, cardId]
  );

  React.useEffect(() => {
    if (!card || loaded) {
      return;
    }

    setStatementBalance(
      card.statementBalance
        ? String(card.statementBalance)
        : ''
    );

    setAmountDue(
      card.amountDue
        ? String(card.amountDue)
        : ''
    );

    setMinimumDue(
      card.minimumDue
        ? String(card.minimumDue)
        : ''
    );

    setStatementDate(
      card.statementDate || ''
    );

    setDueDate(
      card.dueDate || ''
    );

    setLoaded(true);
  }, [card, loaded]);

  async function handleSave() {
    if (saving) {
      return;
    }

    const statement =
      Number(statementBalance || 0);

    const due =
      Number(amountDue || 0);

    const minimum =
      Number(minimumDue || 0);

    if (statement < 0) {
      Alert.alert(
        'Invalid statement balance'
      );

      return;
    }

    if (due < 0) {
      Alert.alert(
        'Invalid amount due'
      );

      return;
    }

    if (minimum < 0) {
      Alert.alert(
        'Invalid minimum due'
      );

      return;
    }

    if (
      due > 0 &&
      statement > 0 &&
      due > statement
    ) {
      Alert.alert(
        'Check amount due',
        'Amount due is higher than the statement balance.'
      );

      return;
    }

    if (
      minimum > 0 &&
      due > 0 &&
      minimum > due
    ) {
      Alert.alert(
        'Check minimum due',
        'Minimum due cannot be higher than the amount due.'
      );

      return;
    }

    try {
      setSaving(true);

      await updateCreditCardStatement(
        cardId,
        {
          statementBalance:
            statement,

          amountDue:
            due,

          minimumDue:
            minimum,

          statementDate:
            statementDate ||
            null,

          dueDate:
            dueDate || null,
        }
      );

      router.replace({
        pathname: '/card',

        params: {
          id: cardId,
        },
      });
    } catch (error) {
      Alert.alert(
        'Could not update statement',
        error?.message ||
          'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  }

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
            color: c.ink,
            fontSize: 18,
            fontWeight: '800',
          }}
        >
          Loading card...
        </Text>
      </View>
    );
  }

  const currentBalance =
    Number(
      card.currentBalance || 0
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
        maxWidth: 680,
        width: '100%',
        alignSelf: 'center',
      }}
    >
      {/* HEADER */}

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
              color: c.muted,
              fontSize: 12,
            }}
          >
            {card.issuer ||
              'Credit card'}
          </Text>

          <Text
            style={{
              color: c.ink,
              fontSize: 24,
              fontWeight: '800',
            }}
          >
            Update statement
          </Text>
        </View>
      </View>

      {/* CARD SUMMARY */}

      <View
        style={{
          backgroundColor:
            c.purple,

          borderRadius: 24,

          padding: 18,

          marginBottom: 14,
        }}
      >
        <Text
          style={{
            color: c.muted,
            fontSize: 11,
          }}
        >
          {card.name}
        </Text>

        <Text
          style={{
            color: c.ink,
            fontSize: 29,
            fontWeight: '800',
            marginTop: 4,
          }}
        >
          ₱
          {currentBalance.toLocaleString()}
        </Text>

        <Text
          style={{
            color: c.muted,
            fontSize: 11,
            marginTop: 4,
          }}
        >
          current card balance
        </Text>
      </View>

      {/* STATEMENT */}

      <View
        style={{
          backgroundColor: c.card,
          borderRadius: 22,
          padding: 16,
          borderWidth: 1,
          borderColor: c.line,
        }}
      >
        <Text
          style={{
            color: c.ink,
            fontSize: 17,
            fontWeight: '800',
            marginBottom: 4,
          }}
        >
          Current billing statement
        </Text>

        <Text
          style={{
            color: c.muted,
            fontSize: 11,
            marginBottom: 18,
          }}
        >
          Enter the information from your latest statement.
        </Text>

        <Text style={label}>
          Statement balance
        </Text>

        <MoneyInput
          value={statementBalance}
          onChangeText={
            setStatementBalance
          }
        />

        <Text
          style={helper}
        >
          The total balance shown on your latest statement.
        </Text>

        <Text style={label}>
          Amount still due
        </Text>

        <MoneyInput
          value={amountDue}
          onChangeText={
            setAmountDue
          }
        />

        <Text style={helper}>
          Reduce this when you make payments toward this statement.
        </Text>

        <Text style={label}>
          Minimum amount due
        </Text>

        <MoneyInput
          value={minimumDue}
          onChangeText={
            setMinimumDue
          }
        />

        <Text style={label}>
          Statement date
        </Text>

        <TextInput
          value={statementDate}
          onChangeText={
            setStatementDate
          }
          placeholder="YYYY-MM-DD"
          style={input}
        />

        <Text style={label}>
          Payment due date
        </Text>

        <TextInput
          value={dueDate}
          onChangeText={
            setDueDate
          }
          placeholder="YYYY-MM-DD"
          style={input}
        />
      </View>

      {/* EXPLANATION */}

      <View
        style={{
          backgroundColor:
            c.yellow,

          borderRadius: 20,

          padding: 15,

          marginTop: 12,
        }}
      >
        <Text
          style={{
            color: c.ink,
            fontWeight: '800',
            fontSize: 13,
          }}
        >
          💡 Why this matters
        </Text>

        <Text
          style={{
            color: c.muted,
            fontSize: 11,
            lineHeight: 17,
            marginTop: 5,
          }}
        >
          Your current balance can include new purchases that are not due yet. We’ll use the amount still due from the latest statement when calculating upcoming commitments.
        </Text>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={{
          backgroundColor: c.teal,
          minHeight: 54,
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
            fontSize: 15,
            fontWeight: '800',
          }}
        >
          {saving
            ? 'Saving...'
            : 'Save statement'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function MoneyInput({
  value,
  onChangeText,
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5EAEA',
        borderRadius: 14,
        marginBottom: 5,
      }}
    >
      <Text
        style={{
          color: '#45484A',
          fontWeight: '800',
          fontSize: 16,
          paddingLeft: 13,
        }}
      >
        ₱
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        keyboardType="decimal-pad"
        placeholder="0.00"
        style={{
          flex: 1,
          padding: 13,
          color: '#45484A',
          fontSize: 15,
        }}
      />
    </View>
  );
}

const label = {
  color: '#92999B',
  fontSize: 12,
  fontWeight: '600',
  marginTop: 10,
  marginBottom: 7,
};

const helper = {
  color: '#92999B',
  fontSize: 10,
  marginBottom: 10,
};

const input = {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 14,
  padding: 13,
  color: '#45484A',
  fontSize: 15,
  marginBottom: 8,
};