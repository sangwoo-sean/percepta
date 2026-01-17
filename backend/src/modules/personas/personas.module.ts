import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from './entities/persona.entity';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Persona]), AiModule, UsersModule],
  providers: [PersonasService],
  controllers: [PersonasController],
  exports: [PersonasService],
})
export class PersonasModule {}
