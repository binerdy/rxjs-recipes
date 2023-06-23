import { of } from 'rxjs';
import { RequestBuffer } from './recipe/request-buffer';

const requestBuffer = new RequestBuffer(
  {
    test1: of<string>('data'),
  },
  { buffer: 1, retry: 0 }
);
