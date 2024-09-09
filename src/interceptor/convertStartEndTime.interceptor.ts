import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of, switchMap } from 'rxjs';
import { omit } from 'lodash';

@Injectable()
export class convertStartEndTime implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      switchMap((response) => {
        if (!response) return of(response);

        return of(this.formatResponse(response));
      }),
    );
  }

  formatResponse(response: any) {
    if (response instanceof Array) {
      const result = response.map((data) => {
        const start = data.start_time;
        const end = data.end_time;
        return { ...omit(data, 'start_time', 'end_time'), start, end };
      });
      return result;
    }

    return response;
  }
}
