import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import type { AuthUser } from './auth.types';

@Controller('staff')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class StaffController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  list() {
    return this.auth.listStaff();
  }

  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.auth.createStaff(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.auth.updateStaff(id, dto, actor);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() actor: AuthUser) {
    return this.auth.removeStaff(id, actor);
  }
}
