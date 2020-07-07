import * as Parse from 'parse';
import {Observable} from 'rxjs';
import {ParseDocument} from './ParseDocument';

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
