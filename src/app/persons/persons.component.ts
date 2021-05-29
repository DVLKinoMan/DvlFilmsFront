import { Component, OnInit, ViewChild } from '@angular/core';
import { Person } from './person';
import { AgeFilter, FilterOperator, IdFilter, NameFilter, PersonFilter, PersonOrderBy, PersonSelectControlFlags, PersonsQuery } from './person-query';
import { PersonsService } from './services/persons.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.css']
})
export class PersonsComponent implements OnInit {
  // public dataSource = new MatTableDataSource<Person>();
  public persons: Person[];
  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageEvent: PageEvent;
  personOrderBy: PersonOrderBy = PersonOrderBy.Id;
  orderAscending: boolean = true;
  
  constructor(private service: PersonsService) { }

  ngOnInit(): void {
    this.loadDefaultData();
    this.setPageLength();
    // this.dataSource = new MatTableDataSource<Person>(this.persons);
  } 

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  loadDefaultData() {
    this.pageEvent = new PageEvent();
    this.pageEvent.pageIndex = this.defaultPageIndex;
    this.pageEvent.pageSize = this.defaultPageSize;
    this.loadData();
}

 setPageLength(){
   //todo change this condition
  //  if(this.paginator.length <= this.defaultPageSize){
        var filters: PersonFilter[] = [new AgeFilter(undefined, 23, 26)];
        var query: PersonsQuery = new PersonsQuery(filters);

        this.service.getCount(query).subscribe(result => {
            this.paginator.length = result;
        }, error => console.error(error));
    // }
}

getOrderBy<PersonOrderBy>(sort: Sort){
    switch(sort.active){
      case 'id': return PersonOrderBy.Id;
      case 'name': return PersonOrderBy.Name;
      case 'birthDate': return PersonOrderBy.BirthDate;
      case 'heightInMeters': return PersonOrderBy.HeightInMeters;
      default: return PersonOrderBy.Id;
    }
}

sortChanged(sort: Sort){
  this.personOrderBy = this.getOrderBy(sort);
  this.orderAscending = sort.direction == 'asc';
  this.loadData();
}

pageChanged(event: PageEvent){ 
  this.pageEvent = event;  
  this.loadData();
  return event;
}

  loadData(){
    var filters: PersonFilter[] = [new AgeFilter(undefined, 23, 26)];
      var query: PersonsQuery = new PersonsQuery(
        filters, this.pageEvent.pageIndex + 1, this.pageEvent.pageSize, 
        this.personOrderBy, this.orderAscending, 
        PersonSelectControlFlags.WithPhoto);

      this.service.getList(query).subscribe(result => {
        result.forEach(function(value){
          if(value.photo != undefined)
            value.photo.image =  'data:image/png;base64,' + value.photo.image;
        });
        this.persons = result;
        // this.setPageLength();
    }, error => console.error(error));
  }
}
