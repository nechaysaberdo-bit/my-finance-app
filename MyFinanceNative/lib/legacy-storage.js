import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = '@myfinance_transactions';

/*
  Transaction structure:

  {
    id: string,
    type: 'income' | 'expense',
    amount: number,
    category: string,
    description: string,
    date: string,
    paymentMethod: string,
    recurring: boolean,
    notes: string,
    createdAt: string
  }
*/

export async function getTransactions() {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Unable to load transactions:', error);
    return [];
  }
}

export async function addTransaction(transaction) {
  try {
    const transactions = await getTransactions();

    const newTransaction = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...transaction,
    };

    const updatedTransactions = [
      newTransaction,
      ...transactions,
    ];

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(updatedTransactions)
    );

    return newTransaction;
  } catch (error) {
    console.error('Unable to save transaction:', error);
    throw error;
  }
}

export async function updateTransaction(id, changes) {
  try {
    const transactions = await getTransactions();

    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === id
        ? { ...transaction, ...changes }
        : transaction
    );

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(updatedTransactions)
    );

    return updatedTransactions;
  } catch (error) {
    console.error('Unable to update transaction:', error);
    throw error;
  }
}

export async function deleteTransaction(id) {
  try {
    const transactions = await getTransactions();

    const updatedTransactions = transactions.filter(
      (transaction) => transaction.id !== id
    );

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(updatedTransactions)
    );

    return updatedTransactions;
  } catch (error) {
    console.error('Unable to delete transaction:', error);
    throw error;
  }
}

export async function getTransactionTotals() {
  const transactions = await getTransactions();

  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  return {
  income,
  expenses,
  balance: income - expenses,
};
}
// ==========================================
// ACCOUNTS
// ==========================================

const ACCOUNTS_KEY = '@myfinance_accounts';

export async function getAccounts() {
  try {
    const data = await AsyncStorage.getItem(ACCOUNTS_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Unable to load accounts:', error);
    return [];
  }
}

export async function addAccount(account) {
  try {
    const accounts = await getAccounts();

    const newAccount = {
      id: Date.now().toString(),
      name: account.name,
      type: account.type,
      balance: Number(account.balance || 0),
      currency: account.currency || 'PHP',
      includedInAvailable: account.includedInAvailable ?? true,
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [
      ...accounts,
      newAccount,
    ];

    await AsyncStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(updatedAccounts)
    );

    return newAccount;
  } catch (error) {
    console.error('Unable to save account:', error);
    throw error;
  }
}

export async function updateAccount(id, changes) {
  const accounts = await getAccounts();

  const updatedAccounts = accounts.map((account) =>
    account.id === id
      ? {
          ...account,
          ...changes,
        }
      : account
  );

  await AsyncStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts)
  );

  return updatedAccounts;
}

export async function deleteAccount(id) {
  const accounts = await getAccounts();

  const updatedAccounts = accounts.filter(
    (account) => account.id !== id
  );

  await AsyncStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts)
  );

  return updatedAccounts;
}// ==========================================
// TRANSFERS
// ==========================================

export async function transferBetweenAccounts({
  fromAccountId,
  toAccountId,
  amount,
  note = '',
}) {
  const numericAmount = Number(amount || 0);

  if (!fromAccountId || !toAccountId) {
    throw new Error('Both accounts are required.');
  }

  if (fromAccountId === toAccountId) {
    throw new Error('Choose two different accounts.');
  }

  if (numericAmount <= 0) {
    throw new Error('Enter a valid transfer amount.');
  }

  const accounts = await getAccounts();

  const fromAccount = accounts.find(
    (a) => String(a.id) === String(fromAccountId)
  );

  const toAccount = accounts.find(
    (a) => String(a.id) === String(toAccountId)
  );

  if (!fromAccount || !toAccount) {
    throw new Error('Account not found.');
  }

  if (Number(fromAccount.balance || 0) < numericAmount) {
    throw new Error('Not enough balance in the source account.');
  }

  const updatedAccounts = accounts.map((account) => {
    if (String(account.id) === String(fromAccountId)) {
      return {
        ...account,
        balance:
          Number(account.balance || 0) - numericAmount,
      };
    }

    if (String(account.id) === String(toAccountId)) {
      return {
        ...account,
        balance:
          Number(account.balance || 0) + numericAmount,
      };
    }

    return account;
  });

  await AsyncStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts)
  );

  const transactions = await getTransactions();

  const transferTransaction = {
    id: Date.now().toString(),
    type: 'transfer',
    amount: numericAmount,
    fromAccountId,
    toAccountId,
    description: `Transfer: ${fromAccount.name} → ${toAccount.name}`,
    notes: note,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([
      transferTransaction,
      ...transactions,
    ])
  );

  return transferTransaction;
}// ==========================================
// ACCOUNT-AWARE INCOME
// ==========================================

export async function addIncomeToAccount({
  amount,
  category,
  description,
  accountId,
  notes = '',
}) {
  const numericAmount = Number(amount || 0);

  if (numericAmount <= 0) {
    throw new Error('Enter a valid income amount.');
  }

  if (!accountId) {
    throw new Error('Choose an account to receive the money.');
  }

  const accounts = await getAccounts();

  const account = accounts.find(
    (item) => String(item.id) === String(accountId)
  );

  if (!account) {
    throw new Error('Account not found.');
  }

  // Increase selected account balance
  const updatedAccounts = accounts.map((item) =>
    String(item.id) === String(accountId)
      ? {
          ...item,
          balance:
            Number(item.balance || 0) + numericAmount,
        }
      : item
  );

  await AsyncStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts)
  );

  // Create transaction
  const transaction = {
    id: Date.now().toString(),
    type: 'income',
    amount: numericAmount,
    category: category || 'Income',
    description: description || category || 'Income',
    accountId,
    accountName: account.name,
    notes,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const transactions = await getTransactions();

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([
      transaction,
      ...transactions,
    ])
  );

  return {
    transaction,
    account: {
      ...account,
      balance:
        Number(account.balance || 0) + numericAmount,
    },
  };
}// ==========================================
// ACCOUNT / CREDIT-CARD AWARE EXPENSE
// ==========================================

