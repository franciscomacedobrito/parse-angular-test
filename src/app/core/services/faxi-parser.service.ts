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
      const refreshData = async () => {
        const data = await this.get();
        observer.next(this.transformData(data));
      };

      const query = new Parse.Query(this.path);
      refreshData();

      query.subscribe().then((subscription) => {
        subscription.on('create', refreshData);
        subscription.on('delete', refreshData);
        subscription.on('update', refreshData);
      });
    });
  }

  private transformData(data: any[]): any[] {
    return data.map(d =>  {
      const {attributes, id} = d;
      return {...attributes, id};
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
