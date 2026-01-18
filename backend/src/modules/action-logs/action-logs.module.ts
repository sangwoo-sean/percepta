import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActionLog } from './entities/user-action-log.entity';
import { ActionLogsService } from './action-logs.service';
import { ActionLogsController } from './action-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserActionLog])],
  controllers: [ActionLogsController],
  providers: [ActionLogsService],
  exports: [ActionLogsService],
})
export class ActionLogsModule {}