export async function addExpense({
  amount,
  category,
  description,
  paymentSourceType,
  paymentSourceId,
  notes = '',
  installment = false,
  installmentMonths = null,
}) {
  const numericAmount = Number(amount || 0);

  if (numericAmount <= 0) {
    throw new Error('Enter a valid expense amount.');
  }

  if (!paymentSourceType || !paymentSourceId) {
    throw new Error('Choose how this expense was paid.');
  }

  // ==========================================
  // CASH / BANK / E-WALLET
  // ==========================================

  if (paymentSourceType === 'account') {
    const accounts = await getAccounts();

    const account = accounts.find(
      (item) =>
        String(item.id) === String(paymentSourceId)
    );

    if (!account) {
      throw new Error('Payment account not found.');
    }

    if (Number(account.balance || 0) < numericAmount) {
      throw new Error(
        `Not enough balance in ${account.name}.`
      );
    }

    const newBalance =
      Number(account.balance || 0) - numericAmount;

    const updatedAccounts = accounts.map((item) =>
      String(item.id) === String(paymentSourceId)
        ? {
            ...item,
            balance: newBalance,
          }
        : item
    );

    await AsyncStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(updatedAccounts)
    );

    const transaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: numericAmount,
      category: category || 'Expense',
      description:
        description || category || 'Expense',

      paymentSourceType: 'account',
      paymentSourceId,

      // Keep these for our existing Account Activity screen
      accountId: paymentSourceId,
      accountName: account.name,

      notes,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const transactions = await getTransactions();

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify([
        transaction,
        ...transactions,
      ])
    );

    return {
      transaction,
      source: account,
      sourceName: account.name,
      newBalance,
    };
  }

  // ==========================================
  // CREDIT CARD
  // ==========================================

  if (paymentSourceType === 'credit_card') {
    /*
      We'll connect this branch to the actual Credit Card
      storage in the next step.

      For now, this prevents us from accidentally treating
      a credit-card purchase as money leaving a bank account.
    */

    throw new Error(
      'Credit card payments are being connected next.'
    );
  }

  throw new Error('Invalid payment source.');
}// ==========================================
// CREDIT CARDS
// ==========================================

const CREDIT_CARDS_KEY = '@myfinance_credit_cards';

