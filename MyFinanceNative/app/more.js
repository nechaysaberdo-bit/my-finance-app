import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, ListItem } from '../components/ui';

export default function More() {
  const router = useRouter();

  return (
    <Screen title="My space ✿" kicker="Make it yours">
      <Card>
        <ListItem
          icon="👛"
          title="Accounts"
          right="›"
          onPress={() => router.push('/accounts')}
        />

        <ListItem
          icon="💗"
          title="Theme"
          right="Petal"
        />

        <ListItem
          icon="₱"
          title="Currency"
          right="PHP"
        />

        <ListItem
          icon="🔐"
          title="Face ID"
          right="Later"
        />

        <ListItem
          icon="☁️"
          title="Cloud sync"
          right="Off"
        />
      </Card>
    </Screen>
  );
}