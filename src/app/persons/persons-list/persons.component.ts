import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AgeFilter, GenderFilter, IdFilter, NameFilter,
  PersonFilter, PersonOrderBy, PersonSelectControlFlags, PersonsQuery, ZodiacSignFilter
} from './person-query';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { Person } from '../person';
import { Gender, ZodiacSign } from '../enums';
import { PersonsService } from '../services/persons.service';
import { PhotosService } from 'src/app/common/services/photos.service';
import { FilterOperator } from 'src/app/common/filter';
import { formatDate } from '@angular/common';
import { PersonBuiltInListsService } from '../services/person-builtIn-lists.service';
import { Gender2StringMapping, ZodiacSign2StringMapping } from 'src/app/common/helpers';
import { PersonOrderBy2StringMapping } from 'src/app/films/helpers';
import { AuthService } from 'src/app/auth/auth.service';
import { UserRole } from 'src/app/auth/user.model';
import { MatDialog } from '@angular/material/dialog';
import { PersonEditDialogComponent } from '../person-edit/person-edit.dialog.component';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.css']
})
export class PersonsComponent implements OnInit {
  public persons: Person[];
  defaultPageIndex: number = 0;
  defaultPageSize: number = 50;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageEvent: PageEvent;
  orderAscending: boolean = true;

  filterNames: string[] = [
    'Id', 'Name', 'Age', 'Gender', 'ZodiacSign'
  ];
  filterOperators: string[] = ['And', 'Or'];
  genders: Gender[] = [Gender.Unknown, Gender.Male, Gender.Female];
  zodiacSigns: ZodiacSign[] = [ZodiacSign.Aquarius, ZodiacSign.Pisces, ZodiacSign.Aries, ZodiacSign.Taurus, ZodiacSign.Gemini,
  ZodiacSign.Cancer, ZodiacSign.Leo, ZodiacSign.Virgo, ZodiacSign.Libra, ZodiacSign.Scorpio, ZodiacSign.Sagittarius, ZodiacSign.Capricorn
  ]
  selectedFilter: string;
  idFilterForm: FormGroup;
  nameFilterForm: FormGroup;
  ageFilterForm: FormGroup;
  genderFilterForm: FormGroup;
  zodiacSignFilterForm: FormGroup;
  filters: PersonFilter[] = [];
  gender2StringMapping = Gender2StringMapping;
  zodiacSign2StringMapping = ZodiacSign2StringMapping;

  personOrderBy: PersonOrderBy = PersonOrderBy.Id;
  orderBys: PersonOrderBy[] = [PersonOrderBy.Name, PersonOrderBy.Age, PersonOrderBy.BirthDate,
  PersonOrderBy.Id, PersonOrderBy.HeightInMeters];
  personOrderBy2StringMapping = PersonOrderBy2StringMapping;

  queryParams: Params;
  isAuthenticated = false;
  canEdit = false;

