import { Injectable } from '@angular/core';
import {ParseService} from './parse.service';
import {Observable} from 'rxjs';
import {Todo} from '../../app.component';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  constructor(private fps: ParseService) {
  }

  getTodos(): Observable<Todo[]> {
    return this.fps.collection<Todo>('todo').valueChanges();
  }

  getTodoById(id: string): Promise<Parse.Object<Todo>> {
    return this.fps.doc<Todo>('todo', id).get();
  }

  listenToChanges(id: string): Observable<Todo> {
    return this.fps.doc<Todo>('todo', id).valueChanges();
  }

  createTodo(todo: Todo): Promise<Parse.Object<Todo>> {
    return this.fps.collection<Todo>('todo').create(todo);
  }

  updateTodo(id: string, done: boolean): Promise<Parse.Object<Todo>> {
    return this.fps.doc<Todo>('todo', id).set({done});
  }

  deleteTodo(id: string): Promise<Parse.Object<Todo>> {
    return this.fps.doc<Todo>('todo', id).delete();
  }

  createSubTodo(id: string, subTodo: Todo): Promise<Parse.Object<Todo>> {
    return this.fps.collection<Todo>('todo/' + id + '/subTodos').create(subTodo);
  }
}