export async function getCreditCards() {
  try {
    const data = await AsyncStorage.getItem(CREDIT_CARDS_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Unable to load credit cards:', error);
    return [];
  }
}

export async function addCreditCard({
  name,
  issuer = '',
  creditLimit,
  currentBalance = 0,

  statementBalance = 0,
  amountDue = 0,
  minimumDue = 0,

  statementDate = null,
  dueDate = null,

  cutoffDay = null,
  dueDaysAfterCutoff = 20,

  notes = '',
}) {
  const numericLimit =
    Number(creditLimit || 0);

  const numericCurrent =
    Number(currentBalance || 0);

  const numericStatement =
    Number(statementBalance || 0);

  const numericAmountDue =
    Number(amountDue || 0);

  const numericMinimum =
    Number(minimumDue || 0);

  if (!name?.trim()) {
    throw new Error(
      'Enter a credit card name.'
    );
  }

  if (numericLimit <= 0) {
    throw new Error(
      'Enter a valid credit limit.'
    );
  }

  const cards =
    await getCreditCards();

  const card = {
    id: Date.now().toString(),

    name: name.trim(),
    issuer: issuer.trim(),

    creditLimit:
      numericLimit,

    currentBalance:
      numericCurrent,

    statementBalance:
      numericStatement,

    amountDue:
      numericAmountDue,

    minimumDue:
      numericMinimum,

    statementDate,

    dueDate,

    cutoffDay:
      cutoffDay
        ? Number(cutoffDay)
        : null,

    dueDaysAfterCutoff:
      Number(
        dueDaysAfterCutoff || 20
      ),

    status: 'active',

    notes,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    CREDIT_CARDS_KEY,
    JSON.stringify([
      card,
      ...cards,
    ])
  );

  return card;
}export async function updateCreditCardStatement(
  cardId,
  {
    statementBalance = 0,
    amountDue = 0,
    minimumDue = 0,
    statementDate = null,
    dueDate = null,
  }
) {
  const cards = await getCreditCards();

  const updatedCards = cards.map((card) => {
    if (String(card.id) !== String(cardId)) {
      return card;
    }

    return {
      ...card,

      statementBalance: Number(
        statementBalance || 0
      ),

      amountDue: Number(
        amountDue || 0
      ),

      minimumDue: Number(
        minimumDue || 0
      ),

      statementDate:
        statementDate || null,

      dueDate:
        dueDate || null,

      updatedAt: new Date().toISOString(),
    };
  });

  await AsyncStorage.setItem(
    CREDIT_CARDS_KEY,
    JSON.stringify(updatedCards)
  );

  return updatedCards.find(
    (card) =>
      String(card.id) === String(cardId)
  );
}export async function updateCreditCardInfo(
  cardId,
  {
    name,
    issuer = '',
    creditLimit,
    cutoffDay = null,
    dueDaysAfterCutoff = 20,
    notes = '',
  }
) {
  const cards = await getCreditCards();

  const numericLimit = Number(creditLimit || 0);

  if (!name?.trim()) {
    throw new Error('Enter a card name.');
  }

  if (numericLimit <= 0) {
    throw new Error('Enter a valid credit limit.');
  }

  if (
    cutoffDay &&
    (Number(cutoffDay) < 1 ||
      Number(cutoffDay) > 31)
  ) {
    throw new Error('Enter a valid cutoff day.');
  }

  const updatedCards = cards.map((card) =>
    String(card.id) === String(cardId)
      ? {
          ...card,
          name: name.trim(),
          issuer: issuer.trim(),
          creditLimit: numericLimit,
          cutoffDay: cutoffDay
            ? Number(cutoffDay)
            : null,
          dueDaysAfterCutoff: Number(
            dueDaysAfterCutoff || 20
          ),
          notes,
          updatedAt: new Date().toISOString(),
        }
      : card
  );

  await AsyncStorage.setItem(
    CREDIT_CARDS_KEY,
    JSON.stringify(updatedCards)
  );

  return updatedCards.find(
    (card) =>
      String(card.id) === String(cardId)
  );
}export async function deleteCreditCard(cardId) {
  const cards = await getCreditCards();

  const card = cards.find(
    (item) =>
      String(item.id) === String(cardId)
  );

  if (!card) {
    throw new Error('Credit card not found.');
  }

  const updatedCards = cards.filter(
    (item) =>
      String(item.id) !== String(cardId)
  );

  await AsyncStorage.setItem(
    CREDIT_CARDS_KEY,
    JSON.stringify(updatedCards)
  );

  return card;
}

export async function updateCreditCard(
  id,
  changes
) {
  const cards = await getCreditCards();

  const updatedCards = cards.map((card) =>
    String(card.id) === String(id)
      ? {
          ...card,
          ...changes,
        }
      : card
  );

  await AsyncStorage.setItem(
    CREDIT_CARDS_KEY,
    JSON.stringify(updatedCards)
  );

  return updatedCards;
}
// ==========================================
// CREDIT-CARD AWARE EXPENSE
// ==========================================

export async function addExpenseWithPaymentSource({
  amount,
  category,
  description,
  paymentSourceType,
  paymentSourceId,
  notes = '',
  installment = false,
  installmentMonths = null,
}) {
  const numericAmount = Number(amount || 0);

  if (numericAmount <= 0) {
    throw new Error('Enter a valid expense amount.');
  }

  if (!paymentSourceType || !paymentSourceId) {
    throw new Error('Choose how this expense was paid.');
  }

  // ==============================
  // CASH / BANK / E-WALLET
  // ==============================

  if (paymentSourceType === 'account') {
    const accounts = await getAccounts();

    const account = accounts.find(
      (item) =>
        String(item.id) === String(paymentSourceId)
    );

    if (!account) {
      throw new Error('Payment account not found.');
    }

    if (Number(account.balance || 0) < numericAmount) {
      throw new Error(
        `Not enough balance in ${account.name}.`
      );
    }

    const newBalance =
      Number(account.balance || 0) - numericAmount;

    const updatedAccounts = accounts.map((item) =>
      String(item.id) === String(paymentSourceId)
        ? {
            ...item,
            balance: newBalance,
          }
        : item
    );

    await AsyncStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(updatedAccounts)
    );

    const transaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: numericAmount,
      category: category || 'Expense',
      description:
        description || category || 'Expense',

      paymentSourceType: 'account',
      paymentSourceId,

      accountId: paymentSourceId,
      accountName: account.name,

      notes,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const transactions = await getTransactions();

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify([
        transaction,
        ...transactions,
      ])
    );

    return {
      transaction,
      paymentType: 'account',
      sourceName: account.name,
      newBalance,
    };
  }

  // ==============================
  // CREDIT CARD
  // ==============================

  if (paymentSourceType === 'credit_card') {
    const cards = await getCreditCards();

    const card = cards.find(
      (item) =>
        String(item.id) === String(paymentSourceId)
    );

    if (!card) {
      throw new Error('Credit card not found.');
    }

    const creditLimit =
      Number(card.creditLimit || 0);

    const currentBalance =
      Number(card.currentBalance || 0);

    const availableCredit =
      creditLimit - currentBalance;

    if (availableCredit < numericAmount) {
      throw new Error(
        `Not enough available credit on ${card.name}.`
      );
    }

    const newBalance =
      currentBalance + numericAmount;

    const updatedCards = cards.map((item) =>
      String(item.id) === String(paymentSourceId)
        ? {
            ...item,
            currentBalance: newBalance,
          }
        : item
    );

    await AsyncStorage.setItem(
      CREDIT_CARDS_KEY,
      JSON.stringify(updatedCards)
    );

    const transaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: numericAmount,
      category: category || 'Expense',
      description:
        description || category || 'Expense',

      paymentSourceType: 'credit_card',
      paymentSourceId,

      cardId: paymentSourceId,
      cardName: card.name,

      installment: Boolean(installment),

      installmentMonths:
        installment && installmentMonths
          ? Number(installmentMonths)
          : null,

      notes,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const transactions = await getTransactions();

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify([
        transaction,
        ...transactions,
      ])
    );

    return {
      transaction,
      paymentType: 'credit_card',
      sourceName: card.name,
      newBalance,
      availableCredit:
        creditLimit - newBalance,
    };
  }

  throw new Error('Invalid payment source.');
}// ==========================================
// BILLS
// ==========================================

const BILLS_KEY = '@myfinance_bills';

