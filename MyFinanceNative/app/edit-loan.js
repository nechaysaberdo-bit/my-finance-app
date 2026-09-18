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
  getLoans,
  updateLoan,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  pink: '#FBE8ED',
  blue: '#E7F2FF',
  line: '#E5EAEA',
};

export default function EditLoan() {
  const router = useRouter();
  const { id } =
    useLocalSearchParams();

  const [loans, setLoans] =
    useState([]);

  const [loaded, setLoaded] =
    useState(false);

  const [name, setName] =
    useState('');

  const [source, setSource] =
    useState('');

  const [
    remainingBalance,
    setRemainingBalance,
  ] = useState('');

  const [
    interestRate,
    setInterestRate,
  ] = useState('');

  const [
    monthlyPayment,
    setMonthlyPayment,
  ] = useState('');

  const [
    nextDueDate,
    setNextDueDate,
  ] = useState('');

  const [owner, setOwner] =
    useState('mine');

  const [notes, setNotes] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  async function loadLoan() {
    setLoans(
      await getLoans()
    );
  }

  useFocusEffect(
    useCallback(() => {
      setLoaded(false);
      loadLoan();
    }, [id])
  );

  const loan = useMemo(
    () =>
      loans.find(
        (item) =>
          String(item.id) ===
          String(id)
      ),
    [loans, id]
  );

  useEffect(() => {
    if (!loan || loaded) {
      return;
    }

    setName(
      loan.name || ''
    );

    setSource(
      loan.source || ''
    );

    setRemainingBalance(
      String(
        Number(
          loan.remainingBalance ||
            0
        )
      )
    );

    setInterestRate(
      loan.interestRate
        ? String(
            loan.interestRate
          )
        : ''
    );

    setMonthlyPayment(
      loan.monthlyPayment
        ? String(
            loan.monthlyPayment
          )
        : ''
    );

    setNextDueDate(
      loan.nextDueDate || ''
    );

    setOwner(
      loan.owner || 'mine'
    );

    setNotes(
      loan.notes || ''
    );

    setLoaded(true);
  }, [loan, loaded]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(
        'Enter a loan name'
      );
      return;
    }

    const remaining =
      Number(
        remainingBalance || 0
      );

    if (remaining < 0) {
      Alert.alert(
        'Remaining balance cannot be negative'
      );
      return;
    }

    try {
      setSaving(true);

      await updateLoan(
        id,
        {
          name:
            name.trim(),

          source:
            source.trim(),

          remainingBalance:
            remaining,

          interestRate:
            Number(
              interestRate || 0
            ),

          monthlyPayment:
            Number(
              monthlyPayment || 0
            ),

          nextDueDate:
            nextDueDate ||
            null,

          owner,

          notes,

          status:
            remaining <= 0
              ? 'paid'
              : 'active',
        }
      );

      router.replace({
        pathname: '/loan',
        params: {
          id,
        },
      });
    } catch (error) {
      Alert.alert(
        'Could not save loan',
        error?.message ||
          'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (!loan) {
    return (
      <View
        style={{
          flex: 1,
          alignItems:
            'center',
          justifyContent:
            'center',
          backgroundColor:
            c.bg,
        }}
      >
        <Text
          style={{
            color: c.ink,
            fontWeight:
              '800',
          }}
        >
          Loading loan...
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
      <Header
        title="Edit loan"
        router={router}
      />

      <Text style={label}>
        Whose loan?
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <Choice
          title="My loan"
          selected={
            owner === 'mine'
          }
          color={c.pink}
          onPress={() =>
            setOwner('mine')
          }
        />

        <Choice
          title="Someone else's"
          selected={
            owner === 'other'
          }
          color={c.blue}
          onPress={() =>
            setOwner('other')
          }
        />
      </View>

      <View style={card}>
        <Text style={label}>
          Loan name
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          style={input}
        />

        <Text style={label}>
          Lender / provider
        </Text>

        <TextInput
          value={source}
          onChangeText={setSource}
          style={input}
        />

        <Text style={label}>
          Current remaining balance
        </Text>

        <MoneyInput
          value={
            remainingBalance
          }
          onChangeText={
            setRemainingBalance
          }
        />

        <Text style={label}>
          Interest rate
        </Text>

        <TextInput
          value={interestRate}
          onChangeText={
            setInterestRate
          }
          keyboardType="decimal-pad"
          placeholder="0"
          style={input}
        />

        <Text style={label}>
          Regular payment
        </Text>

        <MoneyInput
          value={monthlyPayment}
          onChangeText={
            setMonthlyPayment
          }
        />

        <Text style={label}>
          Next due date
        </Text>

        <TextInput
          value={nextDueDate}
          onChangeText={
            setNextDueDate
          }
          placeholder="YYYY-MM-DD"
          style={input}
        />

        <Text style={label}>
          Notes
        </Text>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Optional"
          style={[
            input,
            {
              minHeight: 80,
              textAlignVertical:
                'top',
            },
          ]}
        />
      </View>

      <View
        style={{
          backgroundColor:
            '#FFF4D6',
          borderRadius: 18,
          padding: 14,
          marginTop: 12,
        }}
      >
        <Text
          style={{
            color: c.muted,
            fontSize: 11,
            lineHeight: 17,
          }}
        >
          Original loan amount stays unchanged so previous payment history remains meaningful.
        </Text>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={saveButton}
      >
        <Text style={saveText}>
          {saving
            ? 'Saving...'
            : 'Save loan'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Header({
  title,
  router,
}) {
  return (
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
          backgroundColor:
            '#FFFFFF',
          borderWidth: 1,
          borderColor:
            '#E5EAEA',
          alignItems: 'center',
          justifyContent:
            'center',
          marginRight: 12,
        }}
      >
        <Text
          style={{
            fontSize: 22,
          }}
        >
          ‹
        </Text>
      </Pressable>

      <Text
        style={{
          fontSize: 24,
          fontWeight: '800',
          color: '#45484A',
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function Choice({
  title,
  selected,
  color,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 18,
        padding: 14,

        backgroundColor:
          selected
            ? color
            : '#FFFFFF',

        borderWidth: 1,

        borderColor:
          selected
            ? '#22BDA5'
            : '#E5EAEA',
      }}
    >
      <Text
        style={{
          fontWeight: '800',
          color: '#45484A',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function MoneyInput({
  value,
  onChangeText,
}) {
  return (
    <View style={moneyInput}>
      <Text
        style={{
          fontWeight: '800',
          fontSize: 17,
          color: '#45484A',
        }}
      >
        ₱
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        style={{
          flex: 1,
          padding: 13,
          color: '#45484A',
        }}
      />
    </View>
  );
}

const card = {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 22,
  padding: 16,
};

const label = {
  color: '#92999B',
  fontSize: 12,
  fontWeight: '600',
  marginBottom: 7,
};

const input = {
  borderWidth: 1,
  borderColor: '#E5EAEA',
  borderRadius: 14,
  padding: 13,
  color: '#45484A',
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

const saveButton = {
  minHeight: 54,
  backgroundColor: '#22BDA5',
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 18,
};

const saveText = {
  color: '#FFFFFF',
  fontWeight: '800',
  fontSize: 15,
};