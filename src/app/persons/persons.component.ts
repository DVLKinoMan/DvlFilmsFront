import { Component, OnInit } from '@angular/core';
import { FilterOperator, IdFilter, NameFilter, PersonFilter, PersonsQuery } from './person-query';
import { PersonsService } from './services/persons.service';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.css']
})
export class PersonsComponent implements OnInit {
some: number = 1;

  constructor(private service: PersonsService) { }

  ngOnInit(): void {
    
  } 

  GetPersons(){ 
    this.some++;  
    var filters: PersonFilter[] = [new IdFilter(12), new NameFilter("", "keira", FilterOperator.Or)];
    var query: PersonsQuery = new PersonsQuery(1, filters);
    this.service.getList(query).subscribe(result => {
      var persons = result;
  }, error => console.error(error));
  }
}