export async function getBills() {
  try {
    const data = await AsyncStorage.getItem(BILLS_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Unable to load bills:', error);
    return [];
  }
}

export async function addBill({
  name,
  category = 'Bills',
  amount,
  dueDate,
  recurring = false,
  frequency = 'monthly',
  autopay = false,
  notes = '',
}) {
  const numericAmount = Number(amount || 0);

  if (!name?.trim()) {
    throw new Error('Enter a bill name.');
  }

  if (numericAmount <= 0) {
    throw new Error('Enter a valid bill amount.');
  }

  if (!dueDate) {
    throw new Error('Choose a due date.');
  }

  const bills = await getBills();

  const newBill = {
    id: Date.now().toString(),

    name: name.trim(),
    category,
    amount: numericAmount,

    dueDate,

    recurring: Boolean(recurring),
    frequency: recurring
      ? frequency
      : null,

    autopay: Boolean(autopay),

    status: 'upcoming',

    notes,

    lastPaidAt: null,
    lastPaymentTransactionId: null,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    BILLS_KEY,
    JSON.stringify([
      newBill,
      ...bills,
    ])
  );

  return newBill;
}

export async function updateBill(
  id,
  changes
) {
  const bills = await getBills();

  const updatedBills = bills.map((bill) =>
    String(bill.id) === String(id)
      ? {
          ...bill,
          ...changes,
          updatedAt:
            new Date().toISOString(),
        }
      : bill
  );

  await AsyncStorage.setItem(
    BILLS_KEY,
    JSON.stringify(updatedBills)
  );

  return updatedBills;
}

export async function deleteBill(id) {
  const bills = await getBills();

  const updatedBills = bills.filter(
    (bill) =>
      String(bill.id) !== String(id)
  );

  await AsyncStorage.setItem(
    BILLS_KEY,
    JSON.stringify(updatedBills)
  );

  return updatedBills;
}// ==========================================
// PAY BILL
// ==========================================

export async function payBill({
  billId,
  paymentSourceType,
  paymentSourceId,
  notes = '',
}) {
  const bills = await getBills();

  const bill = bills.find(
    (item) => String(item.id) === String(billId)
  );

  if (!bill) {
    throw new Error('Bill not found.');
  }

  if (!paymentSourceType || !paymentSourceId) {
    throw new Error('Choose how this bill was paid.');
  }

  const amount = Number(bill.amount || 0);

  if (amount <= 0) {
    throw new Error('Bill amount is invalid.');
  }

  let sourceName = '';
  let newBalance = null;
  let availableCredit = null;

  // ==========================================
  // ACCOUNT PAYMENT
  // ==========================================

  if (paymentSourceType === 'account') {
    const accounts = await getAccounts();

    const account = accounts.find(
      (item) =>
        String(item.id) === String(paymentSourceId)
    );

    if (!account) {
      throw new Error('Payment account not found.');
    }

    if (Number(account.balance || 0) < amount) {
      throw new Error(
        `Not enough balance in ${account.name}.`
      );
    }

    newBalance =
      Number(account.balance || 0) - amount;

    const updatedAccounts = accounts.map((item) =>
      String(item.id) === String(paymentSourceId)
        ? {
            ...item,
            balance: newBalance,
          }
        : item
    );

    await AsyncStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(updatedAccounts)
    );

    sourceName = account.name;
  }

  // ==========================================
  // CREDIT CARD PAYMENT
  // ==========================================

  if (paymentSourceType === 'credit_card') {
    const cards = await getCreditCards();

    const card = cards.find(
      (item) =>
        String(item.id) === String(paymentSourceId)
    );

    if (!card) {
      throw new Error('Credit card not found.');
    }

    const creditLimit = Number(card.creditLimit || 0);
    const currentBalance = Number(card.currentBalance || 0);
    const available = creditLimit - currentBalance;

    if (available < amount) {
      throw new Error(
        `Not enough available credit on ${card.name}.`
      );
    }

    newBalance = currentBalance + amount;
    availableCredit = creditLimit - newBalance;

    const updatedCards = cards.map((item) =>
      String(item.id) === String(paymentSourceId)
        ? {
            ...item,
            currentBalance: newBalance,
          }
        : item
    );

    await AsyncStorage.setItem(
      CREDIT_CARDS_KEY,
      JSON.stringify(updatedCards)
    );

    sourceName = card.name;
  }

  // ==========================================
  // CREATE TRANSACTION
  // ==========================================

  const transactions = await getTransactions();

  const transaction = {
    id: Date.now().toString(),
    type: 'expense',
    subtype: 'bill_payment',

    billId: bill.id,
    billName: bill.name,

    amount,
    category: bill.category || 'Bills',
    description: bill.name,

    paymentSourceType,
    paymentSourceId,
    sourceName,

    accountId:
      paymentSourceType === 'account'
        ? paymentSourceId
        : null,

    accountName:
      paymentSourceType === 'account'
        ? sourceName
        : null,

    cardId:
      paymentSourceType === 'credit_card'
        ? paymentSourceId
        : null,

    cardName:
      paymentSourceType === 'credit_card'
        ? sourceName
        : null,

    notes,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([
      transaction,
      ...transactions,
    ])
  );

  // ==========================================
  // UPDATE BILL
  // ==========================================

  let nextDueDate = bill.dueDate;

  if (bill.recurring && bill.dueDate) {
    const current = new Date(
      `${bill.dueDate}T00:00:00`
    );

    if (bill.frequency === 'weekly') {
      current.setDate(current.getDate() + 7);
    }

    if (bill.frequency === 'monthly') {
      current.setMonth(current.getMonth() + 1);
    }

    if (bill.frequency === 'quarterly') {
      current.setMonth(current.getMonth() + 3);
    }

    if (bill.frequency === 'yearly') {
      current.setFullYear(current.getFullYear() + 1);
    }

    const year = current.getFullYear();

    const month = String(
      current.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      current.getDate()
    ).padStart(2, '0');

    nextDueDate = `${year}-${month}-${day}`;
  }

  const updatedBills = bills.map((item) => {
    if (String(item.id) !== String(bill.id)) {
      return item;
    }

    if (item.recurring) {
      return {
        ...item,
        dueDate: nextDueDate,
        status: 'upcoming',
        lastPaidAt: new Date().toISOString(),
        lastPaymentTransactionId: transaction.id,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      ...item,
      status: 'paid',
      lastPaidAt: new Date().toISOString(),
      lastPaymentTransactionId: transaction.id,
      updatedAt: new Date().toISOString(),
    };
  });

  await AsyncStorage.setItem(
    BILLS_KEY,
    JSON.stringify(updatedBills)
  );

  return {
    bill,
    transaction,
    sourceName,
    newBalance,
    availableCredit,
  };
}// ==========================================
// LOANS
// ==========================================

const LOANS_KEY = '@myfinance_loans';

export async function getLoans() {
  try {
    const data = await AsyncStorage.getItem(LOANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Unable to load loans:', error);
    return [];
  }
}

export async function addLoan({
  name,
  principal,
  remainingBalance,
  interestRate = 0,
  monthlyPayment = 0,
  nextDueDate = null,
  owner = 'mine',
  source = '',
  receivedIntoAccountId = null,
  notes = '',
}) {
  const numericPrincipal = Number(principal || 0);

  if (!name?.trim()) {
    throw new Error('Enter a loan name.');
  }

  if (numericPrincipal <= 0) {
    throw new Error('Enter a valid loan amount.');
  }

  const loans = await getLoans();

  const loan = {
    id: Date.now().toString(),
    name: name.trim(),
    source,
    principal: numericPrincipal,
    remainingBalance: Number(
      remainingBalance || numericPrincipal
    ),
    interestRate: Number(interestRate || 0),
    monthlyPayment: Number(monthlyPayment || 0),
    nextDueDate,
    owner,
    status: 'active',
    receivedIntoAccountId,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    LOANS_KEY,
    JSON.stringify([loan, ...loans])
  );

  // If this loan represents money you actually received,
  // increase the selected account balance too.
  if (receivedIntoAccountId) {
    const accounts = await getAccounts();

    const account = accounts.find(
      (item) =>
        String(item.id) === String(receivedIntoAccountId)
    );

    if (!account) {
      throw new Error('Receiving account not found.');
    }

    const newBalance =
      Number(account.balance || 0) + numericPrincipal;

    const updatedAccounts = accounts.map((item) =>
      String(item.id) === String(receivedIntoAccountId)
        ? { ...item, balance: newBalance }
        : item
    );

    await AsyncStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(updatedAccounts)
    );

    const transactions = await getTransactions();

    const transaction = {
      id: `${Date.now()}-loan`,
      type: 'loan_received',
      amount: numericPrincipal,
      description: `Loan received: ${loan.name}`,
      accountId: receivedIntoAccountId,
      accountName: account.name,
      loanId: loan.id,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify([transaction, ...transactions])
    );
  }

  return loan;
}

export async function updateLoan(id, changes) {
  const loans = await getLoans();

  const updatedLoans = loans.map((loan) =>
    String(loan.id) === String(id)
      ? {
          ...loan,
          ...changes,
          updatedAt: new Date().toISOString(),
        }
      : loan
  );

  await AsyncStorage.setItem(
    LOANS_KEY,
    JSON.stringify(updatedLoans)
  );

  return updatedLoans;
}

export async function deleteLoan(id) {
  const loans = await getLoans();

  const updatedLoans = loans.filter(
    (loan) => String(loan.id) !== String(id)
  );

  await AsyncStorage.setItem(
    LOANS_KEY,
    JSON.stringify(updatedLoans)
  );

  return updatedLoans;
}// ==========================================
// PAY LOAN
// ==========================================

export async function payLoan({
  loanId,
  paymentSourceType,
  paymentSourceId,
  amount,
  paymentType = 'regular',
  notes = '',
}) {
  const numericAmount = Number(amount || 0);

  if (numericAmount <= 0) {
    throw new Error('Enter a valid payment amount.');
  }

  if (!paymentSourceType || !paymentSourceId) {
    throw new Error('Choose a payment source.');
  }

  const loans = await getLoans();

  const loan = loans.find(
    (item) => String(item.id) === String(loanId)
  );

  if (!loan) {
    throw new Error('Loan not found.');
  }

  const currentLoanBalance =
    Number(loan.remainingBalance || 0);

  const actualPayment = Math.min(
    numericAmount,
    currentLoanBalance
  );

  const newLoanBalance = Math.max(
    currentLoanBalance - actualPayment,
    0
  );

  let sourceName = '';
  let newSourceBalance = null;
  let availableCredit = null;

  // ==========================================
  // CASH / BANK / E-WALLET
  // ==========================================

  if (paymentSourceType === 'account') {
    const accounts = await getAccounts();

    const account = accounts.find(
      (item) =>
        String(item.id) === String(paymentSourceId)
    );

    if (!account) {
      throw new Error('Payment account not found.');
    }

    if (
      Number(account.balance || 0) <
      actualPayment
    ) {
      throw new Error(
        `Not enough balance in ${account.name}.`
      );
    }

    newSourceBalance =
      Number(account.balance || 0) -
      actualPayment;

    const updatedAccounts = accounts.map(
      (item) =>
        String(item.id) ===
        String(paymentSourceId)
          ? {
              ...item,
              balance: newSourceBalance,
            }
          : item
    );

    await AsyncStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(updatedAccounts)
    );

    sourceName = account.name;
  }

  // ==========================================
  // CREDIT CARD
  // ==========================================

  if (paymentSourceType === 'credit_card') {
    const cards = await getCreditCards();

    const card = cards.find(
      (item) =>
        String(item.id) === String(paymentSourceId)
    );

    if (!card) {
      throw new Error('Credit card not found.');
    }

    const creditLimit =
      Number(card.creditLimit || 0);

    const currentCardBalance =
      Number(card.currentBalance || 0);

    const available =
      creditLimit - currentCardBalance;

    if (available < actualPayment) {
      throw new Error(
        `Not enough available credit on ${card.name}.`
      );
    }

    newSourceBalance =
      currentCardBalance + actualPayment;

    availableCredit =
      creditLimit - newSourceBalance;

    const updatedCards = cards.map(
      (item) =>
        String(item.id) ===
        String(paymentSourceId)
          ? {
              ...item,
              currentBalance:
                newSourceBalance,
            }
          : item
    );

    await AsyncStorage.setItem(
      CREDIT_CARDS_KEY,
      JSON.stringify(updatedCards)
    );

    sourceName = card.name;
  }

  // ==========================================
  // UPDATE LOAN
  // ==========================================

  const updatedLoans = loans.map(
    (item) =>
      String(item.id) === String(loanId)
        ? {
            ...item,
            remainingBalance:
              newLoanBalance,

            status:
              newLoanBalance <= 0
                ? 'paid'
                : 'active',

            lastPaymentAt:
              new Date().toISOString(),

            updatedAt:
              new Date().toISOString(),
          }
        : item
  );

  await AsyncStorage.setItem(
    LOANS_KEY,
    JSON.stringify(updatedLoans)
  );

  // ==========================================
  // CREATE TRANSACTION
  // ==========================================

  const transactions =
    await getTransactions();

  const transaction = {
    id: `${Date.now()}-loan-payment`,

    type: 'expense',
    subtype: 'loan_payment',

    loanId: loan.id,
    loanName: loan.name,

    amount: actualPayment,

    description:
      paymentType === 'extra'
        ? `Extra payment: ${loan.name}`
        : `Loan payment: ${loan.name}`,

    category: 'Loans',

    paymentType,

    paymentSourceType,
    paymentSourceId,

    accountId:
      paymentSourceType === 'account'
        ? paymentSourceId
        : null,

    accountName:
      paymentSourceType === 'account'
        ? sourceName
        : null,

    cardId:
      paymentSourceType === 'credit_card'
        ? paymentSourceId
        : null,

    cardName:
      paymentSourceType === 'credit_card'
        ? sourceName
        : null,

    notes,

    date: new Date().toISOString(),
    createdAt:
      new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([
      transaction,
      ...transactions,
    ])
  );

  return {
    loan: {
      ...loan,
      remainingBalance:
        newLoanBalance,
      status:
        newLoanBalance <= 0
          ? 'paid'
          : 'active',
    },

    transaction,

    paymentSourceType,
    sourceName,

    amountPaid: actualPayment,

    newLoanBalance,

    newSourceBalance,

    availableCredit,
  };
}// ==========================================
// LEND / BORROW
// ==========================================

