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

  purple: '#EEE8FA',
  pink: '#F9E4E9',
  yellow: '#FFF4D6',
  blue: '#E8F2FF',
  green: '#E7F5ED',
};

export default function Plans() {
  const router = useRouter();

  const plans = [
    {
      icon: '💳',
      title: 'Credit Cards',
      subtitle: 'Balances, statements & installments',
      value: '₱12,480 due',
      color: c.purple,
      route: '/credit',
    },
    {
      icon: '🤝',
      title: 'Loans',
      subtitle: 'Balances & payment schedules',
      value: '₱42,500 left',
      color: c.pink,
      route: '/loans',
    },
    {
      icon: '🧾',
      title: 'Bills',
      subtitle: 'Upcoming & recurring bills',
      value: '₱5,900 due',
      color: c.yellow,
      route: '/bills',
    },
    {
      icon: '↔',
      title: 'Lend / Borrow',
      subtitle: 'Money between you and others',
      value: '₱7,000 owed to you',
      color: c.green,
      route: '/lendborrow',
    },
    {
      icon: '💰',
      title: 'Savings Goals',
      subtitle: 'Targets, deposits & progress',
      value: '₱9,500 saved',
      color: c.blue,
      route: '/savings',
    },
    {
      icon: '🛡️',
      title: 'Insurance & HMO',
      subtitle: 'Coverage, premiums & renewals',
      value: '4 active',
      color: c.green,
      route: '/insurance',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: 18,
        paddingBottom: 110,
        maxWidth: 800,
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
        Plans
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        Everything your future money is committed to.
      </Text>

      {plans.map((item) => (
        <Pressable
          key={item.title}
          onPress={() => router.push(item.route)}
          accessibilityRole="button"
          style={({ pressed }) => ({
            backgroundColor: pressed
              ? item.color
              : c.white,

            borderRadius: 21,
            borderWidth: 1,
            borderColor: c.line,

            padding: 15,
            marginBottom: 11,
          })}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
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
                  color: c.muted,
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {item.subtitle}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontWeight: '800',
                  color: c.ink,
                }}
              >
                {item.value}
              </Text>

              <Text
                style={{
                  color: c.muted,
                  fontSize: 20,
                }}
              >
                ›
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}