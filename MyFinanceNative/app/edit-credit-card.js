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
  updateCreditCardInfo,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  purple: '#F1E6F7',
  line: '#E5EAEA',
};

export default function EditCreditCard() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams();

  const [cards, setCards] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [cutoffDay, setCutoffDay] = useState('');
  const [
    dueDaysAfterCutoff,
    setDueDaysAfterCutoff,
  ] = useState('20');

  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadCard() {
    const data = await getCreditCards();
    setCards(data);
  }

  useFocusEffect(
    useCallback(() => {
      setLoaded(false);
      loadCard();
    }, [cardId])
  );

  const card = useMemo(
    () =>
      cards.find(
        (item) =>
          String(item.id) === String(cardId)
      ),
    [cards, cardId]
  );

  React.useEffect(() => {
    if (!card || loaded) return;

    setName(card.name || '');
    setIssuer(card.issuer || '');

    setCreditLimit(
      card.creditLimit
        ? String(card.creditLimit)
        : ''
    );

    setCutoffDay(
      card.cutoffDay
        ? String(card.cutoffDay)
        : ''
    );

    setDueDaysAfterCutoff(
      card.dueDaysAfterCutoff
        ? String(card.dueDaysAfterCutoff)
        : '20'
    );

    setNotes(card.notes || '');

    setLoaded(true);
  }, [card, loaded]);

  async function handleSave() {
    if (saving) return;

    if (!name.trim()) {
      Alert.alert('Enter a card name');
      return;
    }

    if (Number(creditLimit || 0) <= 0) {
      Alert.alert('Enter a valid credit limit');
      return;
    }

    if (
      cutoffDay &&
      (
        Number(cutoffDay) < 1 ||
        Number(cutoffDay) > 31
      )
    ) {
      Alert.alert('Enter a valid cutoff day');
      return;
    }

    try {
      setSaving(true);

      await updateCreditCardInfo(
        cardId,
        {
          name,
          issuer,
          creditLimit,
          cutoffDay,
          dueDaysAfterCutoff,
          notes,
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
        'Could not update card',
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
        }}
      >
        <Text
          style={{
            color: c.ink,
            fontWeight: '800',
          }}
        >
          Loading card...
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
          onPress={() => router.back()}
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

        <View>
          <Text
            style={{
              color: c.muted,
              fontSize: 12,
            }}
          >
            Credit card
          </Text>

          <Text
            style={{
              color: c.ink,
              fontSize: 24,
              fontWeight: '800',
            }}
          >
            Edit card info
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: c.purple,
          borderRadius: 24,
          padding: 18,
          marginBottom: 14,
        }}
      >
        <Text style={label}>
          Card name
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Example: BPI Amore"
          style={input}
        />

        <Text style={label}>
          Bank / issuer
        </Text>

        <TextInput
          value={issuer}
          onChangeText={setIssuer}
          placeholder="Example: BPI"
          style={input}
        />
      </View>

      <View style={whiteCard}>
        <Text style={label}>
          Credit limit
        </Text>

        <View style={moneyInput}>
          <Text style={peso}>₱</Text>

          <TextInput
            value={creditLimit}
            onChangeText={setCreditLimit}
            keyboardType="decimal-pad"
            placeholder="0.00"
            style={moneyTextInput}
          />
        </View>

        <Text style={label}>
          Statement cutoff day
        </Text>

        <TextInput
          value={cutoffDay}
          onChangeText={setCutoffDay}
          keyboardType="number-pad"
          placeholder="Example: 20"
          style={input}
        />

        <Text style={label}>
          Typical days from cutoff to due date
        </Text>

        <TextInput
          value={dueDaysAfterCutoff}
          onChangeText={setDueDaysAfterCutoff}
          keyboardType="number-pad"
          placeholder="20"
          style={input}
        />

        <Text style={label}>
          Notes
        </Text>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          multiline
          style={[
            input,
            {
              minHeight: 80,
              textAlignVertical: 'top',
            },
          ]}
        />
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
          marginTop: 16,
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
            : 'Save card info'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const whiteCard = {
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
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 14,
  paddingHorizontal: 13,
  marginBottom: 16,
};

const peso = {
  color: '#45484A',
  fontWeight: '800',
  fontSize: 17,
};

const moneyTextInput = {
  flex: 1,
  padding: 13,
  color: '#45484A',
  fontSize: 15,
};