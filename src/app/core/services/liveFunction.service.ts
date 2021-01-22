import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LiveFunctionService {
  private socket;

  constructor() {
    // @ts-ignore
    this.socket = io(environment.functionsHost, {transports: ['websocket', 'polling'], withCredentials: true});
  }

  subscribe(funcName: string, data: any): Observable<any> {
    return new Observable((observer) => {
      this.socket.emit(funcName, data);
      this.socket.on(funcName, (receivedData) => {
        observer.next(receivedData);
      });
    });
  }

}