const LEND_BORROW_KEY = '@myfinance_lend_borrow';

export async function getLendBorrowRecords() {
  try {
    const data = await AsyncStorage.getItem(
      LEND_BORROW_KEY
    );

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(
      'Unable to load lend/borrow records:',
      error
    );

    return [];
  }
}

export async function addLendBorrowRecord({
  direction,
  person,
  amount,
  dueDate = null,
  notes = '',
  sourceType,
  sourceId,
}) {
  const numericAmount = Number(amount || 0);

  if (!['lent', 'borrowed'].includes(direction)) {
    throw new Error('Choose lend or borrow.');
  }

  if (!person?.trim()) {
    throw new Error('Enter the person’s name.');
  }

  if (numericAmount <= 0) {
    throw new Error('Enter a valid amount.');
  }

  if (!sourceType || !sourceId) {
    throw new Error('Choose where the money moved.');
  }

  const records = await getLendBorrowRecords();

  let sourceName = '';

  // ==========================================
  // I LENT MONEY
  // money leaves my source
  // ==========================================

  if (direction === 'lent') {
    if (sourceType === 'account') {
      const accounts = await getAccounts();

      const account = accounts.find(
        (item) =>
          String(item.id) === String(sourceId)
      );

      if (!account) {
        throw new Error('Account not found.');
      }

      if (
        Number(account.balance || 0) <
        numericAmount
      ) {
        throw new Error(
          `Not enough balance in ${account.name}.`
        );
      }

      const updatedAccounts = accounts.map(
        (item) =>
          String(item.id) === String(sourceId)
            ? {
                ...item,
                balance:
                  Number(item.balance || 0) -
                  numericAmount,
              }
            : item
      );

      await AsyncStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify(updatedAccounts)
      );

      sourceName = account.name;
    }

    if (sourceType === 'credit_card') {
      const cards = await getCreditCards();

      const card = cards.find(
        (item) =>
          String(item.id) === String(sourceId)
      );

      if (!card) {
        throw new Error('Credit card not found.');
      }

      const available =
        Number(card.creditLimit || 0) -
        Number(card.currentBalance || 0);

      if (available < numericAmount) {
        throw new Error(
          `Not enough available credit on ${card.name}.`
        );
      }

      const updatedCards = cards.map(
        (item) =>
          String(item.id) === String(sourceId)
            ? {
                ...item,
                currentBalance:
                  Number(item.currentBalance || 0) +
                  numericAmount,
              }
            : item
      );

      await AsyncStorage.setItem(
        CREDIT_CARDS_KEY,
        JSON.stringify(updatedCards)
      );

      sourceName = card.name;
    }
  }

  // ==========================================
  // I BORROWED MONEY
  // money enters my account
  // ==========================================

  if (direction === 'borrowed') {
    if (sourceType !== 'account') {
      throw new Error(
        'Borrowed money must be received into a cash, bank, or e-wallet account.'
      );
    }

    const accounts = await getAccounts();

    const account = accounts.find(
      (item) =>
        String(item.id) === String(sourceId)
    );

    if (!account) {
      throw new Error('Receiving account not found.');
    }

    const updatedAccounts = accounts.map(
      (item) =>
        String(item.id) === String(sourceId)
          ? {
              ...item,
              balance:
                Number(item.balance || 0) +
                numericAmount,
            }
          : item
    );

    await AsyncStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(updatedAccounts)
    );

    sourceName = account.name;
  }

  const record = {
    id: Date.now().toString(),

    direction,
    person: person.trim(),

    originalAmount: numericAmount,
    remainingAmount: numericAmount,

    dueDate,

    sourceType,
    sourceId,
    sourceName,

    status: 'active',

    notes,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    LEND_BORROW_KEY,
    JSON.stringify([
      record,
      ...records,
    ])
  );

  const transactions = await getTransactions();

  const transaction = {
    id: `${Date.now()}-lendborrow`,

    type:
      direction === 'lent'
        ? 'money_lent'
        : 'money_borrowed',

    amount: numericAmount,

    description:
      direction === 'lent'
        ? `Lent to ${person}`
        : `Borrowed from ${person}`,

    lendBorrowId: record.id,

    paymentSourceType: sourceType,
    paymentSourceId: sourceId,

    accountId:
      sourceType === 'account'
        ? sourceId
        : null,

    accountName:
      sourceType === 'account'
        ? sourceName
        : null,

    cardId:
      sourceType === 'credit_card'
        ? sourceId
        : null,

    cardName:
      sourceType === 'credit_card'
        ? sourceName
        : null,

    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([
      transaction,
      ...transactions,
    ])
  );

  return record;
}

