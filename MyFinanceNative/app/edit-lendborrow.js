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
  getLendBorrowRecords,
  updateLendBorrowRecord,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  green: '#E7F5E8',
  blue: '#E7F2FF',
  line: '#E5EAEA',
};

export default function EditLendBorrow() {
  const router = useRouter();
  const { id } =
    useLocalSearchParams();

  const [records, setRecords] =
    useState([]);

  const [loaded, setLoaded] =
    useState(false);

  const [person, setPerson] =
    useState('');

  const [dueDate, setDueDate] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  async function loadRecord() {
    setRecords(
      await getLendBorrowRecords()
    );
  }

  useFocusEffect(
    useCallback(() => {
      setLoaded(false);
      loadRecord();
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

  useEffect(() => {
    if (
      !record ||
      loaded
    ) {
      return;
    }

    setPerson(
      record.person || ''
    );

    setDueDate(
      record.dueDate || ''
    );

    setNotes(
      record.notes || ''
    );

    setLoaded(true);
  }, [record, loaded]);

  async function handleSave() {
    if (!person.trim()) {
      Alert.alert(
        'Enter the person’s name'
      );

      return;
    }

    try {
      setSaving(true);

      await updateLendBorrowRecord(
        id,
        {
          person:
            person.trim(),

          dueDate:
            dueDate || null,

          notes,
        }
      );

      router.replace({
        pathname:
          '/lendborrow-detail',

        params: {
          id,
        },
      });
    } catch (error) {
      Alert.alert(
        'Could not update',
        error?.message ||
          'Something went wrong.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (!record) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            c.bg,
          alignItems:
            'center',
          justifyContent:
            'center',
        }}
      >
        <Text
          style={{
            color: c.ink,
            fontWeight:
              '800',
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  const isLent =
    record.direction ===
    'lent';

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
            backgroundColor:
              c.card,
            borderWidth: 1,
            borderColor:
              c.line,
            alignItems:
              'center',
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

        <View>
          <Text
            style={{
              color: c.muted,
              fontSize: 12,
            }}
          >
            {isLent
              ? 'Money lent'
              : 'Money borrowed'}
          </Text>

          <Text
            style={{
              color: c.ink,
              fontSize: 24,
              fontWeight: '800',
            }}
          >
            Edit record
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor:
            isLent
              ? c.green
              : c.blue,

          borderRadius: 22,
          padding: 17,
          marginBottom: 14,
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
            fontSize: 28,
            fontWeight: '800',
            marginTop: 4,
          }}
        >
          ₱
          {Number(
            record.originalAmount ||
              0
          ).toLocaleString()}
        </Text>

        <Text
          style={{
            color: c.muted,
            fontSize: 12,
            marginTop: 5,
          }}
        >
          Original amount and direction are locked to protect repayment history.
        </Text>
      </View>

      <View style={card}>
        <Text style={label}>
          Person
        </Text>

        <TextInput
          value={person}
          onChangeText={setPerson}
          style={input}
        />

        <Text style={label}>
          Due date
        </Text>

        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
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
          backgroundColor:
            c.teal,
          minHeight: 54,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent:
            'center',
          marginTop: 18,
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
            : 'Save changes'}
        </Text>
      </Pressable>
    </ScrollView>
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