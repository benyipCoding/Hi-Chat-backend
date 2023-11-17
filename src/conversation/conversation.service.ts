import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationService {
  constructor() {}

  getConversationById(id: number) {
    return `this is conversation service: ${id}`;
  }
}
