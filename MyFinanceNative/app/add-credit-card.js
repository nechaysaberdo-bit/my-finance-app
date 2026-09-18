import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  addCreditCard,
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
  line: '#E5EAEA',
};

export default function AddCreditCard() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');

  const [creditLimit, setCreditLimit] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');

  const [statementBalance, setStatementBalance] =
    useState('');

  const [amountDue, setAmountDue] =
    useState('');

  const [minimumDue, setMinimumDue] =
    useState('');

  const [statementDate, setStatementDate] =
    useState('');

  const [dueDate, setDueDate] =
    useState('');

  const [cutoffDay, setCutoffDay] =
    useState('');

  const [
    dueDaysAfterCutoff,
    setDueDaysAfterCutoff,
  ] = useState('20');

  const [notes, setNotes] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  async function handleSave() {
    if (saving) return;

    if (!name.trim()) {
      Alert.alert(
        'Card name required'
      );
      return;
    }

    if (
      !creditLimit ||
      Number(creditLimit) <= 0
    ) {
      Alert.alert(
        'Enter a valid credit limit'
      );
      return;
    }

    if (
      cutoffDay &&
      (
        Number(cutoffDay) < 1 ||
        Number(cutoffDay) > 31
      )
    ) {
      Alert.alert(
        'Enter a valid cutoff day'
      );
      return;
    }

    try {
      setSaving(true);

      await addCreditCard({
        name: name.trim(),

        issuer:
          issuer.trim(),

        creditLimit:
          Number(creditLimit),

        currentBalance:
          Number(
            currentBalance || 0
          ),

        statementBalance:
          Number(
            statementBalance || 0
          ),

        amountDue:
          Number(
            amountDue || 0
          ),

        minimumDue:
          Number(
            minimumDue || 0
          ),

        statementDate:
          statementDate || null,

        dueDate:
          dueDate || null,

        cutoffDay:
          cutoffDay
            ? Number(cutoffDay)
            : null,

        dueDaysAfterCutoff:
          Number(
            dueDaysAfterCutoff || 20
          ),

        notes,
      });

      setStep(4);
    } catch (error) {
      Alert.alert(
        'Could not save',
        error?.message ||
          'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
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
      {step !== 4 && (
        <>
          <Text
            style={{
              fontSize: 29,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            Add credit card 💳
          </Text>

          <Text
            style={{
              color: c.muted,
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            Add the card and its current billing-cycle details.
          </Text>
        </>
      )}

      {step === 1 && (
        <>
          <Text style={question}>
            Which card?
          </Text>

          <View
            style={{
              backgroundColor:
                c.purple,
              borderRadius: 24,
              padding: 18,
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

          <Pressable
            onPress={() => {
              if (!name.trim()) {
                Alert.alert(
                  'Enter a card name'
                );

                return;
              }

              setStep(2);
            }}
            style={primaryButton}
          >
            <Text style={primaryText}>
              Continue
            </Text>
          </Pressable>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={question}>
            Card balance
          </Text>

          <View style={whiteCard}>
            <Text style={label}>
              Credit limit
            </Text>

            <MoneyInput
              value={creditLimit}
              onChangeText={
                setCreditLimit
              }
            />

            <Text style={label}>
              Current balance owed
            </Text>

            <MoneyInput
              value={currentBalance}
              onChangeText={
                setCurrentBalance
              }
            />

            <Text
              style={{
                color: c.muted,
                fontSize: 11,
                marginTop: -8,
              }}
            >
              Current balance can include purchases made after your latest statement.
            </Text>
          </View>

          <View style={buttonRow}>
            <BackButton
              onPress={() =>
                setStep(1)
              }
            />

            <Pressable
              onPress={() => {
                if (
                  Number(
                    creditLimit || 0
                  ) <= 0
                ) {
                  Alert.alert(
                    'Enter a valid credit limit'
                  );
                  return;
                }

                setStep(3);
              }}
              style={[
                primaryButton,
                {
                  flex: 2,
                  marginTop: 0,
                },
              ]}
            >
              <Text style={primaryText}>
                Continue
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={question}>
            Current statement
          </Text>

          <View style={whiteCard}>
            <Text style={label}>
              Statement balance
            </Text>

            <MoneyInput
              value={
                statementBalance
              }
              onChangeText={
                setStatementBalance
              }
            />

            <Text style={label}>
              Amount due this cycle
            </Text>

            <MoneyInput
              value={amountDue}
              onChangeText={
                setAmountDue
              }
            />

            <Text
              style={{
                color: c.muted,
                fontSize: 11,
                marginTop: -8,
                marginBottom: 16,
              }}
            >
              Usually this is the statement amount still unpaid.
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
              Due date
            </Text>

            <TextInput
              value={dueDate}
              onChangeText={
                setDueDate
              }
              placeholder="YYYY-MM-DD"
              style={input}
            />

            <Text
              style={{
                color: c.muted,
                fontSize: 11,
                marginTop: -8,
                marginBottom: 16,
              }}
            >
              We’ll convert these date fields to calendar pickers when we do the app-wide date cleanup.
            </Text>

            <Text style={label}>
              Cutoff day
            </Text>

            <TextInput
              value={cutoffDay}
              onChangeText={
                setCutoffDay
              }
              placeholder="Example: 20"
              keyboardType="number-pad"
              style={input}
            />

            <Text style={label}>
              Typical days from cutoff to due date
            </Text>

            <TextInput
              value={
                dueDaysAfterCutoff
              }
              onChangeText={
                setDueDaysAfterCutoff
              }
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
                  minHeight: 70,
                  textAlignVertical:
                    'top',
                },
              ]}
            />
          </View>

          <View
            style={{
              backgroundColor:
                c.yellow,
              borderRadius: 22,
              padding: 16,
              marginTop: 12,
            }}
          >
            <Text
              style={{
                color: c.muted,
                fontSize: 11,
              }}
            >
              CARD SUMMARY
            </Text>

            <Text
              style={{
                color: c.ink,
                fontSize: 18,
                fontWeight: '800',
                marginTop: 4,
              }}
            >
              {name}
            </Text>

            <Text
              style={{
                color: c.ink,
                fontSize: 27,
                fontWeight: '800',
                marginTop: 5,
              }}
            >
              ₱
              {Number(
                amountDue || 0
              ).toLocaleString()}
            </Text>

            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              due this cycle
            </Text>
          </View>

          <View style={buttonRow}>
            <BackButton
              onPress={() =>
                setStep(2)
              }
            />

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[
                primaryButton,
                {
                  flex: 2,
                  marginTop: 0,
                },
              ]}
            >
              <Text style={primaryText}>
                {saving
                  ? 'Saving...'
                  : 'Create card'}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {step === 4 && (
        <>
          <View
            style={{
              backgroundColor:
                c.tealSoft,
              borderRadius: 26,
              padding: 25,
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <Text
              style={{
                fontSize: 32,
              }}
            >
              ✓
            </Text>

            <Text
              style={{
                color: c.ink,
                fontSize: 23,
                fontWeight: '800',
                marginTop: 10,
              }}
            >
              Card added
            </Text>

            <Text
              style={{
                color: c.muted,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              {name} is ready to use.
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.replace(
                '/credit'
              )
            }
            style={primaryButton}
          >
            <Text style={primaryText}>
              View cards
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
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
          color: '#45484A',
          fontWeight: '800',
          fontSize: 17,
        }}
      >
        ₱
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
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

function BackButton({
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={secondaryButton}
    >
      <Text style={secondaryText}>
        Back
      </Text>
    </Pressable>
  );
}

const question = {
  color: '#45484A',
  fontSize: 18,
  fontWeight: '800',
  marginBottom: 12,
};

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

const buttonRow = {
  flexDirection: 'row',
  gap: 10,
  marginTop: 18,
};

const primaryButton = {
  minHeight: 54,
  borderRadius: 18,
  backgroundColor: '#22BDA5',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 18,
  marginTop: 16,
};

const primaryText = {
  color: '#FFFFFF',
  fontWeight: '800',
  fontSize: 15,
};

const secondaryButton = {
  flex: 1,
  minHeight: 54,
  borderRadius: 18,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAEA',
  alignItems: 'center',
  justifyContent: 'center',
};

const secondaryText = {
  color: '#45484A',
  fontWeight: '800',
};