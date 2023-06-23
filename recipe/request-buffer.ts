import { firstValueFrom, forkJoin, from, Observable } from 'rxjs';
import { bufferCount, concatMap, reduce, retry } from 'rxjs/operators';

type ObservableData<T> = {
  [key in keyof T]: Observable<T[key]>;
};

interface BufferOptions {
  buffer: number;
  retry: number;
}

export class RequestBuffer<TData, TRequest extends Record<string, TData[]>> {
  constructor(
    private readonly requests: ObservableData<TRequest>,
    private readonly options: BufferOptions
  ) {}

  public toPromise(): Promise<TRequest> {
    return firstValueFrom(
      from(Object.entries(this.requests)).pipe(
        bufferCount(this.options.buffer),
        reduce(
          (partialRequest, bufferedRequests) =>
            this.createPartialRequest(partialRequest, bufferedRequests),
          {} as Partial<ObservableData<TRequest>>
        ),
        concatMap((partialRequest) =>
          forkJoin(partialRequest).pipe(retry(this.options.retry))
        ),
        reduce(
          (data, bufferedResults) => ({
            ...data,
            ...bufferedResults,
          }),
          {} as TRequest
        )
      )
    );
  }

  private createPartialRequest(
    initialValue: Partial<ObservableData<TRequest>>,
    bufferedRequests: [string, Observable<TData[]>][]
  ): Partial<ObservableData<TRequest>> {
    return bufferedRequests.reduce((partialRequest, bufferedRequest) => {
      (partialRequest as any)[bufferedRequest[0]] = bufferedRequest[1];
      return partialRequest;
    }, initialValue);
  }
}
