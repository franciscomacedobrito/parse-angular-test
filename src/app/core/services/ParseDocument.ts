import * as Parse from 'parse';
import * as faker from 'faker';
import {ParseCollection} from './ParseCollection';
import {Observable} from 'rxjs';
import { v4 as uuid } from 'uuid';

export class ParseDocument<T> {

  public parserObject;
  private readonly path: string;
  private readonly id: string;
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
      const refreshData = async (data?) => {
        observer.next(ParseDocument.transformData<T>(data ? data : await this.parserObject.fetch()));
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
