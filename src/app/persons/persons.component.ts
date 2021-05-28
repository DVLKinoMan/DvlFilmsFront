import { Component, OnInit, ViewChild } from '@angular/core';
import { Person } from './person';
import { AgeFilter, FilterOperator, IdFilter, NameFilter, PersonFilter, PersonSelectControlFlags, PersonsQuery } from './person-query';
import { PersonsService } from './services/persons.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

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
  public displayedColumns: string[] = ['id', 'photo', 'name', 'birthDate', 'birthPlace', 
  'heightInMeters', 'awardsInformationString'];
  
  constructor(private service: PersonsService) { }

  ngOnInit(): void {
    this.loadData();
    this.dataSource.data = this.persons;
  } 

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    var pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    this.GetPersons(pageEvent);
}

  GetPersons(event: PageEvent){ 
    var filters: PersonFilter[] = [new AgeFilter(undefined, 23, 26)];
    var query: PersonsQuery = new PersonsQuery(filters, event.pageIndex + 1, event.pageSize,  
      PersonSelectControlFlags.WithPhoto);

    this.service.getList(query).subscribe(result => {
      result.forEach(function(value){
        if(value.photo != undefined)
          value.photo.image =  'data:image/png;base64,' + value.photo.image;
      });
      this.persons = result;
      // this.paginator.pageSize = 10;
      // this.paginator.pageIndex++;
      this.paginator.length = 1000;
  }, error => console.error(error));

  return event;
  }
}