  constructor(private service: PersonsService,
    private formBuilder: FormBuilder,
    private photosService: PhotosService,
    private authService: AuthService,
    private builtInListsService: PersonBuiltInListsService,
    private addDialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.pageEvent = new PageEvent();
    this.pageEvent.pageIndex = this.defaultPageIndex;
    this.pageEvent.pageSize = this.defaultPageSize;
    this.route.queryParams.subscribe(
      params => {
        this.queryParams = params;
        this.loadData();
      }
    );
    this.idFilterForm = this.formBuilder.group({
      filterOperator: [0, Validators.required],
      id: [null, Validators.required]
    });
    this.nameFilterForm = this.formBuilder.group({
      filterOperator: 0,
      value: '',
      pattern: ''
    });
    this.ageFilterForm = this.formBuilder.group({
      filterOperator: 0,
      value: '',
      start: '',
      end: ''
    });
    this.genderFilterForm = this.formBuilder.group({
      filterOperator: 0,
      gender: '',
    });
    this.zodiacSignFilterForm = this.formBuilder.group({
      filterOperator: 0,
      sign: ''
    });
    this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
      this.canEdit = user && user.role == UserRole.Admin
    });
  }

  ngAfterViewInit() {

  }

  addNewPersonClick() {
    const dialogRef = this.addDialog.open(PersonEditDialogComponent, {
      width: '1000px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
      console.log('The dialog was closed');
    });
  }

  formatDate(dateTime: Date | undefined): string | undefined {
    if (dateTime)
      return formatDate(dateTime, 'yyyy-MM-dd', 'en-US');

    return undefined;
  }

  addToFavorites(person: Person) {
    this.builtInListsService.addToFavorites(person.id).subscribe(res => {
      person.isFavorite = true;
    }, error => {
      console.log(error);
    });
  }

  removeFromFavorites(person: Person) {
    this.builtInListsService.deleteFromFavorites(person.id).subscribe(res => {
      person.isFavorite = false;
    }, error => {
      console.log(error);
    });
  }

  filterChanged(filterName: string) {
    if (this.filters.length != 0) {
      var form = this.getFilterForm(filterName);
      form.addControl('filterOperator', new FormControl());
      form.get('filterOperator')?.setValue(1);
    }
  }

  getFilterForm<FormGroup>(filterName: string) {
    switch (filterName) {
      case 'Id': return this.idFilterForm;
      case 'Name': return this.nameFilterForm;
      case 'Age': return this.ageFilterForm;
      case 'Gender': return this.genderFilterForm;
      case 'ZodiacSign': return this.zodiacSignFilterForm;
      default: throw new Error('filterName not implemented');
    }
  }

  getFilter<PersonFilter>(filterName: string) {
    switch (filterName) {
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

  clearForm(filterName: string) {
    var form = this.getFilterForm(filterName);
    form.reset();
    if (form.controls['filterOperator'])
      form.removeControl('filterOperator');
  }

  pageChanged(event: PageEvent) {
    this.pageEvent = event;
    this.persons = [];
    this.loadData(true);
    return event;
  }

  addFilter() {
    if (!this.selectedFilter)
      return;

    this.filters.push(this.getFilter(this.selectedFilter));
    this.clearForm(this.selectedFilter);
    this.selectedFilter = 'none';
  }

  clearFilters() {
    this.filters = [];
  }

  deleteFilter(index: number) {
    this.filters.splice(index, 1);
    if (index == 0 && this.filters.length > 0)
      this.filters[0].filterOperator = FilterOperator.None;
  }

  searchButtonClick() {
    this.pageEvent.pageIndex = 0;
    this.paginator.pageIndex = 0;
    this.loadData(true);
  }

  getPersonsQuery(notFromRoute: boolean = false): [PersonsQuery, boolean] {
    if (!notFromRoute) {
      var filtersString = this.queryParams['personFilters'];

      var controlFlags = this.queryParams['selectControlFlags'];
      var currPage = this.queryParams['currentPage'];
      var pageSize = this.queryParams['pageSize'];
      var orderBy = this.queryParams['orderBy'] ? this.orderBys[this.queryParams['orderBy']] : PersonOrderBy.Id;
      var orderByAscending = this.queryParams['orderByAscending'] === "true" ? true : false;

      if (controlFlags && currPage && pageSize)
        return [new PersonsQuery(
          filtersString ? this.getPersonFilters(filtersString) : this.filters,
          currPage,
          pageSize,
          orderBy,
          orderByAscending,
          controlFlags), true];
    }

    return [new PersonsQuery(
      this.filters,
      this.pageEvent.pageIndex + 1,
      this.pageEvent.pageSize,
      this.personOrderBy,
      this.orderAscending,
      PersonSelectControlFlags.WithPhoto), false];
  }

  getPersonFilters(obj: any): PersonFilter[] {
    let array: PersonFilter[] = [];
    if (typeof obj == 'string')
      array.push(this.getPersonFilter(obj));
    else
      for (var i = 0; i < obj.length; i++)
        array.push(this.getPersonFilter(obj[i]));

    return array;
  }

  setDefaultProfilePicture(event: any, person: Person) {
    event.target.src = person.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
  }

  getPersonFilter(str: string): PersonFilter {
    var json = JSON.parse(str);
    for (var propName in json) {
      if (propName == 'filterType')
        switch (json[propName]) {
          case 0: return new IdFilter(json['id'], json['filterOperator']);
          case 1: return new NameFilter(json['value'], json['pattern'],
            json['filterOperator']);
          case 4: return new ZodiacSignFilter(json['sign'], json['filterOperator']);
          case 7: return new AgeFilter(json['value'], json['start'],
            json['end'], json['includingEnds'], json['filterOperator']);
          case 8: return new GenderFilter(json['gender'], json['filterOperator']);
          default: throw console.error('not implemented');
        }
    }
    throw console.error('not implemented');
  }

  loadData(notFromRoute: boolean = false) {
    var [query, fromRoute] = this.getPersonsQuery(notFromRoute);
    if (!fromRoute) {
      var params = new HttpParams();
      query.personFilters.forEach(function (value) {
        params = params.append('personFilters', JSON.stringify(value, (key, val) => {
          if (val === null || (typeof val === 'string' && val === ''))
            return undefined;
          return val;
        }));
      });
      this.router.navigate(['/persons'],
        {
          queryParams: {
            personFilters: params.getAll('personFilters'),
            currentPage: query.currentPage,
            orderBy: query.orderBy,
            orderByAscending: query.orderByAscending,
            pageSize: query.pageSize,
            selectControlFlags: query.selectControlFlags
          }
        });
      return;
    }
    this.filters = query.personFilters;
    this.orderAscending = query.orderByAscending;
    this.personOrderBy = query.orderBy;
    this.persons = [];

    this.service.getList(query).subscribe(result => {
      this.persons = result.result;
      this.paginator.length = result.totalCount;
    }, error => console.error(error));
  }
}
