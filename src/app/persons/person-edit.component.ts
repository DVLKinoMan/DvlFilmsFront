import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Filmography, Person } from './person';
import { Gender, ZodiacSign } from './person-query';
import { PersonsService } from './services/persons.service';

@Component({
  selector: 'app-person-edit',
  templateUrl: './person-edit.component.html',
  styleUrls: ['./person-edit.component.css']
})
export class PersonEditComponent implements OnInit {
  model: Person;
  id: number;
  selectedZodiacSign: string;
  personForm: FormGroup;
  editMode: boolean = false;
  
  selectedFilmographyCatName: string = "";
  filmographyCategoryNames: string[] = [];

  selectedFlmSortBy: string = 'Year';
  sortChoicesForFilms: string[] = ['Year'];
  sortAscending: boolean = false;

  filmographies: Filmography[];

  zodiacSigns: string[] = Object.keys(ZodiacSign).filter(val => isNaN(Number(val)));
  genders: string[] = Object.keys(Gender).filter(val => isNaN(Number(val)));

  constructor(private service: PersonsService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.personForm = this.formBuilder.group({
      sign: ''
    });
    this.route.queryParams.subscribe(
      params => {
        this.selectedFilmographyCatName = params['flmCatName'];
        this.selectedFlmSortBy = params['flmSortBy'] ? params['flmSortBy'] : this.selectedFlmSortBy;
        this.sortAscending = params['flmSortAscending'] ? params['flmSortAscending'] : this.sortAscending;
      }
    );
    this.route.params.subscribe(params=>{
        this.id = params['id'];
        this.loadPerson();
    });
  }

  save(){
    var val = this.model.zodiacSign;
  }

  sortingChanged(){
    this.sortAscending = !this.sortAscending;
    this.loadFilmItems();
  }

  changeQueryParams(){
    this.router.navigate(
      [], 
      {
        relativeTo: this.route,
        queryParams: { 
          flmCatName: this.selectedFilmographyCatName,
          flmSortBy: this.selectedFlmSortBy,
          flmSortAscending: this.sortAscending
        },
        queryParamsHandling: 'merge'
      });
  }

  loadFilmCategories(){
        this.selectedFilmographyCatName ??= this.model.filmographies?.[0].categoryName ?? "";
        this.filmographyCategoryNames = 
        [...new Set(this.model.filmographies?.map(item=>item.categoryName) ?? [])];
  }

  loadFilmItems(){
      if(this.model.filmographies){
          let items: Filmography[] = [];
          let catName = this.selectedFilmographyCatName;
          this.model.filmographies.forEach(function(val){
            if(val.categoryName == catName)
              items.push(val);
          });
          items.sort((a,b) => { 
            switch(this.selectedFlmSortBy){
              case 'Year': 
                return this.sortAscending ? (a.year && (!b.year || a.year < b.year) ? -1 : 1 )
                : (b.year && (!a.year || a.year < b.year) ? 1 : -1 );
              default: throw new Error("Sorting is not Implemented");
            }
          });
          this.filmographies = items;
          this.changeQueryParams();
      }
  }

  loadPerson(){
    this.service.getById(this.id).subscribe(result =>{
          this.model = result;
          if(this.model.profilePicture)
            this.model.profilePicture.image =  'data:image/png;base64,' + this.model.profilePicture.image;
    }, error=>console.log(error));

    this.service.getFilmographies(this.id).subscribe(result =>{
          this.model.filmographies = result;
          if(this.model.filmographies)
            this.model.filmographies.forEach(function(value){
              if(value.filmItem?.photo?.image)
                value.filmItem.photo.image = 'data:image/png;base64,' + value.filmItem.photo.image;
            });
          this.loadFilmItems();
          this.loadFilmCategories();
    }, error=>console.log(error));
  }
}
