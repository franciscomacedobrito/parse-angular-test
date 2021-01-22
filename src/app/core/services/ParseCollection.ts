import * as Parse from 'parse';
import {Observable} from 'rxjs';
import {ParseDocument} from './ParseDocument';

export class ParseCollection<T> {
  constructor(path: string, query?: string) {
    const paths = path.split('/');
    const collectionClass = paths[paths.length - 1];

    this.parserObject = Parse.Object.extend(collectionClass);
    this.parseQueryObject = new Parse.Query(this.parserObject).equalTo('path', path);
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
    return new ParseDocument<T>(this.path, id).create(data);
  }

  valueChanges(): Observable<T[]> {
    return new Observable((observer) => {
      const refreshData = async () => {
        const data = await this.get();
        observer.next(ParseCollection.transformData(data));
      };

      this.parseQueryObject.subscribe().then((subscription) => {
        subscription.on('create', refreshData);
        subscription.on('delete', refreshData);
        subscription.on('update', refreshData);
      });

      refreshData();
    });
  }
}
