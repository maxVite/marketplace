import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, Client, Transport } from '@nestjs/microservices';

@Injectable()
export class OrderService {}
