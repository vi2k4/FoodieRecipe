import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformBigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.transform(data))
    );
  }

  private transform(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'bigint') {
      const num = Number(obj);
      return Number.isSafeInteger(num) ? num : obj.toString();
    }

    // Check if the object is a Prisma Decimal using decimal.js
    if (obj && typeof obj === 'object' && (obj.constructor?.name === 'Decimal' || typeof obj.toFixed === 'function')) {
      return Number(obj.toString());
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transform(item));
    }

    if (typeof obj === 'object') {
      // Don't transform Date objects
      if (obj instanceof Date) {
        return obj;
      }
      
      const transformed: any = {};
      for (const key of Object.keys(obj)) {
        transformed[key] = this.transform(obj[key]);
      }
      return transformed;
    }

    return obj;
  }
}
