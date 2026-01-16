import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateSessionDto, GenerateFeedbackDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('sessions')
  findAllSessions(@CurrentUser() user: User) {
    return this.feedbackService.findSessionsByUserId(user.id);
  }

  @Get('sessions/:id')
  findSession(@Param('id') id: string) {
    return this.feedbackService.findSessionByIdOrFail(id);
  }

  @Post('sessions')
  createSession(@CurrentUser() user: User, @Body() dto: CreateSessionDto) {
    return this.feedbackService.createSession(user.id, dto);
  }

  @Post('sessions/:id/generate')
  generateFeedback(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: GenerateFeedbackDto,
  ) {
    return this.feedbackService.generateFeedback(id, user.id, dto.personaIds);
  }

  @Get('sessions/:id/summary')
  async getSummary(@CurrentUser() user: User, @Param('id') id: string) {
    const summary = await this.feedbackService.generateSummary(id, user.id);
    return { summary };
  }
}
