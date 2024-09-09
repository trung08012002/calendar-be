import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of, switchMap } from 'rxjs';
import { omit } from 'lodash';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      switchMap((response) => {
        if (!response) return of(response);

        return of(this.formatResponse(response));
      }),
    );
  }

  formatResponse(response: any) {
    if (response instanceof Object) {
      delete response.password_hash;

      return {
        status: 200,
        message: 'Success',
        data: omit(response, 'password_hash'),
      };
    }

    return response;
  }
}
