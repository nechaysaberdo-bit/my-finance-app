import React, {
  useCallback,
  useState,
} from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  getSavingsGoals,
} from '../lib/storage';

const c = {
  bg: '#F7FAF9',
  card: '#FFFFFF',
  ink: '#45484A',
  muted: '#92999B',
  teal: '#22BDA5',
  green: '#E7F5E8',
  yellow: '#FFF4D6',
  pink: '#FBE8ED',
  blue: '#E7F2FF',
  line: '#E5EAEA',
};

export default function Savings() {
  const router = useRouter();

  const [goals, setGoals] =
    useState([]);

  async function loadGoals() {
    const data =
      await getSavingsGoals();

    setGoals(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  const activeGoals = goals.filter(
    (goal) =>
      goal.status !== 'completed'
  );

  const completedGoals =
    goals.filter(
      (goal) =>
        goal.status === 'completed'
    );

  const totalSaved = goals.reduce(
    (sum, goal) =>
      sum +
      Number(
        goal.currentAmount || 0
      ),
    0
  );

  const totalTarget = goals.reduce(
    (sum, goal) =>
      sum +
      Number(
        goal.targetAmount || 0
      ),
    0
  );

  function GoalCard({
    goal,
    completed = false,
  }) {
    const current =
      Number(
        goal.currentAmount || 0
      );

    const target =
      Number(
        goal.targetAmount || 0
      );

    const progress =
      target > 0
        ? Math.min(
            (current / target) *
              100,
            100
          )
        : 0;

    const remaining =
      Math.max(
        target - current,
        0
      );

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname:
              '/savings-detail',
            params: {
              id: goal.id,
            },
          })
        }
        style={{
          backgroundColor:
            completed
              ? c.green
              : c.card,

          borderRadius: 22,

          borderWidth: 1,

          borderColor:
            completed
              ? '#CFE7D6'
              : c.line,

          padding: 16,

          marginBottom: 11,
        }}
      >
        <View
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
            }}
          >
            <Text
              style={{
                color: c.ink,
                fontSize: 17,
                fontWeight: '800',
              }}
            >
              {goal.name}
            </Text>

            <Text
              style={{
                color: c.muted,
                fontSize: 12,
                marginTop: 3,
              }}
            >
              {completed
                ? 'Goal reached ✨'
                : `₱${remaining.toLocaleString()} to go`}
            </Text>
          </View>

          <Text
            style={{
              color: c.ink,
              fontWeight: '800',
              fontSize: 17,
            }}
          >
            ₱
            {current.toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            height: 9,
            backgroundColor:
              '#EEF0F1',
            borderRadius: 99,
            overflow: 'hidden',
            marginTop: 14,
          }}
        >
          <View
            style={{
              width:
                `${progress}%`,
              height: 9,
              borderRadius: 99,
              backgroundColor:
                c.teal,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent:
              'space-between',
            marginTop: 7,
          }}
        >
          <Text
            style={{
              color: c.muted,
              fontSize: 11,
            }}
          >
            {progress.toFixed(0)}%
          </Text>

          <Text
            style={{
              color: c.muted,
              fontSize: 11,
            }}
          >
            Goal: ₱
            {target.toLocaleString()}
          </Text>
        </View>
      </Pressable>
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
        maxWidth: 760,
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
        Savings 🌱
      </Text>

      <Text
        style={{
          color: c.muted,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Give every peso you save a purpose.
      </Text>

      <View
        style={{
          backgroundColor:
            c.green,

          borderRadius: 24,

          padding: 18,

          marginBottom: 18,
        }}
      >
        <Text
          style={{
            color: c.muted,
            fontSize: 12,
          }}
        >
          TOTAL SAVED
        </Text>

        <Text
          style={{
            color: c.ink,
            fontSize: 32,
            fontWeight: '800',
            marginTop: 5,
          }}
        >
          ₱
          {totalSaved.toLocaleString()}
        </Text>

        <Text
          style={{
            color: c.muted,
            marginTop: 5,
          }}
        >
          Across {goals.length}{' '}
          goal
          {goals.length === 1
            ? ''
            : 's'}
        </Text>

        {totalTarget > 0 && (
          <Text
            style={{
              color: c.muted,
              fontSize: 11,
              marginTop: 4,
            }}
          >
            Combined target: ₱
            {totalTarget.toLocaleString()}
          </Text>
        )}
      </View>

      {activeGoals.length === 0 ? (
        <View
          style={{
            backgroundColor:
              c.card,

            borderRadius: 22,

            borderWidth: 1,
            borderColor: c.line,

            padding: 24,

            alignItems: 'center',

            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 34,
            }}
          >
            🌱
          </Text>

          <Text
            style={{
              color: c.ink,
              fontWeight: '800',
              fontSize: 18,
              marginTop: 8,
            }}
          >
            Start your first goal
          </Text>

          <Text
            style={{
              color: c.muted,
              textAlign: 'center',
              marginTop: 6,
            }}
          >
            Emergency fund, vacation, tuition, home deposit — whatever matters to you.
          </Text>
        </View>
      ) : (
        <>
          <Text
            style={{
              color: c.ink,
              fontSize: 17,
              fontWeight: '800',
              marginBottom: 10,
            }}
          >
            Active goals
          </Text>

          {activeGoals.map(
            (goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
              />
            )
          )}
        </>
      )}

      <Pressable
        onPress={() =>
          router.push(
            '/add-savings'
          )
        }
        style={{
          backgroundColor:
            c.teal,

          minHeight: 54,

          borderRadius: 18,

          alignItems: 'center',
          justifyContent:
            'center',

          marginTop: 3,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          ＋ Add savings goal
        </Text>
      </Pressable>

      {completedGoals.length >
        0 && (
        <View
          style={{
            marginTop: 22,
          }}
        >
          <Text
            style={{
              color: c.ink,
              fontSize: 17,
              fontWeight: '800',
              marginBottom: 10,
            }}
          >
            Completed ✨
          </Text>

          {completedGoals.map(
            (goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                completed
              />
            )
          )}
        </View>
      )}
    </ScrollView>
  );
}