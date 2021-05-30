import { Component, OnInit, ViewChild } from '@angular/core';
import { Person } from './person';
import { AgeFilter, FilterOperator, GenderFilter, IdFilter, NameFilter, PersonFilter, PersonOrderBy, PersonSelectControlFlags, PersonsQuery, ZodiacSign, ZodiacSignFilter } from './person-query';
import { PersonsService } from './services/persons.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

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

  filterNames: string[] = [
    'Id', 'Name', 'Age', 'Gender', 'ZodiacSign'
  ];
  filterOperators: string[] = ['And', 'Or'];
  genders: string[] = ['Male', 'Female'];
  zodiacSigns: string[] = Object.keys(ZodiacSign).filter(val => isNaN(Number(val)));
  selectedFilter: string;
  idFilterForm: FormGroup;
  nameFilterForm: FormGroup;
  ageFilterForm: FormGroup;
  genderFilterForm: FormGroup;
  zodiacSignFilterForm: FormGroup;
  filters: PersonFilter[] = [];

  constructor(private service: PersonsService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.loadDefaultData();
    this.setPageLength();
    this.idFilterForm = this.formBuilder.group({
      id: ''
    });
    this.nameFilterForm = this.formBuilder.group({
      value: '',
      pattern: ''
    });
    this.ageFilterForm = this.formBuilder.group({
      value: '',
      start: '',
      end: ''
    });
    this.genderFilterForm = this.formBuilder.group({
      gender: '',
    });
    this.zodiacSignFilterForm = this.formBuilder.group({
      sign: ''
    });
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
        var query: PersonsQuery = new PersonsQuery(this.filters);

        this.service.getCount(query).subscribe(result => {
            this.paginator.length = result;
        }, error => console.error(error));
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

filterChanged(filterName: string){
    if(this.filters.length != 0){
      var form = this.getFilterForm(filterName);
      form.addControl('filterOperator', new FormControl());
    }
}

getFilterForm<FormGroup>(filterName: string){
  switch(filterName){
    case 'Id': return this.idFilterForm;
    case 'Name': return this.nameFilterForm;
    case 'Age': return this.ageFilterForm;
    case 'Gender': return this.genderFilterForm;
    case 'ZodiacSign': return this.zodiacSignFilterForm;
    default: throw new Error('filterName not implemented');
  }
}

getFilter<PersonFilter>(filterName: string){
    switch(filterName){
      case 'Id': return new IdFilter(this.idFilterForm.controls['id'].value, 
                      this.idFilterForm.controls["filterOperator"]?.value);
      case 'Name': return new NameFilter(this.nameFilterForm.controls['value']?.value,
                  this.nameFilterForm.controls['pattern']?.value,
                  this.nameFilterForm.controls['filterOperator']?.value);
      case 'Age': return new AgeFilter(this.ageFilterForm.controls['value']?.value,
                  this.ageFilterForm.controls['start']?.value,
                  this.ageFilterForm.controls['end']?.value,
                  true,//todo implement includingends
                  this.ageFilterForm.controls['filterOperator']?.value);
      case 'Gender': return new GenderFilter(this.genderFilterForm.controls['gender'].value,
                  this.genderFilterForm.controls['filterOperator']?.value);
      case 'ZodiacSign': return new ZodiacSignFilter(this.zodiacSignFilterForm.controls['sign'].value,
                  this.zodiacSignFilterForm.controls['filterOperator']?.value);
      default: return new IdFilter(1);
    }
}

clearForm(filterName: string){
  var form = this.getFilterForm(filterName);
  form.reset();
  if(form.controls['filterOperator'])
    form.removeControl('filterOperator');
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

addFilter(){
  if(!this.selectedFilter)
    return;

  this.filters.push(this.getFilter(this.selectedFilter));
  this.clearForm(this.selectedFilter);
  this.selectedFilter = 'none';
}

clearFilters(){
  this.filters = [];
}

deleteFilter(index: number){
  this.filters.splice(index,1);
  if(index == 0 && this.filters.length > 0)
    this.filters[0].filterOperator = FilterOperator.None;
}

searchButtonClick(){
  this.pageEvent.pageIndex = 0;
  this.paginator.pageIndex = 0;
  this.loadData();
  this.setPageLength();
}

  loadData(){
      var query: PersonsQuery = new PersonsQuery(
        this.filters, this.pageEvent.pageIndex + 1, this.pageEvent.pageSize, 
        this.personOrderBy, this.orderAscending, 
        PersonSelectControlFlags.WithPhoto);

      this.service.getList(query).subscribe(result => {
        result.forEach(function(value){
          if(value.photo != undefined)
            value.photo.image =  'data:image/png;base64,' + value.photo.image;
        });
        this.persons = result;
    }, error => console.error(error));
  }
}
