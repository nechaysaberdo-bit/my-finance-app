import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';

const c = {
  bg: '#FFF9F7',
  card: '#FFFFFF',
  ink: '#3F3338',
  muted: '#9A8A91',
  pink: '#F9E4E9',
  mint: '#E7F5ED',
  line: '#F1E7E9',
  accent: '#E15C87',
};

export default function Insurance() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: 18,
        paddingBottom: 95,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: '800',
          color: c.ink,
        }}
      >
        Insurance & HMO 🛡️
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Policies, coverage, premiums and renewals.
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: c.mint,
            borderRadius: 20,
            padding: 15,
          }}
        >
          <Text style={{ color: c.muted }}>
            Active policies
          </Text>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '800',
              color: c.ink,
              marginTop: 7,
            }}
          >
            4
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: c.pink,
            borderRadius: 20,
            padding: 15,
          }}
        >
          <Text style={{ color: c.muted }}>
            Premiums due
          </Text>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '800',
              color: c.ink,
              marginTop: 7,
            }}
          >
            ₱3,200
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/insurance-detail')}
        style={{
          backgroundColor: c.card,
          borderRadius: 22,
          padding: 16,
          borderWidth: 1,
          borderColor: c.line,
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: c.ink,
          }}
        >
          Pamilya Protect
        </Text>

        <Text
          style={{
            color: c.muted,
            marginTop: 3,
          }}
        >
          Life insurance · Active
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 15,
          }}
        >
          <Text style={{ color: c.muted }}>
            Coverage
          </Text>

          <Text style={{ fontWeight: '800', color: c.ink }}>
            ₱1,000,000
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <Text style={{ color: c.muted }}>
            Next premium
          </Text>

          <Text style={{ fontWeight: '800', color: c.ink }}>
            Sep 15
          </Text>
        </View>
      </Pressable>

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
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: c.ink,
          }}
        >
          Family HMO
        </Text>

        <Text style={{ color: c.muted, marginTop: 3 }}>
          Health / HMO · Active
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 15,
          }}
        >
          <Text style={{ color: c.muted }}>
            Covered members
          </Text>

          <Text style={{ fontWeight: '800', color: c.ink }}>
            4
          </Text>
        </View>
      </View>

      <Pressable
        style={{
          backgroundColor: c.accent,
          borderRadius: 16,
          padding: 15,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontWeight: '800',
          }}
        >
          + Add insurance / HMO
        </Text>
      </Pressable>
    </ScrollView>
  );
}