export async function updateLendBorrowRecord(
  id,
  changes
) {
  const records =
    await getLendBorrowRecords();

  const updated = records.map(
    (record) =>
      String(record.id) === String(id)
        ? {
            ...record,
            ...changes,
            updatedAt:
              new Date().toISOString(),
          }
        : record
  );

  await AsyncStorage.setItem(
    LEND_BORROW_KEY,
    JSON.stringify(updated)
  );

  return updated;
}
export async function deleteLendBorrowRecord(id) {
  const records =
    await getLendBorrowRecords();

  const record = records.find(
    (item) =>
      String(item.id) === String(id)
  );

  if (!record) {
    throw new Error(
      'Lend/Borrow record not found.'
    );
  }

  const updatedRecords =
    records.filter(
      (item) =>
        String(item.id) !==
        String(id)
    );

  await AsyncStorage.setItem(
    LEND_BORROW_KEY,
    JSON.stringify(
      updatedRecords
    )
  );

  return record;
}// ==========================================
// REPAY LEND / BORROW
// ==========================================

export async function repayLendBorrow({
  recordId,
  amount,
  paymentSourceType,
  paymentSourceId,
  notes = '',
}) {
  const numericAmount = Number(amount || 0);

  if (numericAmount <= 0) {
    throw new Error('Enter a valid repayment amount.');
  }

  const records = await getLendBorrowRecords();

  const record = records.find(
    (item) => String(item.id) === String(recordId)
  );

  if (!record) {
    throw new Error('Lend/Borrow record not found.');
  }

  const remaining =
    Number(record.remainingAmount || 0);

  const actualAmount = Math.min(
    numericAmount,
    remaining
  );

  let sourceName = '';
  let newSourceBalance = null;
  let availableCredit = null;

  // ==========================================
  // SOMEONE REPAYS ME
  // money enters my selected account
  // ==========================================

  if (record.direction === 'lent') {
    if (paymentSourceType !== 'account') {
      throw new Error(
        'Money repaid to you must be received into a cash, bank, or e-wallet account.'
      );
    }

    const accounts = await getAccounts();

    const account = accounts.find(
      (item) =>
        String(item.id) === String(paymentSourceId)
    );

    if (!account) {
      throw new Error('Receiving account not found.');
    }

    newSourceBalance =
      Number(account.balance || 0) + actualAmount;

    const updatedAccounts = accounts.map((item) =>
      String(item.id) === String(paymentSourceId)
        ? {
            ...item,
            balance: newSourceBalance,
          }
        : item
    );

    await AsyncStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(updatedAccounts)
    );

    sourceName = account.name;
  }

  // ==========================================
  // I REPAY SOMEONE
  // money leaves account OR goes on credit card
  // ==========================================

  if (record.direction === 'borrowed') {
    if (paymentSourceType === 'account') {
      const accounts = await getAccounts();

      const account = accounts.find(
        (item) =>
          String(item.id) === String(paymentSourceId)
      );

      if (!account) {
        throw new Error('Payment account not found.');
      }

      if (
        Number(account.balance || 0) <
        actualAmount
      ) {
        throw new Error(
          `Not enough balance in ${account.name}.`
        );
      }

      newSourceBalance =
        Number(account.balance || 0) - actualAmount;

      const updatedAccounts = accounts.map((item) =>
        String(item.id) === String(paymentSourceId)
          ? {
              ...item,
              balance: newSourceBalance,
            }
          : item
      );

      await AsyncStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify(updatedAccounts)
      );

      sourceName = account.name;
    }

    if (paymentSourceType === 'credit_card') {
      const cards = await getCreditCards();

      const card = cards.find(
        (item) =>
          String(item.id) === String(paymentSourceId)
      );

      if (!card) {
        throw new Error('Credit card not found.');
      }

      const creditLimit =
        Number(card.creditLimit || 0);

      const currentBalance =
        Number(card.currentBalance || 0);

      const available =
        creditLimit - currentBalance;

      if (available < actualAmount) {
        throw new Error(
          `Not enough available credit on ${card.name}.`
        );
      }

      newSourceBalance =
        currentBalance + actualAmount;

      availableCredit =
        creditLimit - newSourceBalance;

      const updatedCards = cards.map((item) =>
        String(item.id) === String(paymentSourceId)
          ? {
              ...item,
              currentBalance: newSourceBalance,
            }
          : item
      );

      await AsyncStorage.setItem(
        CREDIT_CARDS_KEY,
        JSON.stringify(updatedCards)
      );

      sourceName = card.name;
    }
  }

  const newRemaining =
    Math.max(remaining - actualAmount, 0);

  const updatedRecords = records.map((item) =>
    String(item.id) === String(recordId)
      ? {
          ...item,
          remainingAmount: newRemaining,
          status:
            newRemaining <= 0
              ? 'paid'
              : 'active',
          lastPaymentAt:
            new Date().toISOString(),
          updatedAt:
            new Date().toISOString(),
        }
      : item
  );

  await AsyncStorage.setItem(
    LEND_BORROW_KEY,
    JSON.stringify(updatedRecords)
  );

  const transactions =
    await getTransactions();

  const transaction = {
    id: `${Date.now()}-lendborrow-payment`,

    type:
      record.direction === 'lent'
        ? 'lend_repayment_received'
        : 'borrow_repayment',

    subtype: 'lend_borrow_repayment',

    lendBorrowId: record.id,

    amount: actualAmount,

    description:
      record.direction === 'lent'
        ? `Repayment from ${record.person}`
        : `Repayment to ${record.person}`,

    paymentSourceType,
    paymentSourceId,

    accountId:
      paymentSourceType === 'account'
        ? paymentSourceId
        : null,

    accountName:
      paymentSourceType === 'account'
        ? sourceName
        : null,

    cardId:
      paymentSourceType === 'credit_card'
        ? paymentSourceId
        : null,

    cardName:
      paymentSourceType === 'credit_card'
        ? sourceName
        : null,

    notes,

    date: new Date().toISOString(),
    createdAt:
      new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([
      transaction,
      ...transactions,
    ])
  );

  return {
    record: {
      ...record,
      remainingAmount: newRemaining,
      status:
        newRemaining <= 0
          ? 'paid'
          : 'active',
    },

    transaction,
    sourceName,
    amountPaid: actualAmount,
    newRemaining,
    newSourceBalance,
    availableCredit,
  };
}// ==========================================
// SAVINGS GOALS
// ==========================================

