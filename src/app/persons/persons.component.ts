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
  public dataSource = new MatTableDataSource<Person>();
  persons: Person[];
  public pageEvent: PageEvent;
  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public displayedColumns: string[] = ['id', 'photo', 'name', 'birthDate', 'birthPlace', 
  'heightInMeters', 'awardsInformationString'];
  
  constructor(private service: PersonsService) { }

  ngOnInit(): void {
    this.loadDefaultData();
    this.setPageLength();
    this.dataSource = new MatTableDataSource<Person>(this.persons);
  } 

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDefaultData() {
    var pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    this.loadData(pageEvent);
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

getPersons(sort: Sort){
  var orderBy: PersonOrderBy = this.getOrderBy(sort);

  var filters: PersonFilter[] = [new AgeFilter(undefined, 23, 26)];
  var query: PersonsQuery = new PersonsQuery(filters, this.paginator.pageIndex, this.paginator.pageSize, 
    orderBy, sort.direction === 'asc', 
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

loadData(event: PageEvent){ 
    var filters: PersonFilter[] = [new AgeFilter(undefined, 23, 26)];
    var query: PersonsQuery = new PersonsQuery(filters, event.pageIndex + 1, event.pageSize, 
      PersonOrderBy.Name, true, 
      PersonSelectControlFlags.WithPhoto);

    this.service.getList(query).subscribe(result => {
      result.forEach(function(value){
        if(value.photo != undefined)
          value.photo.image =  'data:image/png;base64,' + value.photo.image;
      });
      this.persons = result;
      // this.setPageLength();
  }, error => console.error(error));

  return event;
  }
}
