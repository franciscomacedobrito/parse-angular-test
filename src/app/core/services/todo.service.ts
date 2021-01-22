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

  getSubTodos(todoId: string): Observable<any[]> {
    return this.fps.collection<any>('todo/' + todoId + '/subTodos').valueChanges();
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

  updateSubTodo(id: string, subTodoId: string, done: boolean): Promise<Parse.Object<Todo>> {
    return this.fps.doc<Todo>('todo/' + id + '/subTodos', subTodoId).set({done});
  }

  deleteTodo(id: string): Promise<Parse.Object<Todo>> {
    return this.fps.doc<Todo>('todo', id).delete();
  }

  deleteSubTodo(todoId: string, subTodoId): Promise<Parse.Object<Todo>> {
    return this.fps.doc<Todo>('todo/' + todoId + '/subTodos', subTodoId).delete();
  }

  createSubTodo(id: string, subTodo: Todo): Promise<Parse.Object<Todo>> {
    return this.fps.collection<Todo>('todo/' + id + '/subTodos').create(subTodo);
  }

  createStore(todoId: string, subTodoId: string, store: any): Promise<Parse.Object<Todo>> {
    return this.fps.collection<Todo>('todo/' + todoId + '/subTodos/' + subTodoId + '/store').create(store);
  }
}