const SAVINGS_KEY = '@myfinance_savings_goals';

export async function getSavingsGoals() {
  try {
    const data = await AsyncStorage.getItem(SAVINGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Unable to load savings goals:', error);
    return [];
  }
}

export async function addSavingsGoal({
  name,
  targetAmount,
  currentAmount = 0,
  targetDate = null,
  excludeFromSafeToEnjoy = true,
  notes = '',
}) {
  const numericTarget = Number(targetAmount || 0);
  const numericCurrent = Number(currentAmount || 0);

  if (!name?.trim()) {
    throw new Error('Enter a savings goal name.');
  }

  if (numericTarget <= 0) {
    throw new Error('Enter a valid target amount.');
  }

  if (numericCurrent < 0) {
    throw new Error('Current savings cannot be negative.');
  }

  const goals = await getSavingsGoals();

  const goal = {
    id: Date.now().toString(),

    name: name.trim(),

    targetAmount: numericTarget,
    currentAmount: numericCurrent,

    targetDate,

    excludeFromSafeToEnjoy:
      Boolean(excludeFromSafeToEnjoy),

    status:
      numericCurrent >= numericTarget
        ? 'completed'
        : 'active',

    notes,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    SAVINGS_KEY,
    JSON.stringify([goal, ...goals])
  );

  return goal;
}

export async function updateSavingsGoal(id, changes) {
  const goals = await getSavingsGoals();

  const updated = goals.map((goal) =>
    String(goal.id) === String(id)
      ? {
          ...goal,
          ...changes,
          updatedAt: new Date().toISOString(),
        }
      : goal
  );

  await AsyncStorage.setItem(
    SAVINGS_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

export async function depositToSavings({
  goalId,
  accountId,
  amount,
  notes = '',
}) {
  const numericAmount = Number(amount || 0);

  if (numericAmount <= 0) {
    throw new Error('Enter a valid deposit amount.');
  }

  const goals = await getSavingsGoals();

  const goal = goals.find(
    (item) => String(item.id) === String(goalId)
  );

  if (!goal) {
    throw new Error('Savings goal not found.');
  }

  const accounts = await getAccounts();

  const account = accounts.find(
    (item) =>
      String(item.id) === String(accountId)
  );

  if (!account) {
    throw new Error('Source account not found.');
  }

  if (Number(account.balance || 0) < numericAmount) {
    throw new Error(
      `Not enough balance in ${account.name}.`
    );
  }

  const newAccountBalance =
    Number(account.balance || 0) - numericAmount;

  const newSavingsBalance =
    Number(goal.currentAmount || 0) + numericAmount;

  const updatedAccounts = accounts.map((item) =>
    String(item.id) === String(accountId)
      ? {
          ...item,
          balance: newAccountBalance,
        }
      : item
  );

  await AsyncStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts)
  );

  const updatedGoals = goals.map((item) =>
    String(item.id) === String(goalId)
      ? {
          ...item,
          currentAmount: newSavingsBalance,
          status:
            newSavingsBalance >=
            Number(item.targetAmount || 0)
              ? 'completed'
              : 'active',
          updatedAt: new Date().toISOString(),
        }
      : item
  );

  await AsyncStorage.setItem(
    SAVINGS_KEY,
    JSON.stringify(updatedGoals)
  );

  const transactions = await getTransactions();

  const transaction = {
    id: `${Date.now()}-savings-deposit`,

    type: 'savings_transfer',
    subtype: 'savings_deposit',

    savingsGoalId: goal.id,
    savingsGoalName: goal.name,

    amount: numericAmount,

    description: `Saved toward ${goal.name}`,

    accountId: account.id,
    accountName: account.name,

    notes,

    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([
      transaction,
      ...transactions,
    ])
  );

  return {
    goal: {
      ...goal,
      currentAmount: newSavingsBalance,
    },

    transaction,

    accountName: account.name,

    newAccountBalance,
    newSavingsBalance,
  };
}

export async function withdrawFromSavings({
  goalId,
  accountId,
  amount,
  notes = '',
}) {
  const numericAmount = Number(amount || 0);

  if (numericAmount <= 0) {
    throw new Error('Enter a valid withdrawal amount.');
  }

  const goals = await getSavingsGoals();

  const goal = goals.find(
    (item) => String(item.id) === String(goalId)
  );

  if (!goal) {
    throw new Error('Savings goal not found.');
  }

  if (
    Number(goal.currentAmount || 0) <
    numericAmount
  ) {
    throw new Error(
      `Not enough money in ${goal.name}.`
    );
  }

  const accounts = await getAccounts();

  const account = accounts.find(
    (item) =>
      String(item.id) === String(accountId)
  );

  if (!account) {
    throw new Error('Destination account not found.');
  }

  const newAccountBalance =
    Number(account.balance || 0) + numericAmount;

  const newSavingsBalance =
    Number(goal.currentAmount || 0) - numericAmount;

  const updatedAccounts = accounts.map((item) =>
    String(item.id) === String(accountId)
      ? {
          ...item,
          balance: newAccountBalance,
        }
      : item
  );

  await AsyncStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts)
  );

  const updatedGoals = goals.map((item) =>
    String(item.id) === String(goalId)
      ? {
          ...item,
          currentAmount: newSavingsBalance,
          status:
            newSavingsBalance >=
            Number(item.targetAmount || 0)
              ? 'completed'
              : 'active',
          updatedAt: new Date().toISOString(),
        }
      : item
  );

  await AsyncStorage.setItem(
    SAVINGS_KEY,
    JSON.stringify(updatedGoals)
  );

  const transactions = await getTransactions();

  const transaction = {
    id: `${Date.now()}-savings-withdrawal`,

    type: 'savings_transfer',
    subtype: 'savings_withdrawal',

    savingsGoalId: goal.id,
    savingsGoalName: goal.name,

    amount: numericAmount,

    description: `Withdrawn from ${goal.name}`,

    accountId: account.id,
    accountName: account.name,

    notes,

    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([
      transaction,
      ...transactions,
    ])
  );

  return {
    goal: {
      ...goal,
      currentAmount: newSavingsBalance,
    },

    transaction,

    accountName: account.name,

    newAccountBalance,
    newSavingsBalance,
  };
}