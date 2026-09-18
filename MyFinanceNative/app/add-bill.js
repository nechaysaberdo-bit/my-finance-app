import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { useRouter } from 'expo-router';
import { addBill } from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  tealSoft: '#DDF7F1',
  yellow: '#FFF4D6',
  line: '#E5EAEA',
};

const categories = [
  'Utilities',
  'Internet',
  'Phone',
  'Rent',
  'Subscription',
  'Insurance',
  'School',
  'Other',
];

const frequencies = [
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
];

export default function AddBill() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Utilities');

  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [recurring, setRecurring] = useState(true);
  const [frequency, setFrequency] = useState('monthly');
  const [autopay, setAutopay] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function formatDateForStorage(date) {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function formatDateForDisplay(date) {
    return date.toLocaleDateString(
      undefined,
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }
    );
  }

  async function handleSave() {
    if (!dueDate) {
      Alert.alert(
        'Choose a due date',
        'Select when this bill is due.'
      );

      return;
    }

    try {
      setSaving(true);

      await addBill({
        name,
        amount,
        category,
        dueDate:
          formatDateForStorage(
            dueDate
          ),
        recurring,
        frequency,
        autopay,
        notes,
      });

      Alert.alert(
        'Bill added 🧾',
        `${name} is now being tracked.`
      );

      router.replace('/bills');
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
      <Text
        style={{
          fontSize: 29,
          fontWeight: '800',
          color: c.ink,
        }}
      >
        Add bill 🧾
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        Track something you need to pay later.
      </Text>

      <View
        style={{
          backgroundColor: c.yellow,
          borderRadius: 24,
          padding: 18,
          marginBottom: 14,
        }}
      >
        <Text style={label}>
          Bill name
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Example: Meralco"
          style={input}
        />

        <Text style={label}>
          Amount
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: c.card,
            borderRadius: 15,
            paddingHorizontal: 13,
          }}
        >
          <Text
            style={{
              fontSize: 25,
              fontWeight: '800',
              color: c.ink,
            }}
          >
            ₱
          </Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            style={{
              flex: 1,
              fontSize: 25,
              fontWeight: '800',
              color: c.ink,
              padding: 13,
            }}
          />
        </View>
      </View>

      <View style={card}>
        <Text style={sectionTitle}>
          Category
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 10,
            marginBottom: 18,
          }}
        >
          {categories.map((item) => {
            const selected =
              category === item;

            return (
              <Pressable
                key={item}
                onPress={() =>
                  setCategory(item)
                }
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 9,
                  borderRadius: 999,
                  backgroundColor:
                    selected
                      ? c.tealSoft
                      : c.card,
                  borderWidth: 1,
                  borderColor:
                    selected
                      ? c.teal
                      : c.line,
                }}
              >
                <Text
                  style={{
                    color: c.ink,
                    fontWeight:
                      selected
                        ? '800'
                        : '600',
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={label}>
          Due date
        </Text>

        <Pressable
          onPress={() =>
            setShowDatePicker(true)
          }
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: 14,
            minHeight: 54,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: dueDate
                ? c.ink
                : c.muted,
              fontSize: 15,
              fontWeight: dueDate
                ? '700'
                : '500',
            }}
          >
            {dueDate
              ? formatDateForDisplay(
                  dueDate
                )
              : 'Choose due date'}
          </Text>

          <Text
            style={{
              fontSize: 20,
            }}
          >
            📅
          </Text>
        </Pressable>

        {showDatePicker && (
          <>
            <DateTimePicker
              value={
                dueDate ||
                new Date()
              }
              mode="date"
              display={
                Platform.OS === 'ios'
                  ? 'inline'
                  : 'default'
              }
              onChange={(
                event,
                selectedDate
              ) => {
                if (
                  Platform.OS !== 'ios'
                ) {
                  setShowDatePicker(
                    false
                  );
                }

                if (
                  selectedDate
                ) {
                  setDueDate(
                    selectedDate
                  );
                }
              }}
            />

            {Platform.OS ===
              'ios' && (
              <Pressable
                onPress={() =>
                  setShowDatePicker(
                    false
                  )
                }
                style={{
                  alignSelf:
                    'flex-end',
                  backgroundColor:
                    c.tealSoft,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: c.teal,
                    fontWeight:
                      '800',
                  }}
                >
                  Done
                </Text>
              </Pressable>
            )}
          </>
        )}

        <ToggleRow
          title="Recurring bill"
          subtitle="Repeat this bill automatically"
          value={recurring}
          onPress={() =>
            setRecurring(
              !recurring
            )
          }
        />

        {recurring && (
          <>
            <Text
              style={[
                label,
                {
                  marginTop: 17,
                },
              ]}
            >
              Frequency
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {frequencies.map(
                (item) => {
                  const selected =
                    frequency ===
                    item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() =>
                        setFrequency(
                          item
                        )
                      }
                      style={{
                        paddingHorizontal: 13,
                        paddingVertical: 9,
                        borderRadius: 999,
                        backgroundColor:
                          selected
                            ? c.tealSoft
                            : c.card,
                        borderWidth: 1,
                        borderColor:
                          selected
                            ? c.teal
                            : c.line,
                      }}
                    >
                      <Text
                        style={{
                          color: c.ink,
                          textTransform:
                            'capitalize',
                          fontWeight:
                            selected
                              ? '800'
                              : '600',
                        }}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          </>
        )}

        <View
          style={{
            marginTop: 18,
          }}
        >
          <ToggleRow
            title="Autopay"
            subtitle="Mark if this is normally paid automatically"
            value={autopay}
            onPress={() =>
              setAutopay(!autopay)
            }
          />
        </View>

        <Text
          style={[
            label,
            {
              marginTop: 18,
            },
          ]}
        >
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
              textAlignVertical:
                'top',
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
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          {saving
            ? 'Saving...'
            : 'Create bill'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
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
            color: '#45484A',
            fontSize: 15,
            fontWeight: '800',
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: '#92999B',
            fontSize: 12,
            marginTop: 3,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={{
          width: 50,
          height: 29,
          borderRadius: 99,
          padding: 3,
          backgroundColor: value
            ? '#22BDA5'
            : '#D7DEDE',
          justifyContent: 'center',
          alignItems: value
            ? 'flex-end'
            : 'flex-start',
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
  );
}

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: 22,
  borderWidth: 1,
  borderColor: '#E5EAEA',
  padding: 16,
  marginBottom: 14,
};

const sectionTitle = {
  color: '#45484A',
  fontSize: 17,
  fontWeight: '800',
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