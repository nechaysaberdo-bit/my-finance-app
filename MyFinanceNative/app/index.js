import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  getAccounts,
  getCreditCards,
  getBills,
  getLoans,
  getSavingsGoals,
  getTransactions,
  getLendBorrowRecords,
} from '../lib/storage';

const c = {
  bg: '#FFF9F7',
  white: '#FFFFFF',
  ink: '#40343A',
  muted: '#9B8A91',

  pink: '#F9E4E9',
  mint: '#E7F5ED',
  butter: '#FFF4D6',
  lav: '#F2E5F5',
  blue: '#E6F3FC',

  cash: '#EEF7E8',
  bank: '#E2F2FC',
  wallet: '#E8F6F0',
  credit: '#F3E4F5',
  debt: '#FBE8EC',

  line: '#F0E4E7',
  accent: '#E15C87',
  teal: '#22BDA5',
};

export default function Home() {
  const router = useRouter();

  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [bills, setBills] = useState([]);
  const [loans, setLoans] = useState([]);
  const [savings, setSavings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lendBorrow, setLendBorrow] = useState([]);

  async function loadHome() {
    const [
      accountData,
      cardData,
      billData,
      loanData,
      savingsData,
      transactionData,
      lendBorrowData,
    ] = await Promise.all([
      getAccounts(),
      getCreditCards(),
      getBills(),
      getLoans(),
      getSavingsGoals(),
      getTransactions(),
      getLendBorrowRecords(),
    ]);

    setAccounts(accountData);
    setCards(cardData);
    setBills(billData);
    setLoans(loanData);
    setSavings(savingsData);
    setTransactions(transactionData);
    setLendBorrow(lendBorrowData);
  }

  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [])
  );

  const today = new Date();

  const greeting =
    today.getHours() < 12
      ? 'Good morning'
      : today.getHours() < 18
      ? 'Good afternoon'
      : 'Good evening';

  const dateLabel = today.toLocaleDateString(
    undefined,
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
  );

  // ==========================================
  // ACCOUNT GROUPS
  // ==========================================

  const cashAccounts = accounts.filter(
    (account) =>
      account.type === 'cash'
  );

  const bankAccounts = accounts.filter(
    (account) =>
      account.type === 'bank'
  );

  const ewalletAccounts = accounts.filter(
    (account) =>
      account.type === 'ewallet'
  );

  const otherAccounts = accounts.filter(
    (account) =>
      ![
        'cash',
        'bank',
        'ewallet',
      ].includes(account.type)
  );

  // ==========================================
  // TOTAL MONEY
  // ==========================================

  const totalCash = accounts.reduce(
    (sum, account) =>
      sum +
      Number(
        account.balance || 0
      ),
    0
  );

  const protectedSavings =
    savings.reduce(
      (sum, goal) =>
        goal.excludeFromSafeToEnjoy
          ? sum +
            Number(
              goal.currentAmount || 0
            )
          : sum,
      0
    );

  // ==========================================
  // BILLS
  // ==========================================

  const activeBills = bills.filter(
    (bill) =>
      bill.status !== 'paid'
  );

  const billsDue =
    activeBills.reduce(
      (sum, bill) =>
        sum +
        Number(
          bill.amount || 0
        ),
      0
    );

  // ==========================================
  // LOANS
  // ==========================================

  const activeLoans = loans.filter(
    (loan) =>
      loan.status !== 'paid' &&
      loan.owner === 'mine'
  );

  const loanDue =
    activeLoans.reduce(
      (sum, loan) =>
        sum +
        Number(
          loan.monthlyPayment || 0
        ),
      0
    );

  // ==========================================
  // CREDIT CARDS
  // ==========================================

  const cardBalance =
    cards.reduce(
      (sum, card) =>
        sum +
        Number(
          card.currentBalance || 0
        ),
      0
    );

  // ==========================================
  // SAFE TO ENJOY
  // ==========================================

  const safeToEnjoy = Math.max(
    totalCash -
      protectedSavings -
      billsDue -
      loanDue -
      cardBalance,
    0
  );

  // ==========================================
  // LEND / BORROW
  // ==========================================

  const receivable =
    lendBorrow
      .filter(
        (item) =>
          item.direction ===
            'lent' &&
          item.status !== 'paid'
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.remainingAmount ||
              0
          ),
        0
      );

  const borrowed =
    lendBorrow
      .filter(
        (item) =>
          item.direction ===
            'borrowed' &&
          item.status !== 'paid'
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.remainingAmount ||
              0
          ),
        0
      );

  // ==========================================
  // UPCOMING
  // ==========================================

  const upcomingItems =
    useMemo(() => {
      const items = [];

      activeBills.forEach(
        (bill) => {
          items.push({
            id: `bill-${bill.id}`,
            icon: '🧾',
            title: bill.name,
            amount:
              Number(
                bill.amount || 0
              ),
            date:
              bill.dueDate ||
              null,
            bg: c.butter,
            route: {
              pathname:
                '/pay-bill',
              params: {
                id: bill.id,
              },
            },
          });
        }
      );

      activeLoans.forEach(
        (loan) => {
          if (
            Number(
              loan.monthlyPayment ||
                0
            ) > 0
          ) {
            items.push({
              id: `loan-${loan.id}`,
              icon: '💸',
              title: loan.name,
              amount:
                Number(
                  loan.monthlyPayment ||
                    0
                ),
              date:
                loan.nextDueDate ||
                null,
              bg: c.pink,
              route: {
                pathname:
                  '/pay-loan',
                params: {
                  id: loan.id,
                },
              },
            });
          }
        }
      );

      return items
        .sort((a, b) => {
          if (!a.date && !b.date) {
            return 0;
          }

          if (!a.date) {
            return 1;
          }

          if (!b.date) {
            return -1;
          }

          return (
            new Date(
              `${a.date}T00:00:00`
            ) -
            new Date(
              `${b.date}T00:00:00`
            )
          );
        })
        .slice(0, 5);
    }, [
      activeBills,
      activeLoans,
    ]);

  // ==========================================
  // WEEKLY SPENDING
  // ==========================================

  const week =
    useMemo(() => {
      const days = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const date = new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() - i
        );

        days.push({
          date,

          label:
            date.toLocaleDateString(
              undefined,
              {
                weekday:
                  'short',
              }
            ),

          amount: 0,
        });
      }

      transactions.forEach(
        (transaction) => {
          if (
            transaction.type !==
            'expense'
          ) {
            return;
          }

          if (
            !transaction.date
          ) {
            return;
          }

          const txDate =
            new Date(
              transaction.date
            );

          txDate.setHours(
            0,
            0,
            0,
            0
          );

          const match =
            days.find(
              (day) =>
                day.date.getTime() ===
                txDate.getTime()
            );

          if (match) {
            match.amount +=
              Number(
                transaction.amount ||
                  0
              );
          }
        }
      );

      return days;
    }, [transactions]);

  const weeklyTotal =
    week.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const weeklyMax =
    Math.max(
      ...week.map(
        (item) =>
          item.amount
      ),
      1
    );

  function openAccount(account) {
    router.push({
      pathname: '/account',

      params: {
        id: account.id,
      },
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <View>
          <Text
            style={styles.greeting}
          >
            {greeting}, Becca! 🌷
          </Text>

          <Text
            style={styles.date}
          >
            {dateLabel}
          </Text>
        </View>

        <View style={styles.bell}>
          <Text
            style={{
              fontSize: 19,
            }}
          >
            🔔
          </Text>
        </View>
      </View>

      {/* MONEY AVAILABLE */}

      <View
        style={styles.availableCard}
      >
        <View
          style={styles.availableIcon}
        >
          <Text
            style={{
              fontSize: 25,
            }}
          >
            👛
          </Text>
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={styles.muted}
          >
            Money available to enjoy
          </Text>

          <Text
            style={
              styles.availableAmount
            }
          >
            ₱
            {safeToEnjoy.toLocaleString()}
          </Text>

          <Text
            style={styles.caption}
          >
            after protected savings and current commitments are set aside
          </Text>
        </View>
      </View>

      {/* MY ACCOUNTS HEADER */}

      <View
        style={
          styles.sectionHeading
        }
      >
        <Text
          style={styles.sectionTitle}
        >
          My accounts
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              '/accounts'
            )
          }
        >
          <Text
            style={styles.seeAll}
          >
            See all
          </Text>
        </Pressable>
      </View>

      {/* ACCOUNTS CONTAINER */}

      <View
        style={
          styles.accountContainer
        }
      >
        {/* CASH */}

        {cashAccounts.length >
          0 && (
          <View
            style={[
              styles.accountGroup,

              {
                backgroundColor:
                  c.cash,
              },
            ]}
          >
            <View
              style={
                styles.groupTop
              }
            >
              <View
                style={
                  styles.groupTitleWrap
                }
              >
                <View
                  style={
                    styles.iconBubble
                  }
                >
                  <Text>
                    💵
                  </Text>
                </View>

                <Text
                  style={
                    styles.groupTitle
                  }
                >
                  Cash
                </Text>
              </View>

              <Text
                style={
                  styles.groupTotal
                }
              >
                ₱
                {cashAccounts
                  .reduce(
                    (
                      sum,
                      account
                    ) =>
                      sum +
                      Number(
                        account.balance ||
                          0
                      ),
                    0
                  )
                  .toLocaleString()}
              </Text>
            </View>

            {cashAccounts.map(
              (account) => (
                <AccountRow
                  key={
                    account.id
                  }
                  account={
                    account
                  }
                  dotColor="#8ECF92"
                  onPress={() =>
                    openAccount(
                      account
                    )
                  }
                />
              )
            )}
          </View>
        )}

        {/* BANK */}

        {bankAccounts.length >
          0 && (
          <View
            style={[
              styles.accountGroup,

              {
                backgroundColor:
                  c.bank,
              },
            ]}
          >
            <View
              style={
                styles.groupTop
              }
            >
              <View
                style={
                  styles.groupTitleWrap
                }
              >
                <View
                  style={
                    styles.iconBubble
                  }
                >
                  <Text>
                    🏦
                  </Text>
                </View>

                <Text
                  style={
                    styles.groupTitle
                  }
                >
                  Bank account
                </Text>
              </View>

              <Text
                style={
                  styles.groupTotal
                }
              >
                ₱
                {bankAccounts
                  .reduce(
                    (
                      sum,
                      account
                    ) =>
                      sum +
                      Number(
                        account.balance ||
                          0
                      ),
                    0
                  )
                  .toLocaleString()}
              </Text>
            </View>

            {bankAccounts.map(
              (account) => (
                <AccountRow
                  key={
                    account.id
                  }
                  account={
                    account
                  }
                  dotColor="#57B9EB"
                  onPress={() =>
                    openAccount(
                      account
                    )
                  }
                />
              )
            )}
          </View>
        )}

        {/* E-WALLET */}

        {ewalletAccounts.length >
          0 && (
          <View
            style={[
              styles.accountGroup,

              {
                backgroundColor:
                  c.wallet,
              },
            ]}
          >
            <View
              style={
                styles.groupTop
              }
            >
              <View
                style={
                  styles.groupTitleWrap
                }
              >
                <View
                  style={
                    styles.iconBubble
                  }
                >
                  <Text>
                    📱
                  </Text>
                </View>

                <Text
                  style={
                    styles.groupTitle
                  }
                >
                  E-wallet
                </Text>
              </View>

              <Text
                style={
                  styles.groupTotal
                }
              >
                ₱
                {ewalletAccounts
                  .reduce(
                    (
                      sum,
                      account
                    ) =>
                      sum +
                      Number(
                        account.balance ||
                          0
                      ),
                    0
                  )
                  .toLocaleString()}
              </Text>
            </View>

            {ewalletAccounts.map(
              (account) => (
                <AccountRow
                  key={
                    account.id
                  }
                  account={
                    account
                  }
                  dotColor="#62C69F"
                  onPress={() =>
                    openAccount(
                      account
                    )
                  }
                />
              )
            )}
          </View>
        )}

        {/* OTHER ACCOUNTS */}

        {otherAccounts.length >
          0 && (
          <View
            style={[
              styles.accountGroup,

              {
                backgroundColor:
                  c.butter,
              },
            ]}
          >
            <View
              style={
                styles.groupTop
              }
            >
              <View
                style={
                  styles.groupTitleWrap
                }
              >
                <View
                  style={
                    styles.iconBubble
                  }
                >
                  <Text>
                    💰
                  </Text>
                </View>

                <Text
                  style={
                    styles.groupTitle
                  }
                >
                  Other
                </Text>
              </View>
            </View>

            {otherAccounts.map(
              (account) => (
                <AccountRow
                  key={
                    account.id
                  }
                  account={
                    account
                  }
                  dotColor="#D5A858"
                  onPress={() =>
                    openAccount(
                      account
                    )
                  }
                />
              )
            )}
          </View>
        )}

        {/* RECEIVABLE */}

        {receivable > 0 && (
          <Pressable
            onPress={() =>
              router.push(
                '/lendborrow'
              )
            }
            style={[
              styles.singleGroup,

              {
                backgroundColor:
                  c.mint,
              },
            ]}
          >
            <View
              style={
                styles.groupTitleWrap
              }
            >
              <View
                style={
                  styles.iconBubble
                }
              >
                <Text>
                  💰
                </Text>
              </View>

              <Text
                style={
                  styles.groupTitle
                }
              >
                Receivable
              </Text>
            </View>

            <Text
              style={
                styles.groupTotal
              }
            >
              ₱
              {receivable.toLocaleString()}
            </Text>
          </Pressable>
        )}

        {/* BORROWED */}

        {borrowed > 0 && (
          <Pressable
            onPress={() =>
              router.push(
                '/lendborrow'
              )
            }
            style={[
              styles.singleGroup,

              {
                backgroundColor:
                  c.debt,
              },
            ]}
          >
            <View
              style={
                styles.groupTitleWrap
              }
            >
              <View
                style={
                  styles.iconBubble
                }
              >
                <Text>
                  💸
                </Text>
              </View>

              <Text
                style={
                  styles.groupTitle
                }
              >
                Borrowed
              </Text>
            </View>

            <Text
              style={
                styles.groupTotal
              }
            >
              ₱
              {borrowed.toLocaleString()}
            </Text>
          </Pressable>
        )}

        {/* CREDIT CARDS */}

        {cards.length > 0 && (
          <View
            style={[
              styles.accountGroup,

              {
                backgroundColor:
                  c.credit,
              },
            ]}
          >
            <View
              style={
                styles.groupTop
              }
            >
              <View
                style={
                  styles.groupTitleWrap
                }
              >
                <View
                  style={
                    styles.iconBubble
                  }
                >
                  <Text>
                    💳
                  </Text>
                </View>

                <Text
                  style={
                    styles.groupTitle
                  }
                >
                  Credit card
                </Text>

                <Text
                  style={
                    styles.itemCount
                  }
                >
                  ({cards.length})
                </Text>
              </View>
            </View>

            {cards.map(
              (card) => {
                const available =
                  Math.max(
                    Number(
                      card.creditLimit ||
                        0
                    ) -
                      Number(
                        card.currentBalance ||
                          0
                      ),
                    0
                  );

                return (
                  <Pressable
                    key={
                      card.id
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          '/card',

                        params: {
                          id: card.id,
                        },
                      })
                    }
                    style={
                      styles.accountRow
                    }
                  >
                    <View
                      style={
                        styles.rowLeft
                      }
                    >
                      <View
                        style={[
                          styles.dot,

                          {
                            backgroundColor:
                              '#C895D5',
                          },
                        ]}
                      />

                      <Text
                        style={
                          styles.rowName
                        }
                      >
                        {card.name}
                      </Text>
                    </View>

                    <View
                      style={{
                        alignItems:
                          'flex-end',
                      }}
                    >
                      <Text
                        style={
                          styles.rowAmount
                        }
                      >
                        ₱
                        {available.toLocaleString()}
                      </Text>

                      <Text
                        style={
                          styles.mini
                        }
                      >
                        available
                      </Text>
                    </View>
                  </Pressable>
                );
              }
            )}
          </View>
        )}
      </View>

      {/* COMING UP */}

      <View
        style={
          styles.sectionHeading
        }
      >
        <Text
          style={styles.sectionTitle}
        >
          Coming up
        </Text>

        <Text
          style={styles.caption}
        >
          Bills & loans
        </Text>
      </View>

      <View style={styles.whiteCard}>
        {upcomingItems.length ===
        0 ? (
          <View
            style={styles.empty}
          >
            <Text
              style={{
                fontSize: 25,
              }}
            >
              ✨
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Nothing urgent
            </Text>

            <Text
              style={styles.caption}
            >
              No upcoming payments yet.
            </Text>
          </View>
        ) : (
          upcomingItems.map(
            (item) => (
              <Pressable
                key={item.id}
                style={
                  styles.upcomingRow
                }
                onPress={() =>
                  router.push(
                    item.route
                  )
                }
              >
                <View
                  style={[
                    styles.upcomingIcon,

                    {
                      backgroundColor:
                        item.bg,
                    },
                  ]}
                >
                  <Text>
                    {item.icon}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.upcomingName
                    }
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={
                      styles.caption
                    }
                  >
                    {item.date
                      ? formatDate(
                          item.date
                        )
                      : 'No due date'}
                  </Text>
                </View>

                <Text
                  style={
                    styles.upcomingAmount
                  }
                >
                  ₱
                  {item.amount.toLocaleString()}
                </Text>
              </Pressable>
            )
          )
        )}
      </View>

      {/* SAVINGS */}

      <View
        style={
          styles.sectionHeading
        }
      >
        <Text
          style={styles.sectionTitle}
        >
          Savings
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              '/savings'
            )
          }
        >
          <Text
            style={styles.seeAll}
          >
            See all
          </Text>
        </Pressable>
      </View>

      {savings.length === 0 ? (
        <Pressable
          onPress={() =>
            router.push(
              '/add-savings'
            )
          }
          style={styles.whiteCard}
        >
          <Text
            style={
              styles.savingsName
            }
          >
            🌱 Start a savings goal
          </Text>

          <Text
            style={[
              styles.caption,

              {
                marginTop: 4,
              },
            ]}
          >
            Give your saved money a purpose.
          </Text>
        </Pressable>
      ) : (
        savings
          .slice(0, 2)
          .map((goal) => {
            const current =
              Number(
                goal.currentAmount ||
                  0
              );

            const target =
              Number(
                goal.targetAmount ||
                  0
              );

            const progress =
              target > 0
                ? Math.min(
                    (current /
                      target) *
                      100,
                    100
                  )
                : 0;

            return (
              <Pressable
                key={goal.id}
                onPress={() =>
                  router.push({
                    pathname:
                      '/savings-detail',

                    params: {
                      id: goal.id,
                    },
                  })
                }
                style={
                  styles.whiteCard
                }
              >
                <View
                  style={
                    styles.savingsTop
                  }
                >
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.savingsName
                      }
                    >
                      🌱 {goal.name}
                    </Text>

                    <Text
                      style={
                        styles.caption
                      }
                    >
                      ₱
                      {current.toLocaleString()}{' '}
                      of ₱
                      {target.toLocaleString()}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.progressText
                    }
                  >
                    {progress.toFixed(
                      0
                    )}
                    %
                  </Text>
                </View>

                <View
                  style={
                    styles.progressTrack
                  }
                >
                  <View
                    style={[
                      styles.progressFill,

                      {
                        width:
                          `${progress}%`,
                      },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })
      )}

      {/* WEEKLY SPENDING - LAST */}

      <View
        style={
          styles.sectionHeading
        }
      >
        <View>
          <Text
            style={styles.sectionTitle}
          >
            Weekly spending
          </Text>

          <Text
            style={styles.caption}
          >
            Last 7 days
          </Text>
        </View>

        <Text
          style={styles.graphTotal}
        >
          ₱
          {weeklyTotal.toLocaleString()}
        </Text>
      </View>

      <View style={styles.whiteCard}>
        <View style={styles.chart}>
          {week.map((day) => {
            const height =
              day.amount === 0
                ? 4
                : Math.max(
                    (day.amount /
                      weeklyMax) *
                      100,
                    10
                  );

            return (
              <View
                key={
                  day.date.toISOString()
                }
                style={
                  styles.chartColumn
                }
              >
                <View
                  style={
                    styles.barSpace
                  }
                >
                  {day.amount >
                    0 && (
                    <Text
                      style={
                        styles.barValue
                      }
                    >
                      {compact(
                        day.amount
                      )}
                    </Text>
                  )}

                  <View
                    style={[
                      styles.bar,

                      {
                        height,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={styles.day}
                >
                  {day.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function AccountRow({
  account,
  onPress,
  dotColor,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.accountRow}
    >
      <View
        style={styles.rowLeft}
      >
        <View
          style={[
            styles.dot,

            {
              backgroundColor:
                dotColor ||
                '#57B9EB',
            },
          ]}
        />

        <Text
          style={styles.rowName}
        >
          {account.name}
        </Text>
      </View>

      <Text
        style={styles.rowAmount}
      >
        ₱
        {Number(
          account.balance || 0
        ).toLocaleString()}
      </Text>
    </Pressable>
  );
}

function formatDate(date) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
    }
  );
}

function compact(value) {
  const number =
    Number(value || 0);

  if (number >= 1000) {
    return `₱${(
      number / 1000
    ).toFixed(
      number >= 10000
        ? 0
        : 1
    )}k`;
  }

  return `₱${Math.round(
    number
  )}`;
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.bg,
    },

    content: {
      padding: 18,
      paddingBottom: 100,
      maxWidth: 760,
      width: '100%',
      alignSelf: 'center',
    },

    header: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'flex-start',
      marginBottom: 18,
    },

    greeting: {
      color: c.ink,
      fontSize: 27,
      fontWeight: '800',
    },

    date: {
      color: c.muted,
      fontSize: 13,
      marginTop: 4,
    },

    bell: {
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: c.pink,
      alignItems: 'center',
      justifyContent: 'center',
    },

    availableCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#FCECEF',
      borderRadius: 24,
      padding: 17,
      gap: 14,
      marginBottom: 20,
    },

    availableIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor:
        '#F5D4DE',
      alignItems: 'center',
      justifyContent: 'center',
    },

    availableAmount: {
      color: c.ink,
      fontSize: 33,
      fontWeight: '800',
      marginVertical: 2,
    },

    muted: {
      color: c.muted,
      fontSize: 13,
    },

    caption: {
      color: c.muted,
      fontSize: 11,
    },

    mini: {
      color: c.muted,
      fontSize: 9,
      marginTop: 1,
    },

    sectionHeading: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 9,
      marginTop: 4,
    },

    sectionTitle: {
      color: c.ink,
      fontSize: 18,
      fontWeight: '800',
    },

    seeAll: {
      color: c.accent,
      fontWeight: '800',
      fontSize: 12,
    },

    accountContainer: {
      backgroundColor:
        c.white,
      borderRadius: 22,
      padding: 10,
      borderWidth: 1,
      borderColor: c.line,
      marginBottom: 18,
    },

    accountGroup: {
      borderRadius: 15,
      padding: 7,
      marginBottom: 7,
    },

    singleGroup: {
      minHeight: 52,
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginBottom: 7,

      flexDirection: 'row',
      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    groupTop: {
      minHeight: 40,

      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      paddingHorizontal: 3,
    },

    groupTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },

    iconBubble: {
      width: 32,
      height: 32,

      borderRadius: 10,

      backgroundColor:
        'rgba(255,255,255,0.52)',

      alignItems: 'center',

      justifyContent:
        'center',

      marginRight: 8,
    },

    groupTitle: {
      color: c.ink,

      fontSize: 14,

      fontWeight: '800',
    },

    itemCount: {
      color: c.muted,

      fontSize: 11,

      marginLeft: 4,
    },

    groupTotal: {
      color: c.ink,

      fontSize: 14,

      fontWeight: '800',
    },

    accountRow: {
      minHeight: 36,

      borderRadius: 10,

      paddingHorizontal: 10,

      paddingVertical: 6,

      marginTop: 4,

      backgroundColor:
        'rgba(255,255,255,0.52)',

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    rowLeft: {
      flexDirection: 'row',

      alignItems: 'center',

      flex: 1,

      paddingRight: 10,
    },

    dot: {
      width: 8,
      height: 8,

      borderRadius: 99,

      marginRight: 8,
    },

    rowName: {
      color: c.ink,

      fontSize: 13,

      fontWeight: '600',
    },

    rowAmount: {
      color: c.ink,

      fontSize: 13,

      fontWeight: '800',
    },

    whiteCard: {
      backgroundColor:
        c.white,

      borderRadius: 18,

      borderWidth: 1,

      borderColor: c.line,

      padding: 14,

      marginBottom: 14,
    },

    upcomingRow: {
      minHeight: 56,

      flexDirection: 'row',

      alignItems: 'center',

      borderBottomWidth: 1,

      borderBottomColor:
        c.line,

      paddingVertical: 8,
    },

    upcomingIcon: {
      width: 38,

      height: 38,

      borderRadius: 12,

      alignItems: 'center',

      justifyContent:
        'center',

      marginRight: 10,
    },

    upcomingName: {
      color: c.ink,

      fontSize: 13,

      fontWeight: '800',
    },

    upcomingAmount: {
      color: c.ink,

      fontSize: 13,

      fontWeight: '800',
    },

    empty: {
      alignItems: 'center',

      paddingVertical: 12,
    },

    emptyTitle: {
      color: c.ink,

      fontWeight: '800',

      marginTop: 5,
    },

    savingsTop: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'flex-start',
    },

    savingsName: {
      color: c.ink,

      fontSize: 14,

      fontWeight: '800',

      marginBottom: 3,
    },

    progressText: {
      color: c.teal,

      fontWeight: '800',
    },

    progressTrack: {
      height: 7,

      borderRadius: 99,

      backgroundColor:
        '#F0ECEE',

      overflow: 'hidden',

      marginTop: 11,
    },

    progressFill: {
      height: 7,

      borderRadius: 99,

      backgroundColor:
        c.teal,
    },

    graphTotal: {
      color: c.ink,

      fontSize: 16,

      fontWeight: '800',
    },

    chart: {
      height: 145,

      flexDirection: 'row',

      alignItems: 'flex-end',

      justifyContent:
        'space-between',
    },

    chartColumn: {
      flex: 1,

      alignItems: 'center',
    },

    barSpace: {
      height: 115,

      justifyContent:
        'flex-end',

      alignItems: 'center',
    },

    bar: {
      width: 18,

      minHeight: 4,

      borderRadius: 7,

      backgroundColor:
        '#E8A1B6',
    },

    barValue: {
      color: c.muted,

      fontSize: 8,

      marginBottom: 3,
    },

    day: {
      color: c.muted,

      fontSize: 9,

      marginTop: 6,
    },
  });