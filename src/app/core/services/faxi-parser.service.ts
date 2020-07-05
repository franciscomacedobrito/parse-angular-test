import { Injectable } from '@angular/core';
import Parse from 'parse';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaxiParserService {

  constructor() { }

  collection<T>(path: string, query?: any): ParseCollection<T> {
    return new ParseCollection<T>(path, query);
  }
}

export class ParseCollection<T> {

  private parserObject;
  private parseQueryObject;
  private readonly queryString: string;
  private path: string;

  constructor(path: string, query?: string) {
    this.parserObject = Parse.Object.extend(path);
    this.parseQueryObject = new Parse.Query(this.parserObject);
    this.queryString = query;
    this.path = path;
  }

  get(): Promise<any[]> {
    return this.parseQueryObject.find();
  }

  create(data): Promise<any> {
    return new ParseDocument(this.path, data).create();
  }

  valueChanges(): Observable<T[]> {
    return new Observable((observer) => {
      const query = new Parse.Query(this.path);
      query.subscribe().then((subscription) => {
        subscription.on('create', (data) => {
          alert('created');
          observer.next(data);
        });
        subscription.on('delete', (data) => {
          observer.next(data);
        });
        subscription.on('update', (data) => {
          observer.next(data);
        });
      });
    });
  }
}

export class ParseDocument<T> {

  private parserObject;

  constructor(path: string, data: any) {
    const parserObject = Parse.Object.extend(path);
    this.parserObject = new parserObject();

    Object.keys(data).forEach((key) => {
      this.parserObject.set(key, data[key]);
    });
  }

  create(): Promise<any> {
    return this.parserObject.save();
  }
}
