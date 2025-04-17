import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { GraphQLModule } from './graphql/graphql.module';
import { SupabaseModule } from './database/supabase.module';
import { Neo4jModule } from './database/neo4j.module';
import { LoggingModule } from './logging/logging.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule,
    GraphQLModule,
    SupabaseModule,
    Neo4jModule,
    LoggingModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}