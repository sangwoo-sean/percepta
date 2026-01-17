import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto, BatchCreatePersonaDto, GeneratePersonasDto, UpdatePersonaDto } from './dto/create-persona.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('personas')
@UseGuards(JwtAuthGuard)
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.personasService.findByUserId(user.id);
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.personasService.getStats(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personasService.findByIdOrFail(id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreatePersonaDto) {
    return this.personasService.create(user.id, dto);
  }

  @Post('batch')
  batchCreate(@CurrentUser() user: User, @Body() dto: BatchCreatePersonaDto) {
    return this.personasService.batchCreate(user.id, dto.personas);
  }

  @Post('generate')
  generate(@CurrentUser() user: User, @Body() dto: GeneratePersonasDto) {
    return this.personasService.generateAndCreate(user.id, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePersonaDto,
  ) {
    return this.personasService.update(id, user.id, dto);
  }

  @Delete(':id')
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.personasService.delete(id, user.id);
  }
}
