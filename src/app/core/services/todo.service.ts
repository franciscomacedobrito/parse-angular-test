import { Injectable } from '@angular/core';
import {FaxiParserService} from './faxi-parser.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  constructor(private fps: FaxiParserService) {
  }

  getTodos(): Observable<any> {
    return this.fps.collection('Todo').valueChanges();
  }

  createTodo(todo): Promise<any> {
    return this.fps.collection('Todo').create(todo);
  }

}
