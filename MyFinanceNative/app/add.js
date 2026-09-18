import React from 'react';
import {
  ScrollView,
  Text,
  Pressable,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

const c = {
  bg: '#FFF9F7',
  ink: '#40343A',
  muted: '#8B7E84',
  white: '#FFFFFF',
  line: '#F1E7E9',

  green: '#E7F5ED',
  yellow: '#FFF4D6',
  purple: '#EEE8FA',
  pink: '#F9E4E9',
  blue: '#E8F2FF',
};

export default function Add() {
  const router = useRouter();

  const actions = [
    {
      icon: '🌷',
      title: 'Income',
      subtitle: 'Record money received',
      color: c.green,
      route: '/add-income',
    },
    {
      icon: '🧺',
      title: 'Expense',
      subtitle: 'Record money spent',
      color: c.yellow,
      route: '/add-expense',
    },
    {
      icon: '💳',
      title: 'Card purchase',
      subtitle: 'Add a credit card transaction',
      color: c.purple,
      route: '/credit',
    },
    {
      icon: '✓',
      title: 'Card payment',
      subtitle: 'Record payment toward a card',
      color: c.purple,
      route: '/credit',
    },
    {
      icon: '🧾',
      title: 'Bill payment',
      subtitle: 'Record a bill as paid',
      color: c.yellow,
      route: '/bills',
    },
    {
      icon: '💰',
      title: 'Savings deposit',
      subtitle: 'Add money to a savings goal',
      color: c.blue,
      route: '/savings',
    },
    {
      icon: '🤝',
      title: 'Loan payment',
      subtitle: 'Reduce a loan balance',
      color: c.pink,
      route: '/loans',
    },
    {
      icon: '↔',
      title: 'Lend / Borrow',
      subtitle: 'Record money between people',
      color: c.green,
      route: '/lendborrow',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: 18,
        paddingBottom: 110,
        maxWidth: 700,
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
        Add something
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: c.muted,
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        What would you like to record?
      </Text>

      {actions.map((item) => (
        <Pressable
          key={item.title}
          onPress={() => router.push(item.route)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',

            backgroundColor: pressed
              ? item.color
              : c.white,

            borderRadius: 20,
            padding: 14,

            borderWidth: 1,
            borderColor: c.line,

            marginBottom: 10,
          })}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: item.color,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 13,
            }}
          >
            <Text style={{ fontSize: 21 }}>
              {item.icon}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: c.ink,
              }}
            >
              {item.title}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: c.muted,
                marginTop: 2,
              }}
            >
              {item.subtitle}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 22,
              color: c.muted,
            }}
          >
            ›
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}