import {Component} from '@angular/core';
import {TodoService} from './core/services/todo.service';
import * as faker from 'faker';
import * as Parse from 'parse';
import {ParseService} from './core/services/parse.service';

export interface Todo {
  name: string;
  done: boolean;
  id?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'parse-angular-test';
  todos: Todo[] = [];

  constructor(private todoService: TodoService,
              private fps: ParseService) {
    this.todoService.getTodos().subscribe(data => {
      this.todos = data;
    });
  }

  async createTodo(): Promise<Parse.Object<Todo>> {
    return this.todoService.createTodo({name: faker.name.findName(), done: false});
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

  createUnconnectedDocument(): any {
    const Post = Parse.Object.extend('post');
    const Comment = Parse.Object.extend('comment');
    const myComment = new Comment();

    const post = new Post();
    post.id = 'jKEUG5RQSQ';

    myComment.set('text', 'sasasasas');
    myComment.set('parent', post);

// This will save both myPost and myComment
    myComment.save();
  }
}
