import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ConfigService } from '../config/config.service';
import { Request } from 'express';

@Module({
  imports: [
    NestGraphQLModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'backend', 'src', 'schema.gql'),
        sortSchema: true,
        playground: config.get('NODE_ENV') !== 'production',
        debug: config.get('NODE_ENV') !== 'production',
        context: ({ req }: { req: Request }) => ({ req }),
      }),
    }),
  ],
})
export class GraphQLModule {}