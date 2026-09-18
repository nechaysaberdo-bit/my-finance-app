import React from 'react';

import {
  Tabs,
} from 'expo-router';

import {
  Text,
} from 'react-native';

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const colors = {
  background: '#FFFCFB',
  accent: '#E15C87',
  inactive: '#8B7E84',
  border: '#F1E7E9',
};

function TabIcon({
  symbol,
  focused,
}) {
  return (
    <Text
      style={{
        fontSize: 19,
        color: focused
          ? colors.accent
          : colors.inactive,
      }}
    >
      {symbol}
    </Text>
  );
}

function AppTabs() {
  const insets =
    useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          colors.accent,

        tabBarInactiveTintColor:
          colors.inactive,

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 1,
        },

        tabBarStyle: {
          height:
            62 +
            Math.max(
              insets.bottom,
              6
            ),

          paddingTop: 6,

          paddingBottom:
            Math.max(
              insets.bottom,
              6
            ),

          backgroundColor:
            colors.background,

          borderTopColor:
            colors.border,
        },

        sceneStyle: {
          paddingTop:
            insets.top,

          backgroundColor:
            '#FFF9F7',
        },
      }}
    >
      {/* MAIN NAVIGATION */}

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',

          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              symbol="⌂"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',

          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              symbol="≡"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',

          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              symbol="◎"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: 'More',

          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              symbol="•••"
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',

          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              symbol="▣"
              focused={focused}
            />
          ),
        }}
      />

      {/* HIDDEN ADD SCREEN */}

      <Tabs.Screen
        name="add"
        options={{
          href: null,
        }}
      />

      {/* INCOME / EXPENSE */}

      <Tabs.Screen
        name="income"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="add-income"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="expenses"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="add-expense"
        options={{ href: null }}
      />

      {/* ACCOUNTS */}

      <Tabs.Screen
        name="money"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="add-account"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="account-detail"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="edit-account"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="transfer"
        options={{ href: null }}
      />

      {/* CREDIT */}

      <Tabs.Screen
        name="credit"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="card"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="add-credit-card"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="edit-credit-card"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="update-statement"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="soa"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="installment"
        options={{ href: null }}
      />

      {/* LOANS */}

      <Tabs.Screen
        name="loans"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="loan"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="add-loan"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="edit-loan"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="pay-loan"
        options={{ href: null }}
      />

      {/* LEND / BORROW */}

      <Tabs.Screen
        name="lendborrow"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="add-lendborrow"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="lendborrow-detail"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="edit-lendborrow"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="repay-lendborrow"
        options={{ href: null }}
      />

      {/* BILLS */}

      <Tabs.Screen
        name="bills"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="add-bill"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="pay-bill"
        options={{ href: null }}
      />

      {/* SAVINGS */}

      <Tabs.Screen
        name="savings"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="add-savings"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="savings-detail"
        options={{ href: null }}
      />

      {/* OTHER */}

      <Tabs.Screen
        name="insurance"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="insurance-detail"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="obligations"
        options={{ href: null }}
      />
    </Tabs>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppTabs />
    </SafeAreaProvider>
  );
}