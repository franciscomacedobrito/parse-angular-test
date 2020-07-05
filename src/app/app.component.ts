import {Component} from '@angular/core';
import {TodoService} from './core/services/todo.service';
import faker from 'faker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'parse-angular-test';

  constructor(private todoService: TodoService) {
    // this.init();
    this.todoService.getTodos().subscribe(data => {
      console.log(data);
    });
  }

  // async init(): Promise<void> {
  //   console.log(await this.todoService.getTodos());
  // }

  createTodo(): void {
    this.todoService.createTodo({name: faker.name.findName(), done: false}).then((data) => {
        console.log(data);
      }, (e) => {
        console.log(e);
      }
    );
  }
}
