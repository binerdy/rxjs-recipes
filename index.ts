import { of } from 'rxjs';
import { RequestBuffer } from './recipe/request-buffer';

new RequestBuffer(
  {
    test1: of('data1'),
    test2: of('data2'),
    test3: of('data3'),
    test4: of('data4'),
    test5: of('data5'),
  },
  { buffer: 1, retry: 0 }
)
  .asObservable()
  .subscribe(console.log);
