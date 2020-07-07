import { Injectable } from '@angular/core';
import {ParseCollection} from './ParseCollection';
import {ParseDocument} from './ParseDocument';

@Injectable({
  providedIn: 'root'
})
export class ParseService {

  collection<T>(path: string, query?: any): ParseCollection<T> {
    return new ParseCollection<T>(path, query);
  }

  doc<T>(path: string, id: string): ParseDocument<T> {
    return new ParseDocument<T>(path, id);
  }
}
