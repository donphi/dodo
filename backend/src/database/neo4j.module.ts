import { Module, Global } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { ConfigService } from '../config/config.service';

@Global()
@Module({
  providers: [
    {
      provide: 'NEO4J_DRIVER',
      useFactory: (config: ConfigService): Driver => {
        const url = config.get('NEO4J_URL');
        const user = config.get('NEO4J_USER');
        const password = config.get('NEO4J_PASSWORD');
        if (!url || !user || !password) {
          throw new Error('Neo4j configuration missing');
        }
        return neo4j.driver(url, neo4j.auth.basic(user, password));
      },
      inject: [ConfigService],
    },
  ],
  exports: ['NEO4J_DRIVER'],
})
export class Neo4jModule {}