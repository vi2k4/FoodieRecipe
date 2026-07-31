import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Prisma Decimal objects have these fields
function isPrismaDecimal(obj: any): boolean {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.toNumber === 'function' &&
    's' in obj &&
    'e' in obj &&
    'd' in obj &&
    Array.isArray(obj.d)
  );
}

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.serialize(data)));
  }

  private serialize(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    if (obj instanceof Date) {
      return obj;
    }
    // Handle Prisma Decimal type
    if (isPrismaDecimal(obj)) {
      return obj.toNumber();
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.serialize(item));
    }
    if (typeof obj === 'object') {
      const serializedObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          serializedObj[key] = this.serialize(obj[key]);
        }
      }
      return serializedObj;
    }
    return obj;
  }
}
