import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {LiveFunctionService} from './liveFunction.service';

@Injectable({
  providedIn: 'root'
})
export class CloudTestService {
  constructor(private liveFunction: LiveFunctionService) {
  }

  getCalculateSomething(): Observable<any> {
    return this.liveFunction.subscribe('chat message', 'ola batata');
  }
}
