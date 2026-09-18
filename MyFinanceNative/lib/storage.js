import { supabase } from './supabase';

/*
  IMPORTANT

  During the Supabase migration we keep all functions that
  have NOT been migrated yet inside legacy-storage.js.

  Screens can continue importing from:

    ../lib/storage

  without us having to rewrite the whole app at once.
*/

export * from './legacy-storage';

// ======================================================
// AUTH HELPER
// ======================================================

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      'You are not signed in. Please sign in to MyFinance again.'
    );
  }

  return user;
}

// ======================================================
// DATABASE → APP FORMAT
// ======================================================

function mapAccount(row) {
  if (!row) return null;

  return {
    id: row.id,

    name: row.name,

    type: row.account_type || 'other',

    balance: Number(row.balance || 0),

    currency: row.currency || 'PHP',

    includedInAvailable:
      row.included_in_available !== false,

    institution: row.institution || '',

    notes: row.notes || '',

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}

// ======================================================
// ACCOUNTS — SUPABASE
// ======================================================

export async function getAccounts() {
  try {
    const user = await requireUser();

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return (data || []).map(mapAccount);
  } catch (error) {
    console.error(
      'Unable to load accounts from Supabase:',
      error
    );

    throw error;
  }
}

export async function addAccount(account) {
  try {
    const user = await requireUser();

    const newAccount = {
      user_id: user.id,

      name: String(account.name || '').trim(),

      account_type:
        account.type || 'other',

      balance: Number(
        account.balance || 0
      ),

      currency:
        account.currency || 'PHP',

      included_in_available:
        account.includedInAvailable !== false,

      institution:
        account.institution || null,

      notes:
        account.notes || null,
    };

    if (!newAccount.name) {
      throw new Error(
        'Please enter an account name.'
      );
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert(newAccount)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapAccount(data);
  } catch (error) {
    console.error(
      'Unable to save account to Supabase:',
      error
    );

    throw error;
  }
}

export async function updateAccount(
  id,
  changes
) {
  try {
    const user = await requireUser();

    const payload = {};

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'name'
      )
    ) {
      payload.name =
        String(changes.name || '').trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'type'
      )
    ) {
      payload.account_type =
        changes.type || 'other';
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'balance'
      )
    ) {
      payload.balance =
        Number(changes.balance || 0);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'currency'
      )
    ) {
      payload.currency =
        changes.currency || 'PHP';
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'includedInAvailable'
      )
    ) {
      payload.included_in_available =
        changes.includedInAvailable !== false;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'institution'
      )
    ) {
      payload.institution =
        changes.institution || null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'notes'
      )
    ) {
      payload.notes =
        changes.notes || null;
    }

    const { data, error } = await supabase
      .from('accounts')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      throw error;
    }

    return (data || []).map(mapAccount);
  } catch (error) {
    console.error(
      'Unable to update account:',
      error
    );

    throw error;
  }
}

export async function deleteAccount(id) {
  try {
    const user = await requireUser();

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return await getAccounts();
  } catch (error) {
    console.error(
      'Unable to delete account:',
      error
    );

    throw error;
  }
}

export async function adjustAccountBalance(
  id,
  amount
) {
  const accounts = await getAccounts();

  const account = accounts.find(
    (item) =>
      String(item.id) === String(id)
  );

  if (!account) {
    throw new Error(
      'Account not found.'
    );
  }

  const newBalance =
    Number(account.balance || 0) +
    Number(amount || 0);

  await updateAccount(id, {
    balance: newBalance,
  });

  return {
    ...account,
    balance: newBalance,
  };
}