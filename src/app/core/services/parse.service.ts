import { Injectable } from '@angular/core';
import * as Parse from 'parse';
import {Observable} from 'rxjs';
import { v4 as uuid } from 'uuid';
import * as faker from 'faker';

@Injectable({
  providedIn: 'root'
})
export class ParseService {

  constructor() { }

  collection<T>(path: string, query?: any): ParseCollection<T> {
    return new ParseCollection<T>(path, query);
  }

  doc<T>(path: string, id: string): ParseDocument<T> {
    return new ParseDocument<T>(path, id);
  }
}

export class ParseCollection<T> {

  constructor(path: string, query?: string) {
    this.parserObject = Parse.Object.extend(path);
    this.parseQueryObject = new Parse.Query(this.parserObject);
    this.queryString = query;
    this.path = path;
  }

  private readonly parserObject;
  private parseQueryObject;
  private readonly queryString: string;
  private readonly path: string;

  private static transformData<T>(data: Parse.Object<T>[]): T[] {
    return data.map(d =>  ParseDocument.transformData(d));
  }

  public static isOdd(num): boolean {
    return !!(num % 2);
  }

  get(): Promise<Parse.Object<T>[]> {
    return this.parseQueryObject.find();
  }

  create(data: T, id?: string): Promise<Parse.Object<T>> {
    return new ParseDocument<T>(this.path, id, this.getParentDocument()).create(data);
  }

  valueChanges(): Observable<T[]> {
    return new Observable((observer) => {
      const refreshData = async () => {
        const data = await this.get();
        observer.next(ParseCollection.transformData(data));
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

  private getParentDocument(): any {
    const paths = this.path.split('/');
    if (ParseCollection.isOdd(paths.length) && paths.length > 1) {

      const parentClassString = paths[paths.length - 3];
      const parentObjectId = paths[paths.length - 2];

      const parent = Parse.Object.extend(parentClassString);
      const parentObject = new parent();

      parentObject.id = parentObjectId;

      return parentObject;
    }

    return;
  }
}

export class ParseDocument<T> {

  public parserObject;
  private readonly path: string;
  private id: string;
  private readonly isNewDocument: boolean;

  constructor(path: string, id?: string, parentDocument?) {
    this.path = path;
    this.isNewDocument = !id;
    this.id = this.isNewDocument ? uuid() : id;
    const parserObject = Parse.Object.extend(ParseDocument.getDocumentClass(this.path));
    this.parserObject = new parserObject();

    if (parentDocument) {
      parentDocument.set('name', faker.company.companyName());
      this.parserObject.set('parent', parentDocument);
    }

    if (this.isNewDocument) {
      this.parserObject.objectId = this.id;
    } else {
      this.parserObject.id = this.id;
    }
  }

  public static transformData<T>(data: Parse.Object<T>): T {
    const {attributes, id} = data;
    return {...attributes, id};
  }

  private static getDocumentClass(path: string): string {
    const paths = path.split('/');
    if (ParseCollection.isOdd(paths.length) && paths.length > 1) {
      return paths[paths.length - 1];
    }
    return path;
  }

  valueChanges(): Observable<T> {
    return new Observable((observer) => {
      const refreshData = async () => {
        const data = await this.get();
        observer.next(ParseDocument.transformData<T>(data));
      };
      const query = new Parse.Query(this.parserObject).equalTo('objectId', this.id);
      refreshData();

      query.subscribe().then((subscription) => {
        subscription.on('update', refreshData);
      });
    });
  }

  get(): Promise<Parse.Object<T>> {
    if (!this.isNewDocument) {
      const query = new Parse.Query(this.parserObject);
      return query.get(this.id) as Promise<Parse.Object<T>>;
    }
  }

  set(data): Promise<Parse.Object<T>> {
    return this.parserObject.save(data);
  }

  create(data: T): Promise<Parse.Object<T>> {
    return this.parserObject.save(data);
  }

  delete(): Promise<Parse.Object<T>> {
    return this.parserObject.destroy();
  }
}
