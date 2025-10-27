import { Query, ParseArrayPipe } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export const IncludeQuery = () =>
  Query(
    'include',
    new ParseArrayPipe({
      items: String,
      separator: ',',
      optional: true,
    }),
  );

export const IncludeApiQuery = (targetEnum: Record<string, string>) =>
  ApiQuery({
    name: 'include',
    required: false,
    type: String,
    isArray: true,
    enum: targetEnum,
  });
