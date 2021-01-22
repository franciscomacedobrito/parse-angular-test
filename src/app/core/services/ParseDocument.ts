import * as Parse from 'parse';
import {ParseCollection} from './ParseCollection';
import {Observable} from 'rxjs';
import { v4 as uuid } from 'uuid';

export class ParseDocument<T> {

  public parserObject;
  public parents: any[];
  public readonly id: string;
  private readonly path: string;
  readonly isNewDocument: boolean;

  constructor(path: string, id?: string) {
    this.path = path;
    this.isNewDocument = !id;
    this.id = this.isNewDocument ? uuid() : id;
    this.parents = [];

    const parserObject = Parse.Object.extend(ParseDocument.getDocumentClass(this.path));
    this.parserObject = new parserObject();

    this.setParentDocuments();

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
        subscription.on('create', refreshData);
        subscription.on('delete', refreshData);
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
    const paths = this.path.split('/');
    if (ParseCollection.isOdd(paths.length)) {
      return this.parserObject.destroy();
    } else {
      throw new Error('the path is not odd please validate if it is a document or validate the slashes');
    }

  }

  private setParentDocuments(): void {
    const paths = this.path.split('/');
    if (paths.length === 1) {
      this.parserObject.set('path', this.path);
    } else {
      this.parserObject.set('path', paths.slice(0, paths.length).join('/'));
    }

    if (ParseCollection.isOdd(paths.length) && paths.length > 1) {
      for (let i = paths.length - 2; i >= 0; i--){
        if (ParseCollection.isOdd(i)) {
          const parentClassString = paths[i - 1];
          const parentObjectId = paths[i];

          const parent = Parse.Object.extend(parentClassString);
          const parentObject = new parent();

          parentObject.id = parentObjectId;

          this.parserObject.set(parentClassString, parentObject);
          this.parents.push(parentObject);
        }
      }
    }
  }
}
