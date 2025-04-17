import { Module, Global } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '../config/config.service';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (config: ConfigService): SupabaseClient => {
        const url = config.get('SUPABASE_URL');
        const key = config.get('SUPABASE_SERVICE_KEY');
        if (!url || !key) {
          throw new Error('Supabase configuration missing');
        }
        return createClient(url, key);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}