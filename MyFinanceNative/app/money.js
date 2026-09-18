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
  mint: '#E7F5ED',
  butter: '#FFF4D6',
  blue: '#E8F2FF',
  line: '#F1E7E9',
};

export default function Money() {
  const router = useRouter();

  const Tile = ({ title, subtitle, value, bg, emoji, route }) => (
    <Pressable
      onPress={() => router.push(route)}
      style={{
        backgroundColor: bg,
        borderRadius: 22,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '800',
          color: c.ink,
          marginTop: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 3,
        }}
      >
        {subtitle}
      </Text>

      <Text
        style={{
          fontSize: 23,
          fontWeight: '800',
          color: c.ink,
          marginTop: 12,
        }}
      >
        {value}
      </Text>
    </Pressable>
  );

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
        Money 🌷
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Income, spending and savings in one place.
      </Text>

      <Tile
        title="Income"
        subtitle="Custom income categories"
        value="₱85,000 this month"
        bg={c.mint}
        emoji="🌷"
        route="/income"
      />

      <Tile
        title="Expenses"
        subtitle="Custom expense categories"
        value="₱31,300 this month"
        bg={c.butter}
        emoji="🧺"
        route="/expenses"
      />

      <Tile
        title="Savings"
        subtitle="Goals, deposits and withdrawals"
        value="₱9,500 saved"
        bg={c.blue}
        emoji="💰"
        route="/savings"
      />
    </ScrollView>
  );
}