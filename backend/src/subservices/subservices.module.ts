import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RuStoreValidationService } from './rustore-validation.service';

@Module({
  imports: [HttpModule],
  providers: [RuStoreValidationService],
  exports: [RuStoreValidationService],
})
export class RuStoreModule {}
