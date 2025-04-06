import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

export const createSupabaseClient = (configService: ConfigService) => {
  const url = configService.get<string>('supabase.url');
  const anonKey = configService.get<string>('supabase.anonKey');

  if (!url || !anonKey) {
    throw new Error(
      'Supabase URL or Anon Key is not defined in the environment variables',
    );
  }

  return createClient(url, anonKey);
};
