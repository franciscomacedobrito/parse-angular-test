import {Component} from '@angular/core';
import {TodoService} from './core/services/todo.service';
import * as faker from 'faker';
import * as Parse from 'parse';
import {CloudTestService} from './core/services/cloud-test.service';

export interface Todo {
  name: string;
  done: boolean;
  id?: string;
  subTodos?: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'parse-angular-test';
  todos: Todo[] = [];
  private socket: any;

  constructor(private todoService: TodoService,
              private cloudTestService: CloudTestService) {
    this.todoService.getTodos().subscribe(data => {
      data.forEach(todo => {
        this.todoService.getSubTodos(todo.id).subscribe(subTodos => {
          todo.subTodos = subTodos;
        });
      });
      this.todos = data;
    });
  }

  async createTodo(): Promise<Parse.Object<Todo>> {
    return this.todoService.createTodo({name: faker.name.findName(), done: false});
  }

  trackById(index, item): any {
    return item.id;
  }

  deleteTodo(todo: Todo): void {
    this.todoService.deleteTodo(todo.id);
  }

  toggleTodo(todo: Todo): void {
    todo.done = !todo.done;
    this.todoService.updateTodo(todo.id, todo.done);
  }

  getTodoById(todo: Todo): void {
    this.todoService.listenToChanges(todo.id).subscribe(data => {
      console.log('a change happened on: ', data);
    });
  }

  addSubTodo(todo: Todo): Promise<Parse.Object<any>> {
    return this.todoService.createSubTodo(todo.id, {name: faker.company.companyName(), done: false});
  }

  createStore(todo, subTodo: any): any {
    return this.todoService.createStore(todo.id, subTodo.id, {name: faker.company.companyName(), done: false});
  }

  deleteSubTodo(todo: Todo, subTodo: any): any {
    return this.todoService.deleteSubTodo(todo.id, subTodo.id);
  }

  toggleSubTodo(todo: Todo, subTodo: any): any {
    subTodo.done = !subTodo.done;
    this.todoService.updateSubTodo(todo.id, subTodo.id, subTodo.done);
  }

  sendMessage(): any {
    this.cloudTestService.getCalculateSomething().subscribe(data => {
      console.log(data);
    });
  }
}
