import { Injectable } from '@angular/core';
import {ParseCollection} from './ParseCollection';
import {ParseDocument} from './ParseDocument';

@Injectable({
  providedIn: 'root'
})
export class ParseService {

  constructor() {
  }

  collections = new Map();
  documents = new Map();

  public collection<T>(path: string, query?: any): ParseCollection<T> {
    const savedCollection = this.collections.get(path);
    if (savedCollection) {
      return savedCollection;
    } else {
      const newCollection = new ParseCollection<T>(path);
      this.collections.set(path, newCollection);
      return newCollection;
    }
    // return new ParseCollection<T>(path);
  }

  public doc<T>(path: string, id: string): ParseDocument<T> {
    const savedDocument = this.documents.get(path + id);
    if (savedDocument) {
      return savedDocument;
    } else {
      const newDocument = new ParseDocument<T>(path, id);
      if (newDocument.isNewDocument) {
        this.documents.set(path + newDocument.parserObject.objectId, newDocument);
      } else {
        this.documents.set(path + newDocument.parserObject.id, newDocument);
      }
      return newDocument;
    }
    // return new ParseDocument<T>(path, id);
  }
}
