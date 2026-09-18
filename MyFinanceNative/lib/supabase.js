import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  'https://tyqojimdpgcihopdrhob.supabase.co';

const supabasePublishableKey =
  'sb_publishable_qbNbUEKWq49JIRwf08MkPQ_v3-KtVRm';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage:
        Platform.OS === 'web'
          ? undefined
          : AsyncStorage,

      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